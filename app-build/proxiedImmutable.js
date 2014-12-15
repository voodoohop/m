"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var _ = require("lodash");
var Proxy = require('harmony-proxy');
var nothing = {};
var deleteMe = {DELETED: true};
var immutableTom = function() {
  var initial = arguments[0] !== (void 0) ? arguments[0] : {};
  var deep = arguments[1] !== (void 0) ? arguments[1] : false;
  var wrapNewProps = (function(target, newProps, deep) {
    var setFunc = (function(name) {
      var val = arguments[1] !== (void 0) ? arguments[1] : deleteMe;
      var $__0;
      return wrapNewProps(newProxy, typeof name === "string" ? ($__0 = {}, Object.defineProperty($__0, name, {
        value: val,
        configurable: true,
        enumerable: true,
        writable: true
      }), $__0) : name, deep);
    });
    var getFunc = _.memoize((function(name) {
      var res = newProps && newProps.hasOwnProperty(name) && newProps.hasOwnProperty(name) ? newProps[name] : target[name];
      return res === deleteMe ? undefined : res;
    }));
    var keysFunc = _.memoize((function() {
      return _.filter(_.union(Object.keys(target), Object.keys(newProps)), (function(k) {
        return !(newProps[k] == deleteMe);
      }));
    }));
    var hasCheck = _.memoize((function(name) {
      return (newProps.hasOwnProperty(name) && newProps[name] != deleteMe) || (!newProps.hasOwnProperty(name) && target.hasOwnProperty(name) && target[name] != deleteMe);
    }));
    var getPropDescriptor = _.memoize((function(name) {
      return name === "set" ? {
        value: setFunc,
        enumerable: false,
        configurable: true
      } : (getFunc(name) === undefined ? undefined : {
        value: getFunc(name),
        enumerable: true,
        configurable: true
      });
    }));
    var newProxy = new Proxy(nothing, {
      get: (function(t, name, receiver) {
        if (name === "set")
          return setFunc;
        if (name === "delete")
          return setFunc;
        if (name === "isImmutable")
          return true;
        return getFunc(name);
      }),
      set: (function() {
        for (var args = [],
            $__1 = 0; $__1 < arguments.length; $__1++)
          args[$__1] = arguments[$__1];
        throw ["tried mutating immutableTom", args, "" + target];
      }),
      has: (function(t, name) {
        return hasCheck(name);
      }),
      hasOwn: (function(t, name) {
        return hasCheck(name);
      }),
      iterate: (function(t) {
        return keysFunc().map((function(k) {
          return getFunc(k);
        }));
      }),
      enumerate: keysFunc,
      preventExtension: (function() {
        return false;
      }),
      isExtensible: (function() {
        return true;
      }),
      ownKeys: keysFunc,
      getPropertyNames: keysFunc,
      getOwnPropertyNames: keysFunc,
      getOwnPropertyDescriptor: (function(t, name) {
        return getPropDescriptor(name);
      }),
      deleteProperty: (function() {
        for (var args = [],
            $__2 = 0; $__2 < arguments.length; $__2++)
          args[$__2] = arguments[$__2];
        throw ["tried deleting from immutableTom", args, target];
      }),
      defineProperty: (function() {
        for (var args = [],
            $__3 = 0; $__3 < arguments.length; $__3++)
          args[$__3] = arguments[$__3];
        throw ["tried defining a property of immutableTom"];
      })
    });
    return newProxy;
  });
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
var $__default = immutableTom;
