"use strict";
Object.defineProperties(exports, {
  abletonSender: {get: function() {
      return abletonSender;
    }},
  abletonReceiver: {get: function() {
      return abletonReceiver;
    }},
  __esModule: {value: true}
});
var $__time__,
    $__lib_47_wu__,
    $__lib_47_logger__;
var t = ($__time__ = require("./time"), $__time__ && $__time__.__esModule && $__time__ || {default: $__time__}).t;
var wu = ($__lib_47_wu__ = require("./lib/wu"), $__lib_47_wu__ && $__lib_47_wu__.__esModule && $__lib_47_wu__ || {default: $__lib_47_wu__}).wu;
var osc = require("osc");
var Bacon = require("baconjs");
var log = ($__lib_47_logger__ = require("./lib/logger"), $__lib_47_logger__ && $__lib_47_logger__.__esModule && $__lib_47_logger__ || {default: $__lib_47_logger__}).default;
var oscToBaconStream = function(udpPort) {
  return Bacon.fromBinder(function(sink) {
    udpPort.on("message", (function(m) {
      return sink(m);
    }));
    return function() {
      console.log("baconunsubscribe");
    };
  });
};
var noteOffTracker = function(seqName, outPort, baconReset, notePlayer) {
  var noteOn = notePlayer.noteOn;
  var noteOff = notePlayer.noteOff;
  var currentOn = {};
  baconReset.take(1).onValue((function() {
    for (var $__3 = Object.keys(currentOn)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__4; !($__4 = $__3.next()).done; ) {
      let n = $__4.value;
      notePlayer.noteOff(seqName, outPort, n);
    }
    currentOn = {};
  }));
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
  };
};
var AbletonReceiver = function(inPort) {
  var baconTime = new Bacon.Bus();
  var udpPort = new osc.UDPPort({
    localAddress: "127.0.0.1",
    localPort: inPort
  });
  udpPort.open();
  console.log("starting OSC Ableton receiver on port", inPort);
  var oscMessageIn = oscToBaconStream(udpPort);
  var codeChange = oscMessageIn.filter((function(message) {
    return message.address == "/codeChange";
  })).map((function(oscBundle) {
    return oscBundle.args[0];
  }));
  oscMessageIn.filter((function(message) {
    return message.address == "/abletonTime";
  })).map((function(message) {
    return message.args[0];
  })).skipDuplicates().onValue(function(v) {
    baconTime.push(v);
  });
  var lzString = require("lz-string");
  var clipNotes = oscMessageIn.filter((function(message) {
    return message.address == "/abletonClipNotes";
  })).map((function(message) {
    return JSON.parse(lzString.decompressFromBase64(message.args[0]));
  }));
  clipNotes.log("oscClipNotes");
  var playingClipNotes = oscMessageIn.filter((function(message) {
    return message.address == "/playingClipNotes";
  })).map((function(message) {
    return ({
      clip: JSON.parse(lzString.decompressFromBase64(message.args[0])),
      port: message.args[1]
    });
  }));
  playingClipNotes.log("oscClipNotes");
  var sequencePlayRequests = oscMessageIn.filter((function(message) {
    return message.address == "/requestSequence";
  })).map((function(v) {
    var seqPath = v.args[0];
    console.log("got subscribe request from ableton", seqPath);
    return {
      name: seqPath.split("/")[1],
      device: seqPath.split("/")[0],
      path: seqPath,
      port: v.args[1]
    };
  }));
  var baconParam = wu.curryable((function(deviceName, name) {
    return oscMessageIn.filter((function(message) {
      return message.address.startsWith("/param/" + name) && message.args[2].split("/")[0] === deviceName;
    })).map((function(message) {
      return message.args[0];
    })).toProperty();
  }));
  var timeInBeats = baconTime.map((function(time) {
    return time / t.beats(1);
  }));
  return {
    time: timeInBeats,
    param: baconParam,
    codeChange: codeChange,
    clipNotes: clipNotes,
    playingClipNotes: playingClipNotes,
    sequencePlayRequests: sequencePlayRequests
  };
};
var AbletonSender = function(outPort) {
  var udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 55555
  });
  console.log("starting OSC Ableton sender to port", outPort);
  udpPort.open();
  var noteOn = wu.curryable(function(seqPath, outPort, pitch, velocity, time) {
    console.log("noteOn", seqPath, pitch, time * t.beats(1));
    udpPort.send({
      address: "/midiNote",
      args: [seqPath, pitch, Math.floor(velocity * 127), 1, time * t.beats(1)]
    }, "127.0.0.1", outPort);
  });
  var noteOff = wu.curryable(function(seqPath, outPort, pitch, time) {
    udpPort.send({
      address: "/midiNote",
      args: [seqPath, pitch, 0, 0, time * t.beats(1)]
    }, "127.0.0.1", outPort);
  });
  var param = wu.curryable(function(seqPath, outPort, name, val, time) {
    udpPort.send({
      address: "/param",
      args: [seqPath, name, name == "pitchBend" ? Math.floor(val * 127) : val, time * t.beats(1)]
    }, "127.0.0.1", outPort);
  });
  var baconInstrumentBus = new Bacon.Bus();
  baconInstrumentBus.onValue((function(v) {}));
  var generatorUpdate = function(generatorList) {
    console.log("sending generatorUpdate to Ableton".bold, (generatorList.map((function(g) {
      return g.device + "/" + g.name;
    }))).yellow);
    udpPort.send({
      address: "/generatorList",
      args: generatorList.map((function(g) {
        return g.device + "/" + g.name;
      }))
    }, "127.0.0.1", outPort);
  };
  return {
    instrument: function(seqPath) {
      return {
        noteOn: noteOn(seqPath, outPort),
        noteOff: noteOff(seqPath, outPort),
        param: param(seqPath, outPort)
      };
    },
    subscribeInstrument: function(seqPath, listenerPort) {
      return {
        noteOn: noteOn(seqPath, listenerPort),
        noteOff: noteOff(seqPath, listenerPort),
        param: param(seqPath, listenerPort)
      };
    },
    noteOn: noteOn,
    noteOff: noteOff,
    param: param,
    generatorUpdate: generatorUpdate
  };
};
var abletonSender = AbletonSender(8916);
var abletonReceiver = AbletonReceiver(8895);
