"use strict";
var $__baseLib__,
    $___46__46__47_lib_47_logger__;
var $__0 = ($__baseLib__ = require("./baseLib"), $__baseLib__ && $__baseLib__.__esModule && $__baseLib__ || {default: $__baseLib__}),
    addChainEndFunction = $__0.addChainEndFunction,
    addGenerator = $__0.addGenerator;
var log = ($___46__46__47_lib_47_logger__ = require("../lib/logger"), $___46__46__47_lib_47_logger__ && $___46__46__47_lib_47_logger__.__esModule && $___46__46__47_lib_47_logger__ || {default: $___46__46__47_lib_47_logger__}).default;
addChainEndFunction(function toArray(node) {
  var res = [];
  for (var $__2 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__3; !($__3 = $__2.next()).done; ) {
    var n = $__3.value;
    {
      res.push(n);
    }
  }
  return res;
});
addGenerator(function* log(name, node) {
  for (var $__2 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__3; !($__3 = $__2.next()).done; ) {
    var e = $__3.value;
    {
      console.log(name, e);
      yield e;
    }
  }
});
addChainEndFunction(function reduce(func, initial, node) {
  if (log.showDebug)
    log.debug("reducing start");
  if (node === undefined) {
    node = initial;
    initial = null;
  }
  if (log.showDebug)
    log.debug("reducing node", node);
  for (var $__2 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__3; !($__3 = $__2.next()).done; ) {
    let n = $__3.value;
    {
      if (initial === undefined) {
        initial = n;
        continue;
      }
      initial = func(initial, n);
    }
  }
  return initial;
});
var Rx = require("Rx");
addChainEndFunction(function MToRx(node) {
  return Rx.Observable.from(node);
});
;
