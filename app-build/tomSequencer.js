"use strict";
Object.defineProperties(exports, {
  BaconSequencer: {get: function() {
      return BaconSequencer;
    }},
  __esModule: {value: true}
});
var $__wu__,
    $__utils__,
    $__time__;
var wu = ($__wu__ = require("./wu"), $__wu__ && $__wu__.__esModule && $__wu__ || {default: $__wu__}).wu;
var getIterator = ($__utils__ = require("./utils"), $__utils__ && $__utils__.__esModule && $__utils__ || {default: $__utils__}).getIterator;
var t = ($__time__ = require("./time"), $__time__ && $__time__.__esModule && $__time__ || {default: $__time__}).t;
var Bacon = require("baconjs");
var eventPlayer = function(evtWithOffset) {
  var evt = evtWithOffset.evt;
  var firstTime = evtWithOffset.firstTime.offset;
  return {
    evt: evt,
    play: function(instrument) {
      if (evt.type == "noteOn") {
        instrument.noteOn(evt.pitch.valueOf(), evt.velocity.valueOf(), evt.time + firstTime);
      }
      if (evt.type == "noteOff") {
        instrument.noteOff(evt.pitch.valueOf(), evt.time + firstTime);
      }
      if (evt.type == "automation") {
        instrument.param(evt.name, evt.automationVal, evt.time + firstTime);
      }
    }
  };
};
var BaconSequencer = wu.curryable(function(baconTime, sequence) {
  console.log("sequencer", sequence);
  var seqIterator = null;
  var next = null;
  return baconTime.take(1).flatMap((function(firstTime) {
    return baconTime.diff(firstTime, (function(prevDecoded, timeDecoded) {
      var prevTime = prevDecoded.time;
      if (Number.isNaN(prevTime))
        prevTime = 0;
      var time = timeDecoded.time;
      if (seqIterator == null) {
        console.log("skipping to", prevTime, "for sequence", sequence);
        seqIterator = getIterator(sequence.skipWhile((function(n) {
          return n.time < prevTime;
        })).toPlayable());
        next = seqIterator.next();
      }
      var count = 0;
      while (next.value.time < prevTime) {
        next = seqIterator.next();
        console.warn("time lag:", prevTime - next.value.time + "".bgRed);
        if (count++ > 5) {
          console.log("event overflow, yielding to bacon", time.toFixed(2));
          return [];
        }
      }
      if (time - prevTime > 1)
        return [];
      var eventsNow = [];
      while (next.value.time <= time) {
        eventsNow.push({
          evt: next.value,
          firstTime: firstTime
        });
        next = seqIterator.next();
        if (count++ > 5)
          return eventsNow;
      }
      return eventsNow;
    }));
  })).flatMap((function(v) {
    return Bacon.fromArray(v);
  })).map(eventPlayer);
});
