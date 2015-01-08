"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__lib_47_findSourceStackPos__,
    $__lib_47_logger__;
var stackTrace = require("stack-trace");
var repl = require("repl");
var _ = require("lodash");
var getSourcePos = ($__lib_47_findSourceStackPos__ = require("./lib/findSourceStackPos"), $__lib_47_findSourceStackPos__ && $__lib_47_findSourceStackPos__.__esModule && $__lib_47_findSourceStackPos__ || {default: $__lib_47_findSourceStackPos__}).default;
var log = ($__lib_47_logger__ = require("./lib/logger"), $__lib_47_logger__ && $__lib_47_logger__.__esModule && $__lib_47_logger__ || {default: $__lib_47_logger__}).default;
function wrapSequenceError(error, deviceStruct) {
  log.error("error", {err: error});
  var stack = stackTrace.parse(error);
  log.debug({stack: stack});
  console.warn("looking for errorpos", deviceStruct);
  var errorPos = getSourcePos(deviceStruct.sourcePos, stack);
  console.warn("found errorPos", errorPos);
  return {
    error: error,
    errorPos: errorPos,
    description: _.last(error.toString().split("\n")),
    stackTrace: stack
  };
}
var $__default = wrapSequenceError;
