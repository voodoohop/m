"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var stackTrace = require("stack-trace");
var repl = require("repl");
var _ = require("lodash");
function wrapSequenceError(error, deviceStruct) {
  var stack = stackTrace.parse(error);
  var userCodeErrors = _.filter(stack, (function(s) {
    return s.lineNumber > 0 && s.fileName.startsWith("evalmachine") && s.fileName.indexOf("Bacon.js") <= 0 && s.fileName.indexOf("node_modules") <= 0;
  }));
  userCodeErrors = userCodeErrors.map((function(e) {
    return _.extend({}, e, {fileName: e.fileName.replace("/Users/thomash/Documents/M4L/thomashfreshandclean/app-build/", "")});
  }));
  var errorPos = undefined;
  if (userCodeErrors.length > 0) {
    var s = userCodeErrors[0];
    if (typeof deviceStruct.sourcePos === "function") {
      var transformed = deviceStruct.sourcePos(s.lineNumber, s.columnNumber);
      errorPos = [transformed.line, transformed.column];
    } else
      console.error("couldn't find sourceMap error transformer");
  }
  return {
    stackTrace: stack,
    error: error,
    description: _.last(error.toString().split("\n")),
    errorPos: errorPos
  };
}
var $__default = wrapSequenceError;
