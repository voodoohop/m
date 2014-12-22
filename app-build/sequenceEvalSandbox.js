"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__functionalMonads__,
    $__time__,
    $__lib_47_wu__,
    $__webConnection__,
    $__lib_47_utils__,
    $__oscAbleton__;
var teoria = require("teoria");
var m = ($__functionalMonads__ = require("./functionalMonads"), $__functionalMonads__ && $__functionalMonads__.__esModule && $__functionalMonads__ || {default: $__functionalMonads__}).m;
var t = ($__time__ = require("./time"), $__time__ && $__time__.__esModule && $__time__ || {default: $__time__}).t;
var wu = ($__lib_47_wu__ = require("./lib/wu"), $__lib_47_wu__ && $__lib_47_wu__.__esModule && $__lib_47_wu__ || {default: $__lib_47_wu__}).wu;
var webServer = ($__webConnection__ = require("./webConnection"), $__webConnection__ && $__webConnection__.__esModule && $__webConnection__ || {default: $__webConnection__}).default;
var $__4 = ($__lib_47_utils__ = require("./lib/utils"), $__lib_47_utils__ && $__lib_47_utils__.__esModule && $__lib_47_utils__ || {default: $__lib_47_utils__}),
    isIterable = $__4.isIterable,
    getIterator = $__4.getIterator,
    clone = $__4.clone;
var Easer = require('functional-easing').Easer;
var _ = require("lodash");
var $__5 = ($__oscAbleton__ = require("./oscAbleton"), $__oscAbleton__ && $__oscAbleton__.__esModule && $__oscAbleton__ || {default: $__oscAbleton__}),
    abletonReceiver = $__5.abletonReceiver,
    abletonSender = $__5.abletonSender;
var vm = require("vm");
var remoteLog = function() {
  for (var m = [],
      $__6 = 0; $__6 < arguments.length; $__6++)
    m[$__6] = arguments[$__6];
  console.log("seqLog".bgYellow, m);
  try {
    webServer.remoteLogger.push("" + m);
  } catch (e) {
    console.error("error sending log", e);
  }
};
function getSandBox(loadedSequences) {
  var seqLoader = {get: (function(m) {
      console.log("seqLoader: requesting sequences from", m);
      var evaluated = loadedSequences.getIn([m, "evaluated"]);
      console.log("seqLoader: sending evaluated", evaluated);
      if (!evaluated)
        throw new Error("evaluated sequences falsy" + m);
      return evaluated;
    })};
  var sandbox = {
    "$traceurRuntime": $traceurRuntime,
    "m": m,
    "t": t,
    "params": abletonReceiver.param,
    "wu": wu,
    "teoria": teoria,
    "_": _,
    "System": seqLoader,
    "clone": clone,
    "easer": (function() {
      return new Easer();
    }),
    "Symbol": Symbol
  };
  return sandbox;
}
var $__default = getSandBox;
