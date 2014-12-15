

var _ = require("lodash");
var Proxy=require('harmony-proxy');

const nothing = {};

const deleteMe= {DELETED:true};


// TODO: not using deep yet
var immutableTom = function(initial={}, deep=false) {
  var wrapNewProps = (target, newProps, deep) => {
    // console.log("wrapping",target," with newProps",newProps);
    // console.log("adding ",newProps,"to",target)
    var setFunc = (name, val=deleteMe) => wrapNewProps(newProxy, typeof name === "string" ? {[name]:val}:name,deep);

    var getFunc = _.memoize(name => {
      var res = newProps && newProps.hasOwnProperty(name) && newProps.hasOwnProperty(name) ? newProps[name] : target[name];
      return res === deleteMe ? undefined:res;
    });

    var keysFunc = _.memoize(() => _.filter(_.union(Object.keys(target),Object.keys(newProps)),(k) => !(newProps[k] == deleteMe)));

    var hasCheck = _.memoize((name) =>
      (newProps.hasOwnProperty(name) && newProps[name] != deleteMe) || (!newProps.hasOwnProperty(name) && target.hasOwnProperty(name) && target[name] != deleteMe));

    var getPropDescriptor = _.memoize(name => name==="set"? {value: setFunc, enumerable:false,configurable:true} : (getFunc(name) === undefined ? undefined : {value: getFunc(name), enumerable:true, configurable:true}));

    var newProxy = new Proxy(nothing, {
      get: (t, name, receiver) => {
        if (name === "set")
          return setFunc;
        if (name === "delete")
          return setFunc;
        if (name === "isImmutable")
          return true;
        // if (name === "toString")
        //   return () => "vlaaaa";
        return getFunc(name);
      },
      set: (...args) => {throw ["tried mutating immutableTom",args,""+target]},
      has: (t, name) => hasCheck(name),
      hasOwn: (t, name) => hasCheck(name),
      iterate: (t) => keysFunc().map(k => getFunc(k)),
      enumerate: keysFunc,
      preventExtension: () => false,
      isExtensible: () => true,
      ownKeys: keysFunc,
      getPropertyNames: keysFunc,
      getOwnPropertyNames: keysFunc,
      getOwnPropertyDescriptor: (t,name) => getPropDescriptor(name),
      deleteProperty: (...args) => {throw ["tried deleting from immutableTom",args,target]},
      defineProperty: (...args) => {throw ["tried defining a property of immutableTom"]},
    });
    return newProxy;
  }
  return wrapNewProps(nothing,initial, deep);
}

var assert = require("assert");

var test1 = immutableTom({bla:2}).set("test",5);

assert.equal(test1.bla,2);
assert.equal(test1.test,5);

assert.throws(() => test1.x = 2);

assert.throws(() => delete test1.bla );

var deletedProp = test1.delete("bla");

assert.equal(deletedProp.bla,undefined);
assert.equal(deletedProp.hasOwnProperty("bla"),false);

console.log("immutableTom Test1", test1, test1.test, deletedProp, Object.keys(test1));

 // throw "bye";

export default immutableTom;
