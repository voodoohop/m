var _ = require("lodash");

const nothing = Object.freeze({});

const deleteMe = {
  DELETED: true
};


const getFunc = ((target, newProps, name) => {
  const res = newProps && newProps.hasOwnProperty(name) ? newProps[name] : target[name];
  // console.log("res", name, res && res.length, ""+res);
  return res === deleteMe ? undefined : res;//;
});

const keysFunc = ((oldKeys, newKeys, newProps) => _.filter(_.union(oldKeys(), newKeys()), (k) => !(newProps[k] == deleteMe)));

const convertFuncToVal = function(val,target) {
  return ((typeof val === "function" && val.length <= 1) ? val(target) : val);
}

var wrapNewProps = (target, newProps, deep) => {
  // console.log("wrapping",target," with newProps",newProps);
  // console.log("adding ",newProps,"to",target)


  const delFunc = (name) => setFunc(name, deleteMe);

  const setFunc = (name, val = nothing) => wrapNewProps(newProxy,
    val != nothing ?
    { [name]: val} : name,
  deep);

  const hasCheck = _.memoize((name) =>
    (newProps.hasOwnProperty(name) && newProps[name] != deleteMe) || (!newProps.hasOwnProperty(name) && target.hasOwnProperty(name)));

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
    get: (t, name) => {
      if (name === "set")
        return setFunc;
      if (name === "delete")
        return delFunc;
      // if (name === "isImmutable")
      //   return true;
      // if (name === "toString")
      //   return () => "vlaaaa";
      return getFunc(target, newProps, name);
    },
    has: (name) => hasCheck(name),
    hasOwn: (name) => hasCheck(name),
    iterate: () => keysFunc(oldKeys, newKeys, newProps).map(k => getFunc(target, newProps, k)),
    enumerate: () => keysFunc(oldKeys, newKeys, newProps),
    keys: () => keysFunc(oldKeys, newKeys, newProps),
    getPropertyNames: () => keysFunc(oldKeys, newKeys, newProps),
    getOwnPropertyNames: () => keysFunc(oldKeys, newKeys, newProps),
    getPropertyDescriptor: (name) => getPropDescriptor(name),
    getOwnPropertyDescriptor: (name) => getPropDescriptor(name),
  };
  const newProxy = Proxy.create(handler);
  return newProxy;
}

// TODO: not using deep yet
export const immutableTom = function(initial = {}, deep = false) {

  return wrapNewProps(initial, nothing, deep);
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



export var addObjectProp = (obj, name, value, enumerable) => {
  // if (typeof value === "function" && value.length <= 1)
  //   value = value(obj);
  return obj.set(name, value);
}
export var addObjectProps = (obj, props, enumerable) => {
  // console.log("adding to immuuutable",obj,props,obj.set);
  props = _.mapValues(props, (value) => (typeof value === "function" && value.length <= 1) ? value(obj) : value);
  // console.log("ppppppp");
  // console.log("props after",props,obj);

  return obj.set(props, nothing);
}
