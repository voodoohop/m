"use strict";
autowatch = 1;
inlets = 2;
outlets = 3;
function anything(val) {
  log(messagename + " " + val + "\n");
}
;
var userFunc = null;
var scheduledEvents = Lazy();
var userFuncUpdated = false;
function text(code) {
  log("code:", code);
  var es5code = traceur.Compiler.script(code);
  console.log("compiled", es5code);
  userFunc = new Function("log", "time", "osc", "events", "control", "sequencer", es5code);
  let beautified = js_beautify(code, {indent_size: 2});
  log("beautified", beautified);
  outlet(1, ["set", code]);
  userFuncUpdated = true;
}
;
function getDeviceParamController() {
  return function(param, value) {
    outlet(0, "param" + param + " " + (value * 127));
  };
}
function neighbourPath(this_device, offset) {
  var path = this_device.path.split(" ");
  log(path);
  var rightDeviceNo = path[path.length - 1];
  path[path.length - 1] = "" + (parseInt(rightDeviceNo) + offset);
  log(path);
  var newPath = path.join(" ");
  return newPath;
}
var syncedOscillators = function() {
  var globalTime = 0;
  var syncedOscs = {};
  Object.keys(OZ).forEach(function(key) {
    syncedOscs[key] = function(rate, optionalTime) {
      var osc = OZ[key];
      var time = (arguments.length > 1 ? optionalTime : globalTime);
      return osc(time, rate);
    };
  });
  syncedOscs.updateTime = function(time) {
    globalTime = time;
  };
  return syncedOscs;
};
var tickListeners = [];
function tick(rawTicks) {
  if (tickListeners == null)
    return;
  tickListeners.forEach(function(listener) {
    listener(rawTicks);
  });
}
var oscillators = function(gTime) {
  var syncedOscs = {};
  Object.keys(OZ).forEach(function(key) {
    syncedOscs[key] = function(rate, optionalTime) {
      var osc = OZ[key];
      var time = (arguments.length > 1 ? optionalTime : gTime);
      return osc(time, rate);
    };
  });
  return syncedOscs;
};
function getUserNoteScheduler() {}
var playingNotes = null;
function userNote(pitch, velocity, startTime, duration) {
  if (!playingNotes)
    playingNotes = new Map();
  playingNotes.set();
}
function controlSequenceGenerator(time) {
  var control = {};
  function controlValues(c, v) {
    control[c] = v;
  }
  control.time = time;
  userFunc(log, time, oscillators(time), scheduledEvents, controlValues, tomSequencer);
  return control;
}
Lazy.ArrayLikeSequence.define("controlSequence", {
  init: function() {},
  get: function(i) {
    return controlSequenceGenerator(i / 1000.0);
  },
  length: function() {
    return undefined;
  }
});
var remoteParamCount = 8;
function mapDevice(path) {
  for (var i = 1; i <= remoteParamCount; i++) {
    var right_device_param = new LiveAPI(path + " parameters " + i);
    outlet(0, "param" + i + " id " + right_device_param.id);
    log("mapped param with id" + right_device_param.id);
  }
}
function midiInstrument() {
  let playingNotes = new Set();
  return {play: (function(event) {
      playingNotes.add(event);
      outlet(2, [event.pitch, event.velocity]);
    })};
}
function deviceReady() {
  tickListeners = [];
  log("device ready, initing!");
  var this_device = new LiveAPI("this_device");
  var rightPath = neighbourPath(this_device, 1);
  mapDevice(rightPath);
  paramController = getDeviceParamController();
  var syncedOscs = syncedOscillators();
  song = new LiveAPI("live_set");
  var currentTime = -1;
  var TomMusicScheduler = function() {
    return {getNextStartTime: (function() {
        return Math.floor(currentTime + 1);
      })};
  };
  var tomSequencer = TomSequencer(TomMusic, TomMusicScheduler(), midiInstrument());
  function timeChanged(globalTime) {
    currentTime = globalTime / 1000.0;
    if (userFuncUpdated) {
      userFuncUpdated = false;
      log("evaluating user function");
      userFunc(log, currentTime, oscillators(currentTime), scheduledEvents, null, tomSequencer.createSequence);
    }
    tomSequencer.triggerEvents(currentTime);
    return;
    console.log(globalTime, userControlSequence.get(Math.floor(globalTime)));
  }
  tickListeners.push(timeChanged);
}
