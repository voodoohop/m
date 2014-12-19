"use strict";
"use strict";
Object.defineProperties(exports, {
  ImmutableObject: {get: function() {
      return ImmutableObject;
    }},
  __esModule: {value: true}
});
var _ = require("lodash");
function factory(input) {
  if (arguments.length === 0) {
    return ImmutableObject();
  } else if (Array.isArray(input)) {
    return Object.freeze(input.map(factory));
  } else if ((typeof input === 'undefined' ? 'undefined' : $traceurRuntime.typeof(input)) === "object" && input != null) {
    return ImmutableObject(input);
  } else {
    return input;
  }
}
var ImmutableObject = function(props) {
  if (typeof props === "undefined") {
    return empty;
  }
  if ((typeof props === 'undefined' ? 'undefined' : $traceurRuntime.typeof(props)) !== "object") {
    throw new TypeError("ImmutableObject property source must be an object.");
  }
  if (props.__isImmutableObject__) {
    return props;
  }
  return empty.set(props);
};
var empty = Object.freeze(Object.create(ImmutableObject.prototype));
ImmutableObject.prototype.set = function(props) {
  if (!props) {
    return this;
  }
  if (typeof props === "string") {
    var propsObj = {};
    propsObj[$traceurRuntime.toProperty(props)] = arguments[1];
    return this.set(propsObj);
  }
  var keys = allKeys(props);
  if (keys.length === 0)
    return this;
  function sameKeys(x, y) {
    return Object.keys(x).every(function(key) {
      return y.hasOwnProperty(key);
    });
  }
  var allSameKeys = sameKeys(this, props) && sameKeys(props, this);
  if (allSameKeys) {
    var p = Object.getPrototypeOf(this);
    return p.set(props);
  }
  var propertyDefs = {};
  props = _.extend({}, this, props);
  keys = allKeys(props);
  keys.forEach(function(key) {
    var value = props[$traceurRuntime.toProperty(key)];
    propertyDefs[$traceurRuntime.toProperty(key)] = {
      value: value,
      enumerable: true
    };
  });
  var newObj = Object.create(this, propertyDefs);
  Object.freeze(newObj);
  return newObj;
};
ImmutableObject.prototype.unset = function(keyToExclude) {
  var props = {};
  var includeKey = function(key) {
    props[$traceurRuntime.toProperty(key)] = this[$traceurRuntime.toProperty(key)];
  }.bind(this);
  function notExcluded(key) {
    return key !== keyToExclude;
  }
  if (this.hasOwnProperty(keyToExclude) && allKeys(Object.getPrototypeOf(this)).indexOf(keyToExclude) < 0) {
    Object.keys(this).filter(notExcluded).forEach(includeKey);
    return Object.getPrototypeOf(this).set(props);
  } else {
    var keys = allKeys(this);
    var filtered = keys.filter(notExcluded);
    var noChange = filtered.length === keys.length;
    if (noChange) {
      return this;
    } else {
      filtered.forEach(includeKey);
      return ImmutableObject(props);
    }
  }
};
ImmutableObject.prototype.toJSON = function() {
  var json = {};
  ImmutableObject.keys(this).forEach(function(key) {
    var value = this[$traceurRuntime.toProperty(key)];
    json[$traceurRuntime.toProperty(key)] = (value && typeof value.toJSON === "function") ? value.toJSON() : value;
  }, this);
  return json;
};
ImmutableObject.prototype.__isImmutableObject__ = true;
Object.freeze(ImmutableObject.prototype);
function allKeys(obj) {
  if (obj && obj.__isImmutableObject__) {
    return ImmutableObject.keys(obj);
  } else {
    return Object.keys(obj);
  }
}
ImmutableObject.keys = function(obj) {
  var keys = [];
  var seen = {};
  function notSeen(key) {
    if (!seen.hasOwnProperty(key)) {
      seen[$traceurRuntime.toProperty(key)] = true;
      return true;
    } else {
      return false;
    }
  }
  while (obj && obj !== ImmutableObject.prototype) {
    keys = keys.concat(Object.keys(obj).filter(notSeen));
    obj = Object.getPrototypeOf(obj);
  }
  return keys;
};
