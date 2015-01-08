"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__functionalM_47_baseLib__,
    $__time__,
    $__lib_47_wu__,
    $__webConnection__,
    $__immutable_47_nodeProxiedImmutable__,
    $__lib_47_utils__,
    $__oscAbleton__,
    $__lib_47_findSourceStackPos__;
var teoria = require("teoria");
var m = ($__functionalM_47_baseLib__ = require("./functionalM/baseLib"), $__functionalM_47_baseLib__ && $__functionalM_47_baseLib__.__esModule && $__functionalM_47_baseLib__ || {default: $__functionalM_47_baseLib__}).m;
var t = ($__time__ = require("./time"), $__time__ && $__time__.__esModule && $__time__ || {default: $__time__}).t;
var wu = ($__lib_47_wu__ = require("./lib/wu"), $__lib_47_wu__ && $__lib_47_wu__.__esModule && $__lib_47_wu__ || {default: $__lib_47_wu__}).wu;
var webServer = ($__webConnection__ = require("./webConnection"), $__webConnection__ && $__webConnection__.__esModule && $__webConnection__ || {default: $__webConnection__}).default;
var immutable = ($__immutable_47_nodeProxiedImmutable__ = require("./immutable/nodeProxiedImmutable"), $__immutable_47_nodeProxiedImmutable__ && $__immutable_47_nodeProxiedImmutable__.__esModule && $__immutable_47_nodeProxiedImmutable__ || {default: $__immutable_47_nodeProxiedImmutable__}).immutableTom;
var $__5 = ($__lib_47_utils__ = require("./lib/utils"), $__lib_47_utils__ && $__lib_47_utils__.__esModule && $__lib_47_utils__ || {default: $__lib_47_utils__}),
    isIterable = $__5.isIterable,
    getIterator = $__5.getIterator,
    clone = $__5.clone;
var Easer = require('functional-easing').Easer;
var _ = require("lodash");
var $__6 = ($__oscAbleton__ = require("./oscAbleton"), $__oscAbleton__ && $__oscAbleton__.__esModule && $__oscAbleton__ || {default: $__oscAbleton__}),
    abletonReceiver = $__6.abletonReceiver,
    abletonSender = $__6.abletonSender;
var vm = require("vm");
var stackTrace = require("stack-trace");
var getSourcePos = ($__lib_47_findSourceStackPos__ = require("./lib/findSourceStackPos"), $__lib_47_findSourceStackPos__ && $__lib_47_findSourceStackPos__.__esModule && $__lib_47_findSourceStackPos__ || {default: $__lib_47_findSourceStackPos__}).default;
var ramda = require("ramda");
function getSandBox(loadedSequences) {
  var deviceStruct = arguments[1] !== (void 0) ? arguments[1] : null;
  var loggerOverride = arguments[2] !== (void 0) ? arguments[2] : false;
  var remoteLog = function() {
    for (var m = [],
        $__8 = 0; $__8 < arguments.length; $__8++)
      m[$__8] = arguments[$__8];
    console.log("seqLog".bgYellow, m);
    console.log("deviceStruct sourcePos", deviceStruct.sourcePos);
    webServer.remoteLogger.push({
      msg: m,
      sourcePos: getSourcePos(deviceStruct.sourcePos),
      device: deviceStruct.device
    });
  };
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
    "immutable": immutable,
    "_": _,
    "R": ramda,
    "System": seqLoader,
    "clone": clone,
    "easer": (function() {
      return new Easer();
    }),
    "log": loggerOverride ? loggerOverride : remoteLog,
    "Symbol": Symbol
  };
  return sandbox;
}
var $__default = getSandBox;
