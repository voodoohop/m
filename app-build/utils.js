"use strict";
Object.defineProperties(exports, {
  generatorize: {get: function() {
      return generatorize;
    }},
  isIterable: {get: function() {
      return isIterable;
    }},
  getIterator: {get: function() {
      return getIterator;
    }},
  fixFloat: {get: function() {
      return fixFloat;
    }},
  clone: {get: function() {
      return clone;
    }},
  addObjectProps: {get: function() {
      return addObjectProps;
    }},
  addObjectProp: {get: function() {
      return addObjectProp;
    }},
  addFuncProp: {get: function() {
      return addFuncProp;
    }},
  toStringDetailed: {get: function() {
      return toStringDetailed;
    }},
  toStringObject: {get: function() {
      return toStringObject;
    }},
  prettyToString: {get: function() {
      return prettyToString;
    }},
  __esModule: {value: true}
});
var $__wu__;
var wu = ($__wu__ = require("./wu"), $__wu__ && $__wu__.__esModule && $__wu__ || {default: $__wu__}).wu;
var generatorize = function(fn) {
  return function() {
    for (var params = [],
        $__6 = 0; $__6 < arguments.length; $__6++)
      params[$__6] = arguments[$__6];
    if (params.length == 1)
      params = params[0];
    if (!isIterable(params) && !(typeof params === "function"))
      return fn(params);
    return function*() {
      for (var $__2 = getIterator(params)[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__3; !($__3 = $__2.next()).done; ) {
        let p = $__3.value;
        yield fn(p);
      }
    };
  };
};
const isIterable = (function(thing) {
  return thing && typeof thing[wu.iteratorSymbol] === "function" && typeof thing != "string";
});
const getIterator = (function(thing) {
  if (isIterable(thing))
    return thing[wu.iteratorSymbol]();
  throw new TypeError("Not iterable: " + thing);
});
const fixFloat = (function(n) {
  return parseFloat(n.toPrecision(12));
});
var objectsCloned = 0;
const clone = function(obj) {
  objectsCloned++;
  if (objectsCloned % 5000 == 0)
    console.log("cloned", objectsCloned);
  if (!(obj instanceof Object)) {
    return obj;
  }
  var descriptors = {};
  Object.getOwnPropertyNames(obj).forEach(function(name) {
    var prop = Object.getOwnPropertyDescriptor(obj, name);
    prop.configurable = true;
    descriptors[name] = prop;
  });
  return Object.create(Object.getPrototypeOf(obj), descriptors);
};
var addObjectProps = function(eventObject, props) {
  var enumerable = arguments[2] !== (void 0) ? arguments[2] : true;
  if (!props instanceof Object)
    return props;
  var keys = Object.keys(props);
  if (keys.length == 0)
    return eventObject;
  var descriptor = {};
  for (var $__2 = Object.getOwnPropertyNames(eventObject)[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__3; !($__3 = $__2.next()).done; ) {
    let propN = $__3.value;
    descriptor[propN] = Object.getOwnPropertyDescriptor(eventObject, propN);
  }
  for (var $__4 = keys[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    let key = $__5.value;
    {
      var value = props[key];
      if (enumerable && typeof value === "function" && value.length <= 1) {
        if (key != "toString" && key != "valueOf") {
          var functor = value;
          value = functor(eventObject);
          value.functor = functor;
        }
      }
      descriptor[key] = {
        configurable: true,
        enumerable: enumerable,
        value: value
      };
    }
  }
  var obj = Object.create({}, descriptor);
  return Object.freeze(obj);
};
var addObjectProp = function(eventObject, name, value) {
  var enumerable = arguments[3] !== (void 0) ? arguments[3] : true;
  var $__1;
  if (eventObject[name] === value) {
    return eventObject;
  }
  return addObjectProps(eventObject, ($__1 = {}, Object.defineProperty($__1, name, {
    value: value,
    configurable: true,
    enumerable: true,
    writable: true
  }), $__1), enumerable);
};
var addFuncProp = function(eventObject, name, func) {
  var jsPropDescriptor = {
    configurable: true,
    enumerable: true,
    get: func
  };
  var newObject = clone(eventObject);
  Object.defineProperty(newObject, name, jsPropDescriptor);
  return newObject;
};
var toStringDetailed = function(v) {
  if (typeof v == "object") {
    if (!isIterable(v) && !v.isTom) {
      return JSON.stringify(v);
    }
  }
  return "" + v;
};
var toStringObject = function(o) {
  if (typeof o == "object") {
    o.prototype.toString = (function() {
      return "tooostring";
    });
  }
  return o;
};
var prettyToString = function(name, args, destFunc) {
  destFunc.toString = (function() {
    return name + "(" + args.map(toStringDetailed).join(", ") + ")";
  });
  destFunc.inspect = destFunc.toString;
  return destFunc;
};
