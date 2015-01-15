var stackTrace = require("stack-trace");
var _ = require("lodash");

import log from "./logger";

export default function getSourcePos(sourcePosMapper, trace=false) {

//console.warn("determining source pos");

if (trace===false || !trace)
  trace = stackTrace.get();



//debug(trace);

// if (log.showDebug) log.debug("trace length", trace.length);

// console.log(trace);

if (!trace.map)
  log.error("trace doesn't have map function", trace);


var stack = trace.map(t => ({
  fileName: t.getFileName(),
  line: t.getLineNumber(),
  column: t.getColumnNumber(),
  functionName: t.getFunctionName(),
  eval: t.isEval ? t.isEval() : false
})
).filter(s => s.fileName === undefined || s.fileName === null || s.fileName.indexOf("node_modules") < 0);


// stack.forEach(s => console.log("stackEntry",s));

var stackEntry = _.find(stack, s => s.eval === true || s.functionName === "eval");
if (stackEntry !==undefined)
log.debug("found stackEntry",stackEntry);
// console.log("stack",stack);
var pos = null;
if (!stackEntry) {
  log.warn("couldn't find stackEntry", stack);
  return;
}
  if (typeof sourcePosMapper === "function") {
    // console.log("transforming ",stackEntry.line, stackEntry.column);
    var transformed = sourcePosMapper(stackEntry.line, stackEntry.column);
    pos = [transformed.line, transformed.column];
    if (log.showDebug) log.debug("result of transforming error pos", stackEntry, transformed);
    return pos;
  }
  else {
    console.error("couldn't find sourceMap transformer, returning stack entry", stackEntry);
    return [stackEntry.line, stackEntry.column];
  }
};
