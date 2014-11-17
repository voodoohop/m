import {t} from "./time";

import timeInterpolator from "./timeInterpolator";

import {wu} from "./wu";

var osc = require("osc");

var Bacon = require("baconjs");

var oscToBaconStream = function(udpPort) {

  return Bacon.fromBinder(function(sink) {
    udpPort.on("message", (m) => sink(m));
    return function(){console.log("baconunsubscribe")};
  });

}


export var AbletonReceiver = function(inPort) {

  var baconTime = new Bacon.Bus();

  var udpPort = new osc.UDPPort({
      localAddress: "127.0.0.1",
      localPort: inPort
  });

  udpPort.open();


  //udpPort.on("message", (m) => console.log(m));

  console.log("starting OSC Ableton receiver on port",inPort);

  var oscMessageIn = oscToBaconStream(udpPort);

  var codeChange = oscMessageIn.filter((message) => message.address == "/codeChange").map((oscBundle) => oscBundle.args[0]);


  oscMessageIn.filter((message) => message.address == "/abletonTime").map((message) => message.args[0]).skipDuplicates().onValue(function(v){
    baconTime.push(v);
  });

  var lzString = require("lz-string");
  var clipNotes = oscMessageIn.filter((message) => message.address == "/abletonClipNotes").map((message) => JSON.parse(lzString.decompressFromBase64(message.args[0])));
  clipNotes.log("oscClipNotes");
  // oscMessageIn.onValue(function(v) {
  //   console.log("osc",v);
  // });
  //oscMessageIn.log("osc");

  // TODO: use scan instead of onValue
  var sequencePlayRequests = oscMessageIn.filter((message) => message.address == "/requestSequence")
    .map((v) => {return {sequenceName: v.args[0], port: v.args[1]}})


  var baconParam = (name) => oscMessageIn
    .filter((message) => message.address.startsWith("/param/"+name))
    .map((message) => message.args[0]).toProperty();


  baconParam("1").onValue((v) => console.log("baconvalue",v));

//  var timeInBeats = timeInterpolator(baconTime.map((time) => time/t.beats(1)));
var timeInBeats = baconTime.map((time) => time/t.beats(1));

  return {
    time: timeInBeats,
    param:  baconParam,
    codeChange: codeChange,
    clipNotes:clipNotes,
    sequencePlayRequests: sequencePlayRequests
  }

}


export var AbletonSender = function(outPort) {
  var udpPort = new osc.UDPPort({
      localAddress: "0.0.0.0",
      localPort: 55555
  });

  console.log("starting OSC Ableton sender to port",outPort);


  // Open the socket.

  udpPort.open();
  // Send an OSC message to, say, SuperCollider


  // var play = wu.curryable(function(seqName, baconTime, evt) {
  //   if (evt.continuousPlay) {
  //
  //   }
  // });

  var noteOn = wu.curryable(function(seqName,outPort,pitch,velocity,time) {
    console.log("noteOn",pitch,time*t.beats(1));
    udpPort.send({
        address: "/midiNote",
        args: [seqName, pitch, Math.floor(velocity*127), 1,time*t.beats(1)]
    }, "127.0.0.1", outPort);
    // udpPort.send({
    //   address: "/codeUpdate",
    //   args: ["while(true) {console.log(\'hlo\');\n}"+Math.random()],
    // },"127.0.0.1", outPort);
  });


  var noteOff = wu.curryable(function(seqName,outPort,pitch,time) {
  console.log("noteOff",pitch,time*t.beats(1));

    udpPort.send({
      address: "/midiNote",
      args: [seqName,pitch, 0, 0,time*t.beats(1)]
    }, "127.0.0.1", outPort);
  });

  var param=wu.curryable(function(seqName,outPort,name,val,time) {
    console.log("automation",seqName,name,val);
    udpPort.send({
      address: "/param",
      args:[seqName,name, Math.floor(val*127),time*t.beats(1)]
    },"127.0.0.1", outPort);
  });

  var baconInstrumentBus = new Bacon.Bus();

  baconInstrumentBus.onValue((v) => {

  });

  // var diffTime = null;

  var generatorUpdate=function(generatorList) {
    udpPort.send({
      address:"/generatorList",
      args: generatorList
    }, "127.0.0.1", outPort);
  };

  return {
    instrument: function(seqName) {
      return {
        noteOn: noteOn(seqName,outPort),
        noteOff: noteOff(seqName,outPort),
        param: param(seqName,outPort)
      }
    },
    subscribeInstrument: function(seqName, listenerPort) {
      return {
        noteOn: noteOn(seqName,listenerPort),
        noteOff: noteOff(seqName,listenerPort),
        param: param(seqName,listenerPort)
      }
    },
    noteOn: noteOn,
    noteOff: noteOff,
    param:param,
    generatorUpdate:generatorUpdate,
    // usedTime: function(baconTime) {
    //   diffTime = baconTime;
    // }

  }
}
