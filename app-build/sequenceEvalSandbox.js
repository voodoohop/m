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
    $__lib_47_logger__,
    $__lib_47_utils__,
    $__oscAbleton__,
    $__lib_47_findSourceStackPos__,
    $__livePlayingClips__;
var teoria = require("teoria");
var m = ($__functionalM_47_baseLib__ = require("./functionalM/baseLib"), $__functionalM_47_baseLib__ && $__functionalM_47_baseLib__.__esModule && $__functionalM_47_baseLib__ || {default: $__functionalM_47_baseLib__}).m;
var t = ($__time__ = require("./time"), $__time__ && $__time__.__esModule && $__time__ || {default: $__time__}).t;
var wu = ($__lib_47_wu__ = require("./lib/wu"), $__lib_47_wu__ && $__lib_47_wu__.__esModule && $__lib_47_wu__ || {default: $__lib_47_wu__}).wu;
var webServer = ($__webConnection__ = require("./webConnection"), $__webConnection__ && $__webConnection__.__esModule && $__webConnection__ || {default: $__webConnection__}).default;
var immutable = ($__immutable_47_nodeProxiedImmutable__ = require("./immutable/nodeProxiedImmutable"), $__immutable_47_nodeProxiedImmutable__ && $__immutable_47_nodeProxiedImmutable__.__esModule && $__immutable_47_nodeProxiedImmutable__ || {default: $__immutable_47_nodeProxiedImmutable__}).immutableTom;
var log = ($__lib_47_logger__ = require("./lib/logger"), $__lib_47_logger__ && $__lib_47_logger__.__esModule && $__lib_47_logger__ || {default: $__lib_47_logger__}).default;
var $__6 = ($__lib_47_utils__ = require("./lib/utils"), $__lib_47_utils__ && $__lib_47_utils__.__esModule && $__lib_47_utils__ || {default: $__lib_47_utils__}),
    isIterable = $__6.isIterable,
    getIterator = $__6.getIterator,
    clone = $__6.clone;
var Easer = require('functional-easing').Easer;
var _ = require("lodash");
var $__7 = ($__oscAbleton__ = require("./oscAbleton"), $__oscAbleton__ && $__oscAbleton__.__esModule && $__oscAbleton__ || {default: $__oscAbleton__}),
    abletonReceiver = $__7.abletonReceiver,
    abletonSender = $__7.abletonSender,
    maxControl = $__7.maxControl;
var vm = require("vm");
var stackTrace = require("stack-trace");
var getSourcePos = ($__lib_47_findSourceStackPos__ = require("./lib/findSourceStackPos"), $__lib_47_findSourceStackPos__ && $__lib_47_findSourceStackPos__.__esModule && $__lib_47_findSourceStackPos__ || {default: $__lib_47_findSourceStackPos__}).default;
var ramda = require("ramda");
var livePlayingClips = ($__livePlayingClips__ = require("./livePlayingClips"), $__livePlayingClips__ && $__livePlayingClips__.__esModule && $__livePlayingClips__ || {default: $__livePlayingClips__});
function getSandBox(loadedSequences) {
  var deviceStruct = arguments[1] !== (void 0) ? arguments[1] : null;
  var loggerOverride = arguments[2] !== (void 0) ? arguments[2] : false;
  var remoteLog = function() {
    for (var m = [],
        $__9 = 0; $__9 < arguments.length; $__9++)
      m[$__9] = arguments[$__9];
    var sourcePos = getSourcePos(deviceStruct.sourcePos);
    if (!sourcePos)
      log.warn("warning, logging to device but no sourcePos", deviceStruct.name, "sourcePos:", deviceStruct.sourcePos);
    webServer.remoteLogger.push({
      msg: m,
      sourcePos: sourcePos,
      device: deviceStruct.device
    });
  };
  var seqLoader = {get: (function(m) {
      if (m === "playing") {
        return {"default": livePlayingClips.getSequence(deviceStruct.device)};
      }
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
    "params": (function(paramName) {
      return abletonReceiver.param(deviceStruct.device, paramName).map((function(v) {
        return v.value;
      }));
    }),
    "params2": (function(paramName) {
      return abletonReceiver.param(deviceStruct.device, paramName);
    }),
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
    "Symbol": Symbol,
    "playingClip": livePlayingClips.newPlayingClip,
    "maxControl": maxControl,
    "automate": (function(paramName, automation) {
      automation.onValue((function(v) {
        return abletonSender.param(deviceStruct.path, v.port, paramName, v.value, -1);
      }));
    })
  };
  return sandbox;
}
var $__default = getSandBox;
