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
    $___46__46__47_lib_47_utils__,
    $___46__46__47_immutable_47_nodeProxiedImmutable__;
var wu = ($___46__46__47_lib_47_wu__ = require("../lib/wu"), $___46__46__47_lib_47_wu__ && $___46__46__47_lib_47_wu__.__esModule && $___46__46__47_lib_47_wu__ || {default: $___46__46__47_lib_47_wu__}).wu;
var $__1 = ($___46__46__47_lib_47_utils__ = require("../lib/utils"), $___46__46__47_lib_47_utils__ && $___46__46__47_lib_47_utils__.__esModule && $___46__46__47_lib_47_utils__ || {default: $___46__46__47_lib_47_utils__}),
    prettyToString = $__1.prettyToString,
    toStringObject = $__1.toStringObject,
    toStringDetailed = $__1.toStringDetailed,
    addFuncProp = $__1.addFuncProp,
    isIterable = $__1.isIterable,
    getIterator = $__1.getIterator,
    fixFloat = $__1.fixFloat;
var $__2 = ($___46__46__47_immutable_47_nodeProxiedImmutable__ = require("../immutable/nodeProxiedImmutable"), $___46__46__47_immutable_47_nodeProxiedImmutable__ && $___46__46__47_immutable_47_nodeProxiedImmutable__.__esModule && $___46__46__47_immutable_47_nodeProxiedImmutable__ || {default: $___46__46__47_immutable_47_nodeProxiedImmutable__}),
    immutableObj = $__2.immutableTom,
    addObjectProp = $__2.addObjectProp,
    addObjectProps = $__2.addObjectProps;
var util = require("util");
var _ = require("lodash");
var logDetails = true;
var Immutable = require("immutable");
var cacheLimit = 10;
var cache_disabled = {disabled: true};
var createCache = function() {
  var caches = {};
  return function(key, disable) {
    if (disable) {
      caches[$traceurRuntime.toProperty(key)] = cache_disabled;
      return undefined;
    }
    if (!caches[$traceurRuntime.toProperty(key)])
      caches[$traceurRuntime.toProperty(key)] = [];
    return caches[$traceurRuntime.toProperty(key)];
  };
};
var cache = createCache();
var mGenerator = function(generatorFunc) {
  var options = arguments[1] !== (void 0) ? arguments[1] : {};
  var origGenerator = mGeneratorUnCached(generatorFunc, options);
  ;
  if (origGenerator.isTom)
    origGenerator[$traceurRuntime.toProperty(wu.iteratorSymbol)] = doCache(origGenerator)[$traceurRuntime.toProperty(wu.iteratorSymbol)];
  return origGenerator;
};
function* doCache(node) {
  var cacheKey = "" + node;
  console.log(cacheKey);
  var cached = cache(cacheKey);
  if (cached === cache_disabled) {
    yield* getIterator(node);
    return;
  }
  var count = 0;
  var iterator = null;
  while (true) {
    if (cached.length <= count || count > cacheLimit) {
      if (iterator == null) {
        node = MSkip(count, node);
        if (count > cacheLimit) {
          cache(cacheKey, true);
        }
        iterator = getIterator(node);
      }
      var n = iterator.next();
      if (n.done)
        break;
      if (count > cacheLimit) {
        yield n.value;
        yield* iterator;
        return;
      }
      cached.push(n.value);
    }
    yield cached[$traceurRuntime.toProperty(count++)];
  }
}
;
var stackTrace = require('stack-trace');
var path = process.cwd();
var mGeneratorUnCached = function(generator) {
  var options = arguments[1] !== (void 0) ? arguments[1] : {};
  var name = options.nameOverride || generator.name;
  var getIterable = function() {
    for (var args = [],
        $__3 = 0; $__3 < arguments.length; $__3++)
      args[$traceurRuntime.toProperty($__3)] = arguments[$traceurRuntime.toProperty($__3)];
    var res = Object.create(M.prototype);
    res.isTom = true;
    res.name = name;
    res[$traceurRuntime.toProperty(wu.iteratorSymbol)] = (function() {
      return generator.apply(null, $traceurRuntime.spread(args));
    });
    if (options.toStringOverride)
      res.toString = (function() {
        return options.toStringOverride;
      });
    else
      prettyToString(name, args, res);
    return res;
  };
  getIterable.displayName = name;
  return getIterable.length > 0 ? wu.curryable(getIterable) : getIterable;
};
function Chainable() {
  var wrapObject = arguments[0] !== (void 0) ? arguments[0] : null;
  this.wrap = wrapObject;
}
var nothing = Object.freeze({});
function M() {
  var wrapObject = arguments[0] !== (void 0) ? arguments[0] : nothing;
  this.wrapObject = wrapObject;
  if (isIterable(wrapObject)) {
    this[$traceurRuntime.toProperty(wu.iteratorSymbol)] = wrapObject[$traceurRuntime.toProperty(wu.iteratorSymbol)];
    this.name = wrapObject.name;
    this.toString = wrapObject.toString;
    this.isTom = wrapObject.isTom;
  }
}
var m = function() {
  var wrapObject = arguments[0] !== (void 0) ? arguments[0] : nothing;
  return new M(wrapObject);
};
m.prototype = M.prototype;
console.log(m.prototype);
var addFunction = function(name, func) {
  var options = arguments[2] !== (void 0) ? arguments[2] : nothing;
  M.prototype[$traceurRuntime.toProperty(name)] = function() {
    for (var args = [],
        $__3 = 0; $__3 < arguments.length; $__3++)
      args[$traceurRuntime.toProperty($__3)] = arguments[$traceurRuntime.toProperty($__3)];
    if (options.notChainable)
      return func(this.wrapObject);
    var callArgs = (this.wrapObject != nothing && !options.noInputChain) ? $traceurRuntime.spread(args, [this.wrapObject]) : args;
    var res = func.apply(null, $traceurRuntime.spread(callArgs));
    var wrapped = m(res);
    return wrapped;
  };
};
addFunction(doCache);
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
  addFunction(func.name, func, {notChainable: true});
}
addGenerator(function* val(value) {
  if (value instanceof Object)
    yield immutableObj(value);
  else
    yield value;
});
