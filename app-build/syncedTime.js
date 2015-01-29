"use strict";
Object.defineProperties(exports, {
  timeResetRequest: {get: function() {
      return timeResetRequest;
    }},
  decodedTime: {get: function() {
      return decodedTime;
    }},
  time: {get: function() {
      return time;
    }},
  resetMessages: {get: function() {
      return resetMessages;
    }},
  __esModule: {value: true}
});
var $__oscAbleton__,
    $__time__;
var Bacon = require("baconjs");
var abletonReceiver = ($__oscAbleton__ = require("./oscAbleton"), $__oscAbleton__ && $__oscAbleton__.__esModule && $__oscAbleton__ || {default: $__oscAbleton__}).abletonReceiver;
var _ = require("lodash");
var timeResetRequest = new Bacon.Bus();
var t = ($__time__ = require("./time"), $__time__ && $__time__.__esModule && $__time__ || {default: $__time__}).t;
var lastCodeResetNo = -1;
var decodedTime = abletonReceiver.time.diff(0, (function(a, b) {
  return b - a;
})).skip(1).zip(abletonReceiver.time.skip(1), (function(timeDiff, time) {
  return {
    timeDiff: timeDiff,
    time: time
  };
})).map((function(time) {
  return time.timeDiff < -8 ? _.extend({reset: true}, time) : time;
})).combine(timeResetRequest.debounceImmediate(500).toProperty(), function(time, codeReset) {
  if (lastCodeResetNo != codeReset) {
    console.log("RESET", time, codeReset);
    lastCodeResetNo = codeReset;
    return _.extend({reset: true}, time);
  }
  return time;
}).scan({}, (function(prev, time) {
  var newTime = _.clone(time);
  if (prev.firstTime > 0 && !time.reset)
    newTime.firstTime = prev.firstTime;
  else
    newTime.firstTime = time.time - time.time % t.bars(4);
  return newTime;
}));
var timeThatAccountsForTransportJumps2 = decodedTime.map((function(t) {
  return {
    time: t.time,
    offset: 0
  };
}));
var time = timeThatAccountsForTransportJumps2;
var resetMessages = decodedTime.map((function(t) {
  return t.reset;
})).filter((function(t) {
  return t;
})).debounce(50);
setTimeout((function() {
  return timeResetRequest.push("first time resseeet");
}), 2000);
