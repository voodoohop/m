"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var stackTrace = require("stack-trace");
var _ = require("lodash");
function getSourcePos() {
  var trace = arguments[0] !== (void 0) ? arguments[0] : false;
  if (trace === false)
    trace = stackTrace.get();
  var stack = trace.map((function(t) {
    return ({
      fileName: t.getFileName(),
      line: t.getLineNumber(),
      column: t.getColumnNumber(),
      functionName: t.getFunctionName(),
      eval: t.isEval ? t.isEval() : false
    });
  })).filter((function(s) {
    return s.fileName === undefined || s.fileName === null || s.fileName.indexOf("node_modules") < 0;
  }));
  var stackEntry = _.find(stack, (function(s) {
    return s.eval == true;
  }));
  if (stackEntry !== undefined)
    console.log("found stackEntry", stackEntry);
  var pos = null;
  if (!stackEntry)
    return;
  if (typeof sourcePosMapper === "function") {
    pos = [stackEntry.line, stackEntry.column];
    console.log("result", transformed);
    return pos;
  } else {
    console.error("couldn't find sourceMap transformer, returning stack entry", stackEntry);
    return [stackEntry.line, stackEntry.column];
  }
}
var $__default = getSourcePos;
