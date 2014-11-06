import {wu} from "./wu";

// turn function into a function that can be applied to a sequence of values
// only works for functions with one parameter
export var generatorize = function(fn) {
  return function(...params) {
    if (params.length == 1)
      params = params[0]

    // depending on parameter type treat as normal function with regular return value
    if (!isIterable(params) && !(typeof params === "function"))
      return fn(params);

    return function*() {
      for (let p of getIterator(params))
        yield fn(p);
    }
  }
}


// Return whether a thing is iterable.
export const isIterable = thing => {
  return thing && typeof thing[wu.iteratorSymbol] === "function" && typeof thing != "string";
};

// Get the iterator for the thing or throw an error.
// TODO: make two functions, one for when we are expecting a tom music type and one for converting outside arguments to iterators
export const getIterator = (thing) => {
  if (isIterable(thing))
    return thing[wu.iteratorSymbol]();
  throw new TypeError("Not iterable: " + thing);
};

export const fixFloat = (n) => parseFloat(n.toPrecision(12));

export const clone = function(obj) {
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



export var addObjectProp = function(eventObject,name, value, enumerable=true) {
  var jsPropDescriptor = { configurable: true, enumerable: enumerable, value:value};
  var newObject = clone(eventObject);
  Object.defineProperty(newObject, name, jsPropDescriptor);
//  console.log("defined property ",name," of ",eventObject,"with value",value);
  return Object.freeze(newObject);
}

export var addFuncProp = function(eventObject, name, func) {
// don't transform functions marked with _func or reserved keyword set
//if (k != "set" && ! k.endsWith("_func") && typeof val == "function") {

  // this may be contrary to the general design model but i think function properties should be recreated with every object mutation to get access to the latest stuff
  // Probably solved in MProperty
  var jsPropDescriptor = { configurable: true, enumerable: true, get: func};
  var newObject = clone(eventObject);
//  console.log("adding prop descriptor",newObject, name, jsPropDescriptor);
  Object.defineProperty(newObject, name, jsPropDescriptor);
//  console.log("added prop descriptor");
//  console.log("defined funcproperty ",name," of ",eventObject);
  return newObject;
}


// stringifying needs to be optimized
export var toStringDetailed = function(v) {
//  console.log(v);
  if (typeof v == "object") {
      if (!isIterable(v) && !v.isTom) {
        return JSON.stringify(v);
      }
  }
  return ""+v;
}

export var toStringObject = function(o) {
  if (typeof o == "object") {
    o.prototype.toString= () => "tooostring";
  }
  return o;
}

export var prettyToString = function(name, args, destFunc) {
  //destFunc.prototype = _.clone(destFunc.prototype);
  //console.log("tosdetailedtest", args,args.map(toStringDetailed));
  destFunc.toString = () => name+"("+args.map(toStringDetailed).join(", ")+")";

  destFunc.inspect = destFunc.toString;
  //destFunc.toString = destFunc.prototype.toString;
//console.log(res.prototype.toString());
  return destFunc;
}
