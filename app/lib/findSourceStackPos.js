var stackTrace = require("stack-trace");
var _ = require("lodash");

export default function getSourcePos(trace=false) {

//console.warn("determining source pos");

if (trace===false)
  trace = stackTrace.get();
var stack = trace.map(t => ({
  fileName: t.getFileName(),
  line: t.getLineNumber(),
  column: t.getColumnNumber(),
  functionName: t.getFunctionName(),
  eval: t.isEval ? t.isEval() : false
})
).filter(s => s.fileName === undefined || s.fileName === null || s.fileName.indexOf("node_modules") < 0);


// stack.forEach(s => console.log("stackEntry",s));

var stackEntry = _.find(stack, s => s.eval == true);
if (stackEntry !==undefined)
console.log("found stackEntry",stackEntry);
// console.log("stack",stack);
var pos = null;
if (!stackEntry)
  return;
  if (typeof sourcePosMapper === "function") {
    // console.log("transforming ",stackEntry.line, stackEntry.column);
    // var transformed = sourcePosMapper(stackEntry.line, stackEntry.column);
    pos = [stackEntry.line, stackEntry.column];
    console.log("result",transformed);
    return pos;
  }
  else {
    console.error("couldn't find sourceMap transformer, returning stack entry", stackEntry);
    return [stackEntry.line, stackEntry.column];
  }
}
