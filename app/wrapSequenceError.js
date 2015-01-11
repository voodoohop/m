var stackTrace = require("stack-trace");
var repl = require("repl");


var _ = require("lodash");


import getSourcePos from "./lib/findSourceStackPos";

import log from "./lib/logger";

export default function wrapSequenceError(error, deviceStruct) {

  log.error("error",{err:error});

  var stack = stackTrace.parse(error);
  if (log.showDebug) log.debug({stack:stack});
  // console.warn("stackArray");
  // stack.forEach(s => console.warn("stackt",s));
  // console.log("stackstack", error.toString(), error.stack);
  // var userCodeErrors = _.filter(stack, (s) => s.lineNumber > 0 && s.fileName.startsWith("evalmachine") && s.fileName.indexOf("Bacon.js") <= 0 && s.fileName.indexOf("node_modules") <= 0 /*s.fileName == "vm.js"*/ )
  // userCodeErrors = userCodeErrors.map((e) => _.extend({}, e, {
  //   fileName: e.fileName.replace("/Users/thomash/Documents/M4L/thomashfreshandclean/app-build/", "")
  // }));
  // // console.log("userCodeErrors",userCodeErrors);
  // // userCodeErrors.((s) => {
  // //   //  console.log(deviceStruct);
  // //   if (s.fileName.startsWith("evalmachine"))
  // //     console.log("found stack error pos",s.fileName, deviceStruct.sourcePos(s.lineNumber, s.columnNumber));
  // //   // console.log(s.fileName + ":" + s.functionName + ":" + s.lineNumber + ":" + s.columnNumber, deviceStruct.sourcePos(s.lineNumber, s.columnNumber));
  // // });
  // var errorPos = undefined;
  //
  // if (userCodeErrors.length>0) {
  //   var s = userCodeErrors[0];
  //   if (typeof deviceStruct.sourcePos === "function") {
  //     var transformed = deviceStruct.sourcePos(s.lineNumber, s.columnNumber);
  //     errorPos = [transformed.line, transformed.column];
  //   }
  //   else
  //     console.error("couldn't find sourceMap error transformer");
  // }
  log.warn("looking for errorpos",deviceStruct);
  var errorPos = getSourcePos(deviceStruct.sourcePos, stack);
  log.warn("found errorPos",errorPos);
  //  process.exit(1);
  // repl.start({
  //   prompt: "genMusic stdin> ",
  //   input: process.stdin,
  //   output: process.stdout
  // });

  return {
    error: error,

    errorPos:errorPos,
    description: _.last(error.toString().split("\n")),
    stackTrace: stack

  }
}
