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
    $___46__46__47_immutable_47_nodeProxiedImmutable__,
    $___46__46__47_lib_47_findSourceStackPos__;
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
      caches[key] = cache_disabled;
      return undefined;
    }
    if (!caches[key])
      caches[key] = [];
    return caches[key];
  };
};
var cache = createCache();
function* doCache(node) {
  var cacheKey = "" + node;
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
    yield cached[count++];
  }
}
;
var stackTrace = require("stack-trace");
var findSourcePos = ($___46__46__47_lib_47_findSourceStackPos__ = require("../lib/findSourceStackPos"), $___46__46__47_lib_47_findSourceStackPos__ && $___46__46__47_lib_47_findSourceStackPos__.__esModule && $___46__46__47_lib_47_findSourceStackPos__ || {default: $___46__46__47_lib_47_findSourceStackPos__}).default;
function* runGenFeedback(generator, name, args) {
  var $__4;
  for (var $__5 = ($__4 = {}, Object.defineProperty($__4, wu.iteratorSymbol, {
    value: (function() {
      return generator.apply(null, $traceurRuntime.spread(args));
    }),
    configurable: true,
    enumerable: true,
    writable: true
  }), $__4)[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__6; !($__6 = $__5.next()).done; ) {
    let e = $__6.value;
    {
      if (e && e.appendStackTrace) {
        var sTrace = stackTrace.get().map((function(s) {
          return s.getFileName() + ":" + s.getLineNumber() + ":" + s.getColumnNumber;
        }));
        e = e.set({
          stack: sTrace.join("\n"),
          appendStackTrace: false
        });
      }
      var spos = findSourcePos();
      if (spos !== undefined)
        console.warn(name, spos);
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
        $__7 = 0; $__7 < arguments.length; $__7++)
      args[$__7] = arguments[$__7];
    var res = {};
    res.isTom = true;
    res.name = name;
    res[wu.iteratorSymbol] = (function() {
      return runGenFeedback(generator, name, args);
    });
    if (options.toStringOverride)
      res.toString = (function() {
        return options.toStringOverride;
      });
    else {
      res.toString = (function() {
        return prettyToString(name, args);
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
  this.parentNode = null;
  this[wu.iteratorSymbol] = node[wu.iteratorSymbol];
  Object.seal(this);
  Object.seal(node);
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
        $__7 = 0; $__7 < arguments.length; $__7++)
      args[$__7] = arguments[$__7];
    if (options.notChainable)
      return func(this.currentNode);
    var callArgs = (this.currentNode != rootNode && !options.noInputChain) ? $traceurRuntime.spread(args, [this.currentNode]) : args;
    var newNode = func.apply(null, $traceurRuntime.spread(callArgs));
    newNode.parentNode = this;
    return newNode;
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
