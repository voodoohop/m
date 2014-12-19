"use strict";
Object.defineProperties(exports, {
  immutableObj: {get: function() {
      return immutableObj;
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
var immutableObj = function() {
  var initial = arguments[0] !== (void 0) ? arguments[0] : {};
  var extendWith = arguments[1];
  var $__0;
  const me = Object.create(($__0 = {}, Object.defineProperty($__0, "set", {
    value: (function() {
      for (var args = [],
          $__5 = 0; $__5 < arguments.length; $__5++)
        args[$traceurRuntime.toProperty($__5)] = arguments[$traceurRuntime.toProperty($__5)];
      var $__0;
      var val = args[0];
      if (args.length > 1) {
        val = ($__0 = {}, Object.defineProperty($__0, args[0], {
          value: args[1],
          configurable: true,
          enumerable: true,
          writable: true
        }), $__0);
      }
      return immutableObj(me, val);
    }),
    configurable: true,
    enumerable: true,
    writable: true
  }), $__0));
  for (var $__1 = Object.keys(initial)[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
      $__2; !($__2 = $__1.next()).done; ) {
    let k = $__2.value;
    {
      me[$traceurRuntime.toProperty(k)] = initial[$traceurRuntime.toProperty(k)];
    }
  }
  if (extendWith)
    for (var $__3 = Object.keys(extendWith)[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
        $__4; !($__4 = $__3.next()).done; ) {
      let k = $__4.value;
      {
        me[$traceurRuntime.toProperty(k)] = extendWith[$traceurRuntime.toProperty(k)];
      }
    }
  return Object.freeze(me);
};
var addObjectProp = (function(obj, name, val, enumerable) {
  return obj.set(name, val);
});
var addObjectProps = (function(obj, props, enumerable) {
  props = _.mapValues(props, (function(value) {
    return (typeof value === "function" && value.length <= 1) ? value(obj) : value;
  }));
  return obj.set(props);
});
