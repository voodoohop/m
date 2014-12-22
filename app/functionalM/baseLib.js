import {
  wu
}
from "../lib/wu";

import {
  prettyToString, toStringObject, toStringDetailed, addFuncProp, /*clone, addObjectProp, addObjectProps, */ isIterable, getIterator, fixFloat
}
from "../lib/utils";

import {
  immutableTom as immutableObj, addObjectProp, addObjectProps
}
from "../immutable/nodeProxiedImmutable";

var util = require("util");

var _ = require("lodash");


  var logDetails = true;


// // TODO: work in progress
// TODO: change to one option param
var Immutable = require("immutable");
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

var mGenerator = function(generatorFunc, options={}) {
  var origGenerator = mGeneratorUnCached(generatorFunc, options);;
  if (origGenerator.isTom)
    origGenerator[wu.iteratorSymbol] = doCache(origGenerator)[wu.iteratorSymbol];
  return origGenerator;
};

function* doCache(node) {
  // yield * getIterator(node);
  // return;

  var cacheKey = "" + node;
  console.log(cacheKey);
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



var stackTrace = require('stack-trace');

var path = process.cwd();


var mGeneratorUnCached = function(generator, options = {}) {
  var name = options.nameOverride || generator.name;
  var getIterable = function(...args) {
    // var trace = stackTrace.get();
    // console.log(path);
    // console.log(trace.map(t => t.toString().replace(path,"")).filter(t => t.indexOf("evalmachine")>=0));

    var res = new M();
    res.isTom = true;
    res.name = name;

    res[wu.iteratorSymbol] = () => generator(...args);
    if (options.toStringOverride)
      res.toString = () => options.toStringOverride;
    else {
      // console.log(name,args,res);
        prettyToString(name, args, res);
    }
    return res;
  }
  getIterable.displayName = name;
  return getIterable.length > 0 ? wu.curryable(getIterable) : getIterable;
}

var nothing = Object.freeze({});

var wrappedSymbol = Symbol("M wrapped Object");



function M(wrapObject = nothing) {
  // this.MLibrary = "version_0.2";
  if (!isIterable(wrapObject) && wrapObject != nothing)
    wrapObject = M.prototype.data(wrapObject);
  if (isIterable(wrapObject)) {
    this[wrappedSymbol] = wrapObject;
    this[wu.iteratorSymbol] = wrapObject[wu.iteratorSymbol];
    this.name = wrapObject.name;
    this.toString = wrapObject.toString;
    this.isTom = wrapObject.isTom;
  } else {
    if (wrapObject != nothing && wrapObject instanceof Object) {
      // console.log("typeof",typeof wrapObject,wrapObject);
      wrapObject = immutableObj(wrapObject);
    }
    this[wrappedSymbol] = wrapObject;
  }
}

export var m = function(wrapObject = nothing) {

  return new M(wrapObject);
}

m.prototype = M.prototype;

console.log(m.prototype);


var addFunction = function(name, func, options=nothing) {
  M.prototype[name] = function(...args) {
    // console.log("this in prototype",this);
    if (options.notChainable)
      return func(this[wrappedSymbol]);

    // var argument = isIterable(this) ? this : this[wrappedSymbol];
    var callArgs = (this[wrappedSymbol] != nothing && !options.noInputChain) ? [...args, this[wrappedSymbol]] : args;
    // if (logDetails)
    //   console.log("call".bold,name, "being called on", callArgs);
    var res = func(...callArgs);
    var wrapped = m(res);
    return wrapped;
  }
}




addFunction(doCache);


// process.exit(1);

// A decorator for rewrapping a method's returned iterable in m to maintain
// chainability.
// const rewrap = fn => function (...args) {
//   return m(fn.call(this, ...args));
// };


// var addFunction = function(name, func, chaining=true) {
//   M.prototype[name] = function(...args) {
//
//     console.log(this);
//     return this;
//
//     if (args.length == 0  || args[args.length-1].prototype != M.prototype) {
//       console.log("first in chain",name);
//
//     }
//     var res;
//     if (this.res) {
//       // if (name == "take") {
//       // console.log("args",[...args,this].length);
//       // args.push(this.res);
//       // process.exit(1);
//       // }
//       res = func(...[...args,this.res]);
//     }
//     else {
//       console.log("start of chain")
//       res = func(...args);
//     }
//     console.log(name,":",this);
//     // if (res[wu.iteratorSymbol])
//     //   this[wu.iteratorSymbol]=res[wu.iteratorSymbol];
//
//     if (chaining) {
//       return this;
//     }
//     else {
//       console.log("end of chain", name,"res",res);
//       delete this.res;
//       return res;
//     }
//     // return chaining ? this : res;
//   }
// }
//


export function addGenerator(generatorFunc, options={},thirdOption=false) {
  if (thirdOption)
    throw "thirdOption removed";


  // console.log("name:",nameOverride || generatorFunc.name);
  if (!(options.nameOverride || generatorFunc.name).length)
    throw "no name given" + generatorFunc;
  addFunction(options.nameOverride || generatorFunc.name, mGenerator(generatorFunc,options), options);
}

export function addChainEndFunction(func) {
  addFunction(func.name, func, {notChainable:true});
}


addGenerator(function* val(value) {
  if (value instanceof Object)
    yield immutableObj(value);
  else
    yield value;
});
