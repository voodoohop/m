"use strict";
var $__baseLib__;
var addGenerator = ($__baseLib__ = require("./baseLib"), $__baseLib__ && $__baseLib__.__esModule && $__baseLib__ || {default: $__baseLib__}).addGenerator;
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
addGenerator(doCache);
