"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__logger__;
var stackTrace = require("stack-trace");
var _ = require("lodash");
var log = ($__logger__ = require("./logger"), $__logger__ && $__logger__.__esModule && $__logger__ || {default: $__logger__}).default;
function getSourcePos(sourcePosMapper) {
  var trace = arguments[1] !== (void 0) ? arguments[1] : false;
  if (trace === false || !trace)
    trace = stackTrace.get();
  if (!trace.map)
    log.error("trace doesn't have map function", trace);
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
    return s.eval === true || s.functionName === "eval";
  }));
  if (stackEntry !== undefined)
    console.log("found stackEntry", stackEntry);
  var pos = null;
  if (!stackEntry) {
    log.warn("couldn't find stackEntry", stack);
    return;
  }
  if (typeof sourcePosMapper === "function") {
    var transformed = sourcePosMapper(stackEntry.line, stackEntry.column);
    pos = [transformed.line, transformed.column];
    if (log.showDebug)
      log.debug("result of transforming error pos", stackEntry, transformed);
    return pos;
  } else {
    console.error("couldn't find sourceMap transformer, returning stack entry", stackEntry);
    return [stackEntry.line, stackEntry.column];
  }
}
var $__default = getSourcePos;
;
