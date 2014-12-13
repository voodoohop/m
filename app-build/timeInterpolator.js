"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var Bacon = require("baconjs");
var getLocalTime = (function() {
  return process.hrtime()[0] * 1000 + process.hrtime()[1] / 1000000;
});
var $__default = function(baconTime) {
  baconTime.log("absolute time received");
  var timeBetweenTicks = (baconTime.diff(0, (function(previous, current) {
    return current - previous;
  }))).skip(1);
  var localTime = new Bacon.Bus();
  var interpolatedTime = new Bacon.Bus();
  baconTime.onValue(function(v) {
    localTime.push(getLocalTime());
  });
  var localTimeBetweenTicks = (localTime.diff(0, (function(previous, current) {
    return current - previous;
  }))).skip(1);
  var combinedTimes = Bacon.zipWith((function(time, timeDiff, localTime, localTimeDiff) {
    return {
      externalTime: time,
      timeDiff: timeDiff,
      localStartTime: localTime,
      localTimeDiff: localTimeDiff
    };
  }), baconTime.skip(1), timeBetweenTicks, localTime.skip(1), localTimeBetweenTicks);
  var resolutionMs = 3;
  var latency = 0;
  combinedTimes.onValue(function(times) {
    var nextInterpolated = (function() {
      return setTimeout(function() {
        var res = (getLocalTime() - times.localStartTime + latency) / (times.localTimeDiff / times.timeDiff);
        if (res < times.timeDiff)
          nextInterpolated();
        interpolatedTime.push(res + times.externalTime);
      }, resolutionMs);
    });
    nextInterpolated();
  });
  return interpolatedTime;
};

//# sourceMappingURL=timeInterpolator.map
