"use strict";
var $__1;
Object.defineProperties(exports, {
  immutableTom: {get: function() {
      return immutableTom;
    }},
  objIsImmutable: {get: function() {
      return objIsImmutable;
    }},
  isLazy: {get: function() {
      return isLazy;
    }},
  addLazyProp: {get: function() {
      return addLazyProp;
    }},
  addObjectProp: {get: function() {
      return addObjectProp;
    }},
  addObjectProps: {get: function() {
      return addObjectProps;
    }},
  __esModule: {value: true}
});
var $___46__46__47_lib_47_utils__;
var _ = require("lodash");
var isIterable = ($___46__46__47_lib_47_utils__ = require("../lib/utils"), $___46__46__47_lib_47_utils__ && $___46__46__47_lib_47_utils__.__esModule && $___46__46__47_lib_47_utils__ || {default: $___46__46__47_lib_47_utils__}).isIterable;
const nothing = Object.freeze({reallyNothing: true});
const deleteMe = {DELETED: true};
const isImmutable = Symbol("isImmutableTom");
var undefinedToNull = (function(val) {
  return (val === undefined) ? null : val;
});
const getFunc = ((function(target, newProps, name) {
  var res;
  if (newProps && newProps.hasOwnProperty(name))
    res = newProps[name];
  else
    res = target[name];
  return res === deleteMe ? undefined : res;
}));
const keysFunc = ((function(oldKeys, newKeys, newProps) {
  return _.filter(_.union(oldKeys(), newKeys()), (function(k) {
    return !(newProps[k] == deleteMe);
  }));
}));
const convertFuncToVal = function(val, target) {
  return ((typeof val === "function" && val.length <= 1) ? val(target) : val);
};
var wrapNewProps = (function(target, newProps) {
  if (!(newProps instanceof Object)) {
    console.log("newProps", newProps);
    console.log("stacktrace", require("stack-trace").get().map((function(s) {
      return s.getFileName() + ":" + s.getLineNumber() + ":" + s.getFunctionName();
    })));
    throw new TypeError("trying to add props that are not object" + newProps);
  }
  const delFunc = (function(name) {
    return setFunc(name, deleteMe);
  });
  const setFunc = (function(name) {
    var val = arguments[1] !== (void 0) ? arguments[1] : nothing;
    var $__1;
    return wrapNewProps(newProxy, val != nothing ? ($__1 = {}, Object.defineProperty($__1, name, {
      value: val,
      configurable: true,
      enumerable: true,
      writable: true
    }), $__1) : name);
  });
  const hasCheck = _.memoize((function(name) {
    return (newProps.hasOwnProperty(name) && newProps[name] != deleteMe) || (!newProps.hasOwnProperty(name) && target.hasOwnProperty(name));
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
        return delFunc;
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
const empty = ($__1 = {}, Object.defineProperty($__1, isImmutable, {
  value: true,
  configurable: true,
  enumerable: true,
  writable: true
}), $__1);
const immutableTom = function() {
  var initial = arguments[0] !== (void 0) ? arguments[0] : {};
  if (!(initial instanceof Object))
    return initial;
  if (initial[isImmutable])
    return initial;
  if (isIterable(initial))
    console.warn("initial is iterable, making an immutable object may mean we lose the Symbol.iterator", initial);
  return wrapNewProps(empty, initial);
};
function objIsImmutable(obj) {
  return obj && obj[isImmutable];
}
var isLazy = Symbol("Lazy Resolving Function");
var addLazyProp = (function(obj, name, resolveFunc) {
  resolveFunc.isLazy = true;
  return obj.set(name, resolveFunc);
});
var processVal = (function(obj, name, value) {
  return (typeof value === "function" && value.length <= 1 && name.length > 0 && name != "toString" && name != "toJSON" && name != "valueOf") ? value(obj) : value;
});
var addObjectProp = (function(obj, name, value) {
  return obj.set(name, processVal(obj, name, value));
});
var addObjectProps = (function(obj, props) {
  if (typeof props.time == "object") {
    throw Error("time shouldn't be object");
  }
  var propsNew = {};
  for (var $__2 = Object.keys(props)[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__3; !($__3 = $__2.next()).done; ) {
    let k = $__3.value;
    propsNew[k] = processVal(obj, k, props[k]);
  }
  return obj.set(propsNew, nothing);
});
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
