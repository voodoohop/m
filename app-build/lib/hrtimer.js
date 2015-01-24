"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
function hrTimeInSeconds() {
  var startTime = arguments[0];
  var current;
  if (startTime !== undefined) {
    startTime = [Math.floor(startTime), (startTime % 1) * 1000000000];
    current = process.hrtime(startTime);
  } else
    current = process.hrtime();
  return current[0] + current[1] / 1000000000;
}
var $__default = hrTimeInSeconds;
