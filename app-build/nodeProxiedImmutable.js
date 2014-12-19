"use strict";
Object.defineProperties(exports, {
  immutableTom: {get: function() {
      return immutableTom;
    }},
  addObjectProp: {get: function() {
      return addObjectProp;
    }},
  addObjectProps: {get: function() {
      return addObjectProps;
    }},
  __esModule: {value: true}
});
var _ = require("lodash");
const nothing = Object.freeze({});
const deleteMe = {DELETED: true};
const getFunc = ((function(target, newProps, name) {
  const res = newProps && newProps.hasOwnProperty(name) ? newProps[$traceurRuntime.toProperty(name)] : target[$traceurRuntime.toProperty(name)];
  return res === deleteMe ? undefined : res;
}));
const keysFunc = ((function(oldKeys, newKeys, newProps) {
  return _.filter(_.union(oldKeys(), newKeys()), (function(k) {
    return !(newProps[$traceurRuntime.toProperty(k)] == deleteMe);
  }));
}));
const convertFuncToVal = function(val, target) {
  return ((typeof val === "function" && val.length <= 1) ? val(target) : val);
};
var wrapNewProps = (function(target, newProps, deep) {
  const setFunc = (function(name) {
    var val = arguments[1] !== (void 0) ? arguments[1] : deleteMe;
    var $__0;
    return wrapNewProps(newProxy, val != nothing ? ($__0 = {}, Object.defineProperty($__0, name, {
      value: val,
      configurable: true,
      enumerable: true,
      writable: true
    }), $__0) : name, deep);
  });
  const hasCheck = _.memoize((function(name) {
    return (newProps.hasOwnProperty(name) && newProps[$traceurRuntime.toProperty(name)] != deleteMe) || (!newProps.hasOwnProperty(name) && target.hasOwnProperty(name));
  }));
  const getPropDescriptor = _.memoize((function(name) {
    return name === "set" ? {
      value: setFunc,
      enumerable: false,
      configurable: true
    } : (getFunc(target, newProps, name) === undefined ? undefined : {
      value: getFunc(target, newProps, name),
      enumerable: true,
      configurable: true
    });
  }));
  var newKeysSave = null;
  const newKeys = function() {
    if (newKeysSave == null)
      newKeysSave = Object.keys(newProps);
    return newKeysSave;
  };
  var oldKeysSave = null;
  const oldKeys = function() {
    if (oldKeysSave == null)
      oldKeysSave = Object.keys(target);
    return oldKeysSave;
  };
  const handler = {
    get: (function(t, name) {
      if (name === "set")
        return setFunc;
      if (name === "delete")
        return setFunc;
      return getFunc(target, newProps, name);
    }),
    has: (function(name) {
      return hasCheck(name);
    }),
    hasOwn: (function(name) {
      return hasCheck(name);
    }),
    iterate: (function() {
      return keysFunc(oldKeys, newKeys, newProps).map((function(k) {
        return getFunc(target, newProps, k);
      }));
    }),
    enumerate: (function() {
      return keysFunc(oldKeys, newKeys, newProps);
    }),
    keys: (function() {
      return keysFunc(oldKeys, newKeys, newProps);
    }),
    getPropertyNames: (function() {
      return keysFunc(oldKeys, newKeys, newProps);
    }),
    getOwnPropertyNames: (function() {
      return keysFunc(oldKeys, newKeys, newProps);
    }),
    getPropertyDescriptor: (function(name) {
      return getPropDescriptor(name);
    }),
    getOwnPropertyDescriptor: (function(name) {
      return getPropDescriptor(name);
    })
  };
  const newProxy = Proxy.create(handler);
  return newProxy;
});
const immutableTom = function() {
  var initial = arguments[0] !== (void 0) ? arguments[0] : {};
  var deep = arguments[1] !== (void 0) ? arguments[1] : false;
  return wrapNewProps(initial, nothing, deep);
};
var assert = require("assert");
var test1 = immutableTom({bla: 2}).set("test", 5);
assert.equal(test1.bla, 2);
assert.equal(test1.test, 5);
assert.throws((function() {
  return test1.x = 2;
}));
assert.throws((function() {
  return delete test1.bla;
}));
var deletedProp = test1.delete("bla");
assert.equal(deletedProp.bla, undefined);
assert.equal(deletedProp.hasOwnProperty("bla"), false);
console.log("immutableTom Test1", test1, test1.test, deletedProp, Object.keys(test1));
var addObjectProp = (function(obj, name, val, enumerable) {
  return obj.set(name, val);
});
var addObjectProps = (function(obj, props, enumerable) {
  props = _.mapValues(props, (function(value) {
    return (typeof value === "function" && value.length <= 1) ? value(obj) : value;
  }));
  return obj.set(props, nothing);
});
