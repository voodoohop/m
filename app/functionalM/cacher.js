import {
  addGenerator
}
from "./baseLib";



var cacheLimit = 10;
var cache_disabled = {
  disabled: true
};

var createCache = function() {
  // var cache = new WeakMap();
  var caches = {};
  return function(key, disable) {
    if (disable) {
      caches[key] = cache_disabled;
      return undefined;
    }
    if (!caches[key])
      caches[key] = [];
    return caches[key];
  }
}



var cache = createCache();

// var mGenerator = function(generatorFunc, options={}) {
//   var origGenerator = mGeneratorUnCached(generatorFunc, options);;
//   if (origGenerator.isTom)
//     origGenerator[wu.iteratorSymbol] = doCache(origGenerator)[wu.iteratorSymbol];
//   return origGenerator;
// };

function* doCache(node) {
  // yield * getIterator(node);
  // return;

  var cacheKey = "" + node;
  // console.log(cacheKey);
  // console.log("cacheKey",cacheKey);
  // if (!caches[cacheKey]) {
  //   // console.log("not yet cashed".bgBlue.white,cacheKey);
  //   caches[cacheKey] = [];
  // }

  var cached = cache(cacheKey);
  if (cached === cache_disabled) {
    yield * getIterator(node);
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
          // console.warn("cache full", node);
        }
        iterator = getIterator(node);
      }
      var n = iterator.next();
      if (n.done)
        break;
      if (count > cacheLimit) {
        yield n.value;
        yield * iterator;
        return;
        //continue;
      }
      cached.push(n.value);
    }
    yield cached[count++];
  }

}

;
addGenerator(doCache);