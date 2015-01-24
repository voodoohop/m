import {
  t
}
from "./time";

// import timeInterpolator from "./timeInterpolator";

import {
  wu
}
from "./lib/wu";

var osc = require("osc");

var Bacon = require("baconjs");

import log from "./lib/logger";

var oscToBaconStream = function(udpPort) {

  return Bacon.fromBinder(function(sink) {
    udpPort.on("message", (m) => sink(m));
    return function() {
      console.log("baconunsubscribe")
    };
  });

}

var noteOffTracker = function(seqName, outPort, baconReset, notePlayer) {
  var noteOn = notePlayer.noteOn;
  var noteOff = notePlayer.noteOff;
  var currentOn = {};
  baconReset.take(1).onValue(() => {
    for (let n of Object.keys(currentOn)) notePlayer.noteOff(seqName, outPort, n);
    currentOn = {};
  })
  return {
    noteOn: wu.curryable(function(pitch, velocity, time) {
      currentOn[pitch] = true;
      return notePlayer.noteOn(seqName, outPort, pitch, velocity, time);
    }),
    noteOff: wu.curryable(function(pitch, time) {
      delete currentOn[pitch];
      return notePlayer.noteOff(seqName, outPort, pitch, time);
    }),
    param: notePlayer.param
  }

};


var AbletonReceiver = function(inPort) {

  var baconTime = new Bacon.Bus();

  var udpPort = new osc.UDPPort({
    localAddress: "127.0.0.1",
    localPort: inPort
  });

  udpPort.open();


  //udpPort.on("message", (m) => console.log(m));

  console.log("starting OSC Ableton receiver on port", inPort);

  var oscMessageIn = oscToBaconStream(udpPort);

  var codeChange = oscMessageIn.filter((message) => message.address == "/codeChange").map((oscBundle) => oscBundle.args[0]);



  // oscMessageIn.onValue(v => console.log("oscval",v));
  oscMessageIn.filter((message) => message.address == "/abletonTime").map((message) => message.args[0]).skipDuplicates().onValue(function(v) {
    baconTime.push(v);
  });

  var lzString = require("lz-string");
  var clipNotes = oscMessageIn.filter((message) => message.address == "/abletonClipNotes").map((message) => JSON.parse(lzString.decompressFromBase64(message.args[0])));
  clipNotes.log("oscClipNotes");
  var playingClipNotes = oscMessageIn.filter((message) => message.address == "/playingClipNotes").map((message) =>
    ({
      clip: JSON.parse(lzString.decompressFromBase64(message.args[0])),
      port: message.args[1]
    })
  );
  playingClipNotes.log("oscClipNotes");


  // oscMessageIn.onValue(function(v) {
  //   console.log("osc",v);
  // });
  //oscMessageIn.log("osc");

  // TODO: use scan instead of onValue
  var sequencePlayRequests = oscMessageIn.filter((message) => message.address == "/requestSequence")
    .map((v) => {
      var seqPath = v.args[0];
      console.log("got subscribe request from ableton", seqPath);
      return {
        name: seqPath.split("/")[1],
        device: seqPath.split("/")[0],
        path: seqPath,
        port: v.args[1]
      }
    })


  var baconParam = wu.curryable((deviceName, name) => oscMessageIn
    .filter((message) => message.address.startsWith("/param/" + name) && message.args[2].split("/")[0] === deviceName)
    .map((message) => message.args[0]).toProperty());


  //  baconParam("1").onValue((v) => console.log("baconvalue", v));

  //  var timeInBeats = timeInterpolator(baconTime.map((time) => time/t.beats(1)));
  var timeInBeats = baconTime.map((time) => time / t.beats(1));

  return {
    time: timeInBeats,
    param: baconParam,
    codeChange: codeChange,
    clipNotes: clipNotes,
    playingClipNotes: playingClipNotes,
    sequencePlayRequests: sequencePlayRequests,
  }

}


var AbletonSender = function(outPort) {
  var udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 55555
  });

  console.log("starting OSC Ableton sender to port", outPort);


  // Open the socket.

  udpPort.open();
  // Send an OSC message to, say, SuperCollider


  // var play = wu.curryable(function(seqName, baconTime, evt) {
  //   if (evt.continuousPlay) {
  //
  //   }
  // });

  var noteOn = wu.curryable(function(seqPath, outPort, pitch, velocity, time) {
    console.log("noteOn", seqPath, pitch, time * t.beats(1));
    udpPort.send({
      address: "/midiNote",
      args: [seqPath, pitch, Math.floor(velocity * 127), 1, time * t.beats(1)]
    }, "127.0.0.1", outPort);
    // udpPort.send({
    //   address: "/codeUpdate",
    //   args: ["while(true) {console.log(\'hlo\');\n}"+Math.random()],
    // },"127.0.0.1", outPort);
  });


  var noteOff = wu.curryable(function(seqPath, outPort, pitch, time) {
    // console.log("noteOff",pitch,time*t.beats(1));

    udpPort.send({
      address: "/midiNote",
      args: [seqPath, pitch, 0, 0, time * t.beats(1)]
    }, "127.0.0.1", outPort);
  });

  var param = wu.curryable(function(seqPath, outPort, name, val, time) {
    // console.log("automation",seqName,name,val,outPort);
    udpPort.send({
      address: "/param",
      args: [seqPath, name, name == "pitchBend" ? Math.floor(val * 127) : val, time * t.beats(1)]
    }, "127.0.0.1", outPort);
  });

  var baconInstrumentBus = new Bacon.Bus();

  baconInstrumentBus.onValue((v) => {

  });

  // var diffTime = null;

  var generatorUpdate = function(generatorList) {
    console.log("sending generatorUpdate to Ableton".bold, (generatorList.map(g => g.device + "/" + g.name)).yellow);
    udpPort.send({
      address: "/generatorList",
      args: generatorList.map(g => g.device + "/" + g.name)
    }, "127.0.0.1", outPort);
  };

  return {
    instrument: function(seqPath) {
      return {
        noteOn: noteOn(seqPath, outPort),
        noteOff: noteOff(seqPath, outPort),
        param: param(seqPath, outPort)
      }
    },
    subscribeInstrument: function(seqPath, listenerPort) {
      return {
        noteOn: noteOn(seqPath, listenerPort),
        noteOff: noteOff(seqPath, listenerPort),
        param: param(seqPath, listenerPort)
      }
    },
    noteOn: noteOn,
    noteOff: noteOff,
    param: param,
    generatorUpdate: generatorUpdate,
    // usedTime: function(baconTime) {
    //   diffTime = baconTime;
    // }

  }
}


export var abletonSender = AbletonSender(8916);
export var abletonReceiver = AbletonReceiver(8895);
