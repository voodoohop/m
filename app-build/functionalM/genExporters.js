"use strict";
var $__baseLib__;
var $__0 = ($__baseLib__ = require("./baseLib"), $__baseLib__ && $__baseLib__.__esModule && $__baseLib__ || {default: $__baseLib__}),
    addChainEndFunction = $__0.addChainEndFunction,
    addGenerator = $__0.addGenerator;
addChainEndFunction(function toArray(node) {
  var res = [];
  for (var $__1 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__2; !($__2 = $__1.next()).done; ) {
    var n = $__2.value;
    {
      res.push(n);
    }
  }
  return res;
});
addGenerator(function* log(name, node) {
  for (var $__1 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__2; !($__2 = $__1.next()).done; ) {
    var e = $__2.value;
    {
      console.log(name, e);
      yield e;
    }
  }
});
var Rx = require("Rx");
addChainEndFunction(function MToRx(node) {
  return Rx.Observable.from(node);
});
;
