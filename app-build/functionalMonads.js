"use strict";
Object.defineProperties(exports, {
  m: {get: function() {
      return m;
    }},
  CarimboNaRoca: {get: function() {
      return CarimboNaRoca;
    }},
  kick: {get: function() {
      return kick;
    }},
  tom: {get: function() {
      return tom;
    }},
  hat: {get: function() {
      return hat;
    }},
  kick_real: {get: function() {
      return kick_real;
    }},
  __esModule: {value: true}
});
var $__functionalM_47_baseLib__,
    $__functionalM_47_baseFunctionalGens__,
    $__functionalM_47_genexporters__,
    $__functionalM_47_musicalGens__;
var mImported = ($__functionalM_47_baseLib__ = require("./functionalM/baseLib"), $__functionalM_47_baseLib__ && $__functionalM_47_baseLib__.__esModule && $__functionalM_47_baseLib__ || {default: $__functionalM_47_baseLib__}).m;
($__functionalM_47_baseFunctionalGens__ = require("./functionalM/baseFunctionalGens"), $__functionalM_47_baseFunctionalGens__ && $__functionalM_47_baseFunctionalGens__.__esModule && $__functionalM_47_baseFunctionalGens__ || {default: $__functionalM_47_baseFunctionalGens__});
($__functionalM_47_genexporters__ = require("./functionalM/genexporters"), $__functionalM_47_genexporters__ && $__functionalM_47_genexporters__.__esModule && $__functionalM_47_genexporters__ || {default: $__functionalM_47_genexporters__});
($__functionalM_47_musicalGens__ = require("./functionalM/musicalGens"), $__functionalM_47_musicalGens__ && $__functionalM_47_musicalGens__.__esModule && $__functionalM_47_musicalGens__ || {default: $__functionalM_47_musicalGens__});
var assert = require("assert");
var m = mImported;
var _ = require("lodash");
console.log("mprototype", m.prototype);
var mTest = m({pitch: 10}).loop();
console.log("------", "" + mTest);
console.log("------", mTest.take(10).toArray());
console.log(mTest.take(20).toArray().length);
console.log(mTest.take(2).toArray());
console.log(mTest.take(5).toArray());
assert.equal(mTest.take(1).toArray()[0].pitch, 10);
assert.equal(mTest.take(20).toArray().length, 20);
var mEvtTest = m().evt({
  pitch: 10,
  velocity: [0.7, 0.8]
});
console.log(mEvtTest.take(10).toArray());
var test3 = m().count();
var countRes = test3.skip(10).take(10).simpleMap((function(n) {
  return n / 4;
})).toArray();
console.log("countRes", countRes);
assert.equal(countRes[countRes.length - 1], 4.75);
var eventCount = m().evt({
  pitch: 60,
  velocity: [20, 30]
}).eventCount().take(20);
console.log("evtCountToArray", eventCount.toArray());
assert.equal(_.last(eventCount.toArray()).count, 19);
assert.equal(_.last(eventCount.toArray()).count, 19);
assert.equal(_.last(eventCount.simpleMap((function(e) {
  return e.set("pitch", e.pitch + 10);
})).simpleMap((function(e) {
  return e.set({
    duration: 0.2,
    pitch: e.pitch + 10
  });
})).toArray()).pitch, 80);
assert.equal(eventCount.prop("color", "turquoise").skip(3).takeWhile((function(e) {
  return e.count < 5;
})).toArray()[0].count, 3);
var test4 = m().evt({pitch: 30}).duration(20);
console.log(test4.take(10).toArray());
console.log("---tests---");
var testMap = m().evt({
  pitch: 60,
  duration: 0.3,
  velocity: 1
}).metro(4).automate("param1", (function(n) {
  return 0.5;
})).automate("param2", (function(n) {
  return 0.2;
})).take(10);
console.log(testMap.take(10).toArray());
var CarimboNaRoca = m().data([{
  "pitch": 57,
  "duration": 7.99,
  "velocity": 0.7,
  "time": 0,
  "color": "yellow"
}, {
  "pitch": 64,
  "duration": 7.99,
  "velocity": 0.7,
  "time": 8,
  "color": "red"
}]).loopLength(16);
console.log("CarimboNaRocaTest", CarimboNaRoca.toPlayable().take(20).toArray());
var lowerNotes = CarimboNaRoca.groupByTime().simpleMap((function(n) {
  var meNote = n[0];
  return meNote;
})).map((function(n) {
  return m([n, n, n, n, n]);
})).pitch((function(n) {
  return n.pitch;
})).duration(1).delay([1, 3, 4, 5, 7]);
console.log("CarimboNaRocaTest2", lowerNotes.take(20).toArray());
var kickGrid = 2;
var kick = m().evt({
  pitch: [54, 60, 65],
  velocity: 0.9,
  duration: kickGrid - 0.5
}).metro(kickGrid).automate("pitchBend", (function(n) {
  return Math.sin((n.time + n.target.time) * Math.PI / 1) / 4 + 0.5;
}));
var tom = m().evt({
  pitch: 60,
  velocity: 0.7,
  duration: 0.1,
  color: "yellow"
}).metro(0.2).bjorklund(16, 9, 2);
var log = console.log;
var hat = m().evt({
  pitch: [48, 60],
  velocity: [0.3, 0.5, 0.7, 0.3, 0.6],
  duration: 0.1
}).metro(0.25).bjorklund(4, 3, 0).swing(1 / 4, 0.15);
var kick_real = m().evt({
  pitch: 60,
  velocity: [0.9, 0.7, 0.8],
  duration: 0.1
}).metro(1);
var microtime = require("microtime");
var profilerDataStore = [];
var profileSamples = 200;
var startTime = microtime.nowDouble();
for (var $__1 = kick.toPlayable().take(profileSamples)[$traceurRuntime.toProperty(Symbol.iterator)](),
    $__2; !($__2 = $__1.next()).done; ) {
  var n = $__2.value;
  {
    var x = ({
      time: n.time,
      pitch: n.pitch,
      veloctiy: n.velocity,
      type: n.type
    });
  }
}
var timeTaken = microtime.nowDouble() - startTime;
log("time:", timeTaken);
log("-------------".bgRed);
console.log(kick.toPlayable().take(50).toArray()[49]);
for (var $__3 = tom.toPlayable().take(profileSamples)[$traceurRuntime.toProperty(Symbol.iterator)](),
    $__4; !($__4 = $__3.next()).done; ) {
  var n = $__4.value;
  {
    var cx = ({
      time: n.time,
      pitch: n.pitch,
      veloctiy: n.velocity
    });
  }
}
timeTaken = microtime.nowDouble() - startTime;
log("time:", timeTaken);
for (var $__5 = tom.toPlayable().take(profileSamples)[$traceurRuntime.toProperty(Symbol.iterator)](),
    $__6; !($__6 = $__5.next()).done; ) {
  var n = $__6.value;
  {
    var x = ({
      time: n.time,
      pitch: n.pitch,
      veloctiy: n.velocity,
      type: n.type
    });
    x = ({
      time: n.time,
      pitch: n.pitch,
      veloctiy: n.velocity,
      type: n.type
    });
    x = ({
      time: n.time,
      pitch: n.pitch,
      veloctiy: n.velocity,
      type: n.type
    });
  }
}
timeTaken = microtime.nowDouble() - startTime;
log("time2:", timeTaken);
for (var $__7 = tom.toPlayable().take(profileSamples)[$traceurRuntime.toProperty(Symbol.iterator)](),
    $__8; !($__8 = $__7.next()).done; ) {
  var n = $__8.value;
  var x = ({
    time: n.time,
    pitch: n.pitch,
    veloctiy: n.velocity
  });
}
timeTaken = microtime.nowDouble() - startTime;
log("time:", timeTaken);
