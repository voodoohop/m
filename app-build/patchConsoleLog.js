"use strict";
var util = require('util');
var colors = require('colors');
var oldLog = console.log;
var lengthLimit = 400;
var limitStringLength = (function(s) {
  return s.length > lengthLimit ? (s.substring(0, lengthLimit)).yellow + "...".bold.underline : s;
});
var toStringForLog = (function(a) {
  var depth = arguments[1] !== (void 0) ? arguments[1] : 1;
  if (a === undefined)
    return "undefined".bgMagenta;
  if (a === null)
    return "null".bgMagenta;
  if (typeof a == "string")
    return depth > 0 ? '"' + limitStringLength(a) + '"' : limitStringLength(a);
  if (typeof a == "object" && a.isTom)
    return toStringForLog("" + a);
  if (depth > 0 && typeof a == "object" && !util.isArray(a)) {
    return "{ " + Object.keys(a).map((function(key) {
      return key.bold + ": " + toStringForLog(a[key], 0);
    })).join(", ") + " }";
  }
  return limitStringLength(util.inspect(a, {colors: true}));
});
var newLog = (function(bgCol) {
  return function() {
    for (var args = [],
        $__0 = 0; $__0 < arguments.length; $__0++)
      args[$__0] = arguments[$__0];
    var mapped = args.map(toStringForLog);
    if (bgCol)
      mapped = mapped.map((function(a) {
        return a[bgCol];
      }));
    oldLog.apply(null, $traceurRuntime.spread(mapped));
  };
});
console.log = newLog(null);
console.warn = newLog("bgMagenta");
console.error = newLog("bgRed");
