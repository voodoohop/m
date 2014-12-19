var _ = require("lodash");
var Proxy = require('harmony-proxy');

const nothing = {};

const deleteMe = {
  DELETED: true
};


const getFunc = ((target, newProps, name) => {
  var res = newProps && newProps.hasOwnProperty(name) && newProps.hasOwnProperty(name) ? newProps[name] : target[name];
  return res === deleteMe ? undefined : res;
});

const keysFunc = ((oldKeys, newKeys, newProps) => _.filter(_.union(oldKeys(), newKeys()), (k) => !(newProps[k] == deleteMe)));


var wrapNewProps = (target, newProps, deep) => {
  // console.log("wrapping",target," with newProps",newProps);
  // console.log("adding ",newProps,"to",target)

  const setFunc = (name, val = deleteMe) => wrapNewProps(newProxy, typeof name === "string" ? {
    [name]: val
  } : name, deep);

  const hasCheck = _.memoize((name) =>
    (newProps.hasOwnProperty(name) && newProps[name] != deleteMe) || (!newProps.hasOwnProperty(name) && target.hasOwnProperty(name) && target[name] != deleteMe));

  const getPropDescriptor = _.memoize(name =>
    name === "set" ? {
      value: setFunc,
      enumerable: false,
      configurable: true
    } : (getFunc(target, newProps, name) === undefined ? undefined : {
      value: getFunc(target, newProps, name),
      enumerable: true,
      configurable: true
    }));

  var newKeysSave = null;
  const newKeys = function() {
    if (newKeysSave == null)
      newKeysSave = Object.keys(newProps);
    return newKeysSave;
  }; //Object.keys(newProps);

  var oldKeysSave = null;
  const oldKeys = function() {
    if (oldKeysSave == null)
      oldKeysSave = Object.keys(target);
    return oldKeysSave;
  }
  const handler = {
    get: (t, name, receiver) => {
      if (name === "set")
        return setFunc;
        if (name === "delete")
          return setFunc;
          if (name === "isImmutable")
            return true;
            // if (name === "toString")
            //   return () => "vlaaaa";
            return getFunc(target, newProps, name);
          },
          set: (...args) => {
            throw new Error(["tried mutating immutableTom", args, "" + target]);
          },
          has: (t, name) => hasCheck(name),
          hasOwn: (t, name) => hasCheck(name),
          iterate: (t) => keysFunc(oldKeys, newKeys, newProps).map(k => getFunc(target, newProps, k)),
          enumerate: () => keysFunc(oldKeys, newKeys, newProps),
          preventExtension: () => false,
          isExtensible: () => true,
          ownKeys: () => keysFunc(oldKeys, newKeys, newProps),
          getPropertyNames: () => keysFunc(oldKeys, newKeys, newProps),
          getOwnPropertyNames: () => keysFunc(oldKeys, newKeys, newProps),
          getOwnPropertyDescriptor: (t, name) => getPropDescriptor(name),
          getPrototypeOf: () => nothing,
          setPrototypeOf: () => {throw new Error(["tried deleting from immutableTom", args, target])},
          deleteProperty: (...args) => {
            throw ["tried deleting from immutableTom", args, target]
          },
          defineProperty: (...args) => {
            throw new Error("tried defining a property of immutableTom")
          },
        };
  const newProxy = new Proxy(target, handler);
  return newProxy;
}

// TODO: not using deep yet
export const immutableTom = function(initial = {}, deep = false) {

  return wrapNewProps(nothing, initial, deep);
}

var assert = require("assert");

var test1 = immutableTom({
  bla: 2
}).set("test", 5);

assert.equal(test1.bla, 2);
assert.equal(test1.test, 5);

assert.throws(() => test1.x = 2);

assert.throws(() => delete test1.bla);

var deletedProp = test1.delete("bla");

assert.equal(deletedProp.bla, undefined);
assert.equal(deletedProp.hasOwnProperty("bla"), false);

console.log("immutableTom Test1", test1, test1.test, deletedProp, Object.keys(test1));

// throw "bye";



export var addObjectProp = (obj, name, val, enumerable) => obj.set(name, val);
export var addObjectProps = (obj, props, enumerable) => {
  // console.log("adding to immuuutable",obj,props,obj.set);
  props = _.mapValues(props, (value) => (typeof value === "function" && value.length <= 1) ? value(obj) : value);
  return obj.set(props);
}
