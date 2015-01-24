"use strict";
Object.defineProperties(exports, {
  m: {get: function() {
      return m;
    }},
  addGenerator: {get: function() {
      return addGenerator;
    }},
  addChainEndFunction: {get: function() {
      return addChainEndFunction;
    }},
  __esModule: {value: true}
});
var $___46__46__47_lib_47_wu__,
    $___46__46__47_lib_47_logger__,
    $___46__46__47_lib_47_utils__,
    $___46__46__47_immutable_47_nodeProxiedImmutable__,
    $___46__46__47_webConnection__,
    $___46__46__47_lib_47_findSourceStackPos__;
var wu = ($___46__46__47_lib_47_wu__ = require("../lib/wu"), $___46__46__47_lib_47_wu__ && $___46__46__47_lib_47_wu__.__esModule && $___46__46__47_lib_47_wu__ || {default: $___46__46__47_lib_47_wu__}).wu;
var log = ($___46__46__47_lib_47_logger__ = require("../lib/logger"), $___46__46__47_lib_47_logger__ && $___46__46__47_lib_47_logger__.__esModule && $___46__46__47_lib_47_logger__ || {default: $___46__46__47_lib_47_logger__}).default;
var $__2 = ($___46__46__47_lib_47_utils__ = require("../lib/utils"), $___46__46__47_lib_47_utils__ && $___46__46__47_lib_47_utils__.__esModule && $___46__46__47_lib_47_utils__ || {default: $___46__46__47_lib_47_utils__}),
    prettyToString = $__2.prettyToString,
    toStringObject = $__2.toStringObject,
    toStringDetailed = $__2.toStringDetailed,
    addFuncProp = $__2.addFuncProp,
    isIterable = $__2.isIterable,
    getIterator = $__2.getIterator,
    fixFloat = $__2.fixFloat;
var $__3 = ($___46__46__47_immutable_47_nodeProxiedImmutable__ = require("../immutable/nodeProxiedImmutable"), $___46__46__47_immutable_47_nodeProxiedImmutable__ && $___46__46__47_immutable_47_nodeProxiedImmutable__.__esModule && $___46__46__47_immutable_47_nodeProxiedImmutable__ || {default: $___46__46__47_immutable_47_nodeProxiedImmutable__}),
    immutableObj = $__3.immutableTom,
    addObjectProp = $__3.addObjectProp,
    addObjectProps = $__3.addObjectProps;
var util = require("util");
var _ = require("lodash");
var webServer = ($___46__46__47_webConnection__ = require("../webConnection"), $___46__46__47_webConnection__ && $___46__46__47_webConnection__.__esModule && $___46__46__47_webConnection__ || {default: $___46__46__47_webConnection__}).default;
var logDetails = true;
var Immutable = require("immutable");
var stackTrace = require("stack-trace");
var findSourcePos = ($___46__46__47_lib_47_findSourceStackPos__ = require("../lib/findSourceStackPos"), $___46__46__47_lib_47_findSourceStackPos__ && $___46__46__47_lib_47_findSourceStackPos__.__esModule && $___46__46__47_lib_47_findSourceStackPos__ || {default: $___46__46__47_lib_47_findSourceStackPos__}).default;
function* runGenFeedback(generator, name, args) {
  var $__6;
  for (var $__7 = ($__6 = {}, Object.defineProperty($__6, wu.iteratorSymbol, {
    value: (function() {
      return generator.apply(null, $traceurRuntime.spread(args));
    }),
    configurable: true,
    enumerable: true,
    writable: true
  }), $__6)[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__8; !($__8 = $__7.next()).done; ) {
    let e = $__8.value;
    {
      var spos = findSourcePos();
      if (spos !== undefined && spos !== null) {
        console.warn(name, spos);
        webServer.sequenceFeedback.push(spos);
      }
      yield e;
    }
  }
  ;
}
var stackTrace = require('stack-trace');
var path = process.cwd();
var mGenerator = function(generator) {
  var options = arguments[1] !== (void 0) ? arguments[1] : {};
  var name = options.nameOverride || generator.name;
  var getIterable = function() {
    for (var args = [],
        $__9 = 0; $__9 < arguments.length; $__9++)
      args[$__9] = arguments[$__9];
    var res = {};
    res.isTom = true;
    res.name = name;
    res[wu.iteratorSymbol] = (function() {
      return generator.apply(null, $traceurRuntime.spread(args));
    });
    if (options.toStringOverride)
      res.toString = (function() {
        return options.toStringOverride;
      });
    else {
      res.toString = (function() {
        if (!res.toStringCached)
          res.toStringCached = prettyToString(name, args);
        return res.toStringCached;
      });
    }
    return new M(res);
  };
  getIterable.prototype = M.prototype;
  return getIterable;
};
var rootNode = Object.freeze({
  isTom: true,
  name: "m()"
});
var wrappedSymbol = Symbol("M wrapped Object");
var typeValidate = require('tcomb-validation').validate;
function M() {
  var node = arguments[0] !== (void 0) ? arguments[0] : rootNode;
  if (!node.isTom)
    throw TypeError("expecting a node of type isTom in M");
  this.currentNode = node;
  this.name = node.name;
  this.isTom = true;
  this.length = node.length;
  this[wu.iteratorSymbol] = node[wu.iteratorSymbol];
}
M.prototype.toString = function() {
  return this.currentNode.toString();
};
var m = function() {
  var wrapObject = arguments[0] !== (void 0) ? arguments[0] : rootNode;
  if (!wrapObject.isTom || (!isIterable(wrapObject) && wrapObject != rootNode)) {
    return new M(rootNode).data(wrapObject);
  }
  return new M(wrapObject);
};
m.prototype = M.prototype;
console.log(m.prototype);
var addFunction = function(name, func) {
  var options = arguments[2] !== (void 0) ? arguments[2] : rootNode;
  M.prototype[name] = function() {
    for (var args = [],
        $__9 = 0; $__9 < arguments.length; $__9++)
      args[$__9] = arguments[$__9];
    if (options.notChainable)
      return func.apply(null, $traceurRuntime.spread($traceurRuntime.spread(args, [this.currentNode])));
    var callArgs = (this.currentNode != rootNode && !options.noInputChain) ? $traceurRuntime.spread(args, [this.currentNode]) : args;
    var newNode = func.apply(null, $traceurRuntime.spread(callArgs));
    newNode.parentNode = this;
    return newNode;
  };
};
function addGenerator(generatorFunc) {
  var options = arguments[1] !== (void 0) ? arguments[1] : {};
  var thirdOption = arguments[2] !== (void 0) ? arguments[2] : false;
  if (thirdOption)
    throw "thirdOption removed";
  if (!(options.nameOverride || generatorFunc.name).length)
    throw "no name given" + generatorFunc;
  addFunction(options.nameOverride || generatorFunc.name, mGenerator(generatorFunc, options), options);
}
function addChainEndFunction(func) {
  if (log.showDebug)
    log.debug("added chain end function", func.name);
  addFunction(func.name, func, {notChainable: true});
}
addGenerator(function* val(value) {
  if (value instanceof Object)
    yield immutableObj(value);
  else
    yield value;
});
M.prototype.addGen = addGenerator;
M.prototype.getIterator = getIterator;
