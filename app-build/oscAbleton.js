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
    $__wu__;
var t = ($__time__ = require("./time"), $__time__ && $__time__.__esModule && $__time__ || {default: $__time__}).t;
var wu = ($__wu__ = require("./wu"), $__wu__ && $__wu__.__esModule && $__wu__ || {default: $__wu__}).wu;
var osc = require("osc");
var Bacon = require("baconjs");
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
    for (var $__2 = Object.keys(currentOn)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__3; !($__3 = $__2.next()).done; ) {
      var n = $__3.value;
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
  var sequencePlayRequests = oscMessageIn.filter((function(message) {
    return message.address == "/requestSequence";
  })).map((function(v) {
    return {
      sequenceName: v.args[0],
      port: v.args[1]
    };
  }));
  var baconParam = (function(name) {
    return oscMessageIn.filter((function(message) {
      return message.address.startsWith("/param/" + name);
    })).map((function(message) {
      return message.args[0];
    })).toProperty();
  });
  baconParam("1").onValue((function(v) {
    return console.log("baconvalue", v);
  }));
  var timeInBeats = baconTime.map((function(time) {
    return time / t.beats(1);
  }));
  return {
    time: timeInBeats,
    param: baconParam,
    codeChange: codeChange,
    clipNotes: clipNotes,
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
  var noteOn = wu.curryable(function(seqName, outPort, pitch, velocity, time) {
    udpPort.send({
      address: "/midiNote",
      args: [seqName, pitch, Math.floor(velocity * 127), 1, time * t.beats(1)]
    }, "127.0.0.1", outPort);
  });
  var noteOff = wu.curryable(function(seqName, outPort, pitch, time) {
    udpPort.send({
      address: "/midiNote",
      args: [seqName, pitch, 0, 0, time * t.beats(1)]
    }, "127.0.0.1", outPort);
  });
  var param = wu.curryable(function(seqName, outPort, name, val, time) {
    udpPort.send({
      address: "/param",
      args: [seqName, name, name == "pitchBend" ? Math.floor(val * 127) : val, time * t.beats(1)]
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
        return g.name;
      }))
    }, "127.0.0.1", outPort);
  };
  return {
    instrument: function(seqName) {
      return {
        noteOn: noteOn(seqName, outPort),
        noteOff: noteOff(seqName, outPort),
        param: param(seqName, outPort)
      };
    },
    subscribeInstrument: function(seqName, listenerPort) {
      return {
        noteOn: noteOn(seqName, listenerPort),
        noteOff: noteOff(seqName, listenerPort),
        param: param(seqName, listenerPort)
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
