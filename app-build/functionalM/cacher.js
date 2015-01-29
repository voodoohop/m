"use strict";
var $__baseLib__,
    $___46__46__47_lib_47_utils__,
    $___46__46__47_functionalMonads__;
var addGenerator = ($__baseLib__ = require("./baseLib"), $__baseLib__ && $__baseLib__.__esModule && $__baseLib__ || {default: $__baseLib__}).addGenerator;
var $__1 = ($___46__46__47_lib_47_utils__ = require("../lib/utils"), $___46__46__47_lib_47_utils__ && $___46__46__47_lib_47_utils__.__esModule && $___46__46__47_lib_47_utils__ || {default: $___46__46__47_lib_47_utils__}),
    isIterable = $__1.isIterable,
    getIterator = $__1.getIterator;
var m = ($___46__46__47_functionalMonads__ = require("../functionalMonads"), $___46__46__47_functionalMonads__ && $___46__46__47_functionalMonads__.__esModule && $___46__46__47_functionalMonads__ || {default: $___46__46__47_functionalMonads__}).m;
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
addGenerator(function* doCache(node) {
  var cacheKey = "" + node;
  var cached = cache(cacheKey);
  if (cached === cache_disabled) {
    yield* getIterator(node);
    return ;
  }
  var count = 0;
  var iterator = null;
  while (true) {
    if (cached.length <= count || count > cacheLimit) {
      if (iterator == null) {
        node = m(node).skip(count);
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
        return ;
      }
      cached.push(n.value);
    }
    yield cached[count++];
  }
});
