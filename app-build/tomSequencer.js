"use strict";
Object.defineProperties(exports, {
  BaconSequencer: {get: function() {
      return BaconSequencer;
    }},
  __esModule: {value: true}
});
var $__lib_47_wu__,
    $__lib_47_utils__,
    $__time__;
var wu = ($__lib_47_wu__ = require("./lib/wu"), $__lib_47_wu__ && $__lib_47_wu__.__esModule && $__lib_47_wu__ || {default: $__lib_47_wu__}).wu;
var getIterator = ($__lib_47_utils__ = require("./lib/utils"), $__lib_47_utils__ && $__lib_47_utils__.__esModule && $__lib_47_utils__ || {default: $__lib_47_utils__}).getIterator;
var t = ($__time__ = require("./time"), $__time__ && $__time__.__esModule && $__time__ || {default: $__time__}).t;
var Bacon = require("baconjs");
var eventPlayer = function(evtWithOffset) {
  var evt = evtWithOffset.evt;
  var firstTime = evtWithOffset.firstTime.offset;
  return {
    evt: evt,
    play: function(instrument) {
      if (evt.type == "noteOn" && !evt.noteDisabled) {
        instrument.noteOn(evt.pitch.valueOf(), evt.velocity.valueOf(), evt.time + firstTime);
      }
      if (evt.type == "noteOff" && !evt.noteDisabled) {
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
  if (sequence == null || sequence.error || sequence.evaluatedError)
    return [new Bacon.Error(sequence.error || sequence.evaluatedError || sequence)];
  var seqIterator = null;
  var next = null;
  return baconTime.take(1).flatMap((function(firstTime) {
    return baconTime.diff(firstTime, (function(prevDecoded, timeDecoded) {
      var prevTime = prevDecoded.time;
      if (Number.isNaN(prevTime) || !Number.isFinite(prevTime))
        prevTime = 0;
      var time = timeDecoded.time;
      if (seqIterator == null) {
        console.log("skipping to", prevTime, "for sequence", sequence);
        seqIterator = getIterator(sequence.skipWhile((function(n) {
          return n.time < prevTime;
        })).toPlayable());
        next = seqIterator.next(prevTime);
      }
      var count = 0;
      if (next == null) {
        console.warn("next is null", Object.keys(sequence), sequence.currentNode);
        return [];
      }
      while (next.value.time < prevTime) {
        next = seqIterator.next(prevTime);
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
          firstTime: {offset: 0}
        });
        next = seqIterator.next(prevTime);
        if (count++ > 5)
          return eventsNow;
      }
      return eventsNow;
    }));
  })).flatMap((function(v) {
    return Bacon.fromArray(v);
  })).map(eventPlayer);
});
