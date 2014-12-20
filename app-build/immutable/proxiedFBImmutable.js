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
var Proxy = require('harmony-proxy');
var Immutable = require("immutable");
const nothing = {};
const deleteMe = {DELETED: true};
const getFunc = ((function(target, newProps, name) {
  var res = newProps && newProps.hasOwnProperty(name) && newProps.hasOwnProperty(name) ? newProps[$traceurRuntime.toProperty(name)] : target[$traceurRuntime.toProperty(name)];
  return res === deleteMe ? undefined : res;
}));
const keysFunc = ((function(oldKeys, newKeys, newProps) {
  return _.filter(_.union(oldKeys(), newKeys()), (function(k) {
    return !(newProps[$traceurRuntime.toProperty(k)] == deleteMe);
  }));
}));
var wrapNewProps = (function(target, newProps, deep) {
  const setFunc = (function(name) {
    var val = arguments[1] !== (void 0) ? arguments[1] : deleteMe;
    var $__0;
    return wrapNewProps(newProxy, typeof name === "string" ? ($__0 = {}, Object.defineProperty($__0, name, {
      value: val,
      configurable: true,
      enumerable: true,
      writable: true
    }), $__0) : name, deep);
  });
  const hasCheck = _.memoize((function(name) {
    return (newProps.hasOwnProperty(name) && newProps[$traceurRuntime.toProperty(name)] != deleteMe) || (!newProps.hasOwnProperty(name) && target.hasOwnProperty(name) && target[$traceurRuntime.toProperty(name)] != deleteMe);
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
  const newProxy = new Proxy(target, handler);
  return newProxy;
});
const immutableTom = function() {
  var initial = arguments[0] !== (void 0) ? arguments[0] : {};
  var deep = arguments[1] !== (void 0) ? arguments[1] : false;
  return wrapNewProps(nothing, initial, deep);
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
  return obj.set(props);
});
const handler = {
  get: (function(t, name, receiver) {
    if (name === "set")
      return setFunc;
    if (name === "delete")
      return setFunc;
    if (name === "isImmutable")
      return true;
    return getFunc(target, newProps, name);
  }),
  set: (function() {
    for (var args = [],
        $__1 = 0; $__1 < arguments.length; $__1++)
      args[$traceurRuntime.toProperty($__1)] = arguments[$traceurRuntime.toProperty($__1)];
    throw ["tried mutating immutableTom", args, "" + target];
  }),
  has: (function(t, name) {
    return hasCheck(name);
  }),
  hasOwn: (function(t, name) {
    return hasCheck(name);
  }),
  iterate: (function(t) {
    return keysFunc(oldKeys, newKeys, newProps).map((function(k) {
      return getFunc(target, newProps, k);
    }));
  }),
  enumerate: (function() {
    return keysFunc(oldKeys, newKeys, newProps);
  }),
  preventExtension: (function() {
    return false;
  }),
  isExtensible: (function() {
    return true;
  }),
  ownKeys: (function() {
    return keysFunc(oldKeys, newKeys, newProps);
  }),
  getPropertyNames: (function() {
    return keysFunc(oldKeys, newKeys, newProps);
  }),
  getOwnPropertyNames: (function() {
    return keysFunc(oldKeys, newKeys, newProps);
  }),
  getOwnPropertyDescriptor: (function(t, name) {
    return getPropDescriptor(name);
  }),
  deleteProperty: (function() {
    for (var args = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      args[$traceurRuntime.toProperty($__2)] = arguments[$traceurRuntime.toProperty($__2)];
    throw ["tried deleting from immutableTom", args, target];
  }),
  defineProperty: (function() {
    for (var args = [],
        $__3 = 0; $__3 < arguments.length; $__3++)
      args[$traceurRuntime.toProperty($__3)] = arguments[$traceurRuntime.toProperty($__3)];
    throw ["tried defining a property of immutableTom"];
  })
};
