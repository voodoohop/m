import {wu} from "./wu";

var _ = require("lodash");

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
var objectsCloned=0;
export const clone = function(obj) {
    objectsCloned++;
    if (objectsCloned%5000==0)
      console.log("cloned",objectsCloned);
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



export var addObjectProps=function(eventObject, props, enumerable=true) {
    if (! props instanceof Object)
      return props;

    var keys = Object.keys(props);
    if (keys.length==0)
      return eventObject;

    var descriptor = {};
    for (let propN of Object.getOwnPropertyNames(eventObject))
      descriptor[propN] = Object.getOwnPropertyDescriptor(eventObject, propN);

    for (let key of keys) {
      var value = props[key];
      if (enumerable && typeof value === "function" && value.length <= 1) {
        if (key != "toString" && key != "valueOf") {
          var functor = value;
          try {
            value = functor(eventObject);
            value.functor = functor;
          } catch (e) {
            console.error("functor evaluating error",e);
          }
        }
      }

      descriptor[key] = { configurable: true, enumerable: enumerable, value:value};
    }
    // console.log("adding prop", descriptor);
    // var stack = new Error().stack
    // console.log( stack );

    //descriptor["toString"] = {configurable:true, enumerable:false, value: () => "{"+Object.keys(descriptor).filter((k) => k !="toString").map((k) => ""+k+": "+descriptor[k].value).join(", ")+"}"};
    var obj = Object.create(Object.getPrototypeOf(eventObject),descriptor);
    return Object.freeze(obj);
}

export var addObjectProp = function(eventObject,name, value, enumerable=true) {
  //var newObject = clone(eventObject);

//  console.log("defined property ",name," of ",eventObject,"with value",value);
  if (eventObject[name] === value) {
    return eventObject;
  }

  return addObjectProps(eventObject, { [name]: value}, enumerable);
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
  //  if (v instanceof Object) {
      if (!v.isTom) {
        // console.log("stringify");
        var stringified = JSON.stringify(v, function(key, val) {
          if (val.isTom)
            return toStringDetailed(val);
          if (key=="toString" || key=="inspect")
            return val;
          if (typeof val === 'function') {
            return val.toString();
          }
          return val;
        },"  ");
        return stringified;
      }
  // }

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
  // console.log("tosdetailedtest", args,args.map(toStringDetailed));

  var args = _.clone(args);
  var parentNode = args.pop();
  // if (parentNode != undefined)
  //   parentNode = parentNode.toString();
  //console.log("PRNT",parentNode, ""+parentNode, args, destFunc);

  // console.log(pa)

  if (parentNode == undefined) {
    args=[];
    parentNode = "";
  } else
  if (!parentNode.isTom) {
    args=[parentNode];
    parentNode = "m";
  }

  if (parentNode == "[object Object]")
    parentNode = JSON.stringify(parentNode);


  // if (!args || args.length==0)

  var stringReperesentation =   ""+parentNode+"."+ name+"("+args.map(toStringDetailed).join(", ")+")";

  Object.defineProperty(destFunc,"toString", {enumerable:false,value: () => stringReperesentation});

  Object.defineProperty(destFunc,"inspect", {enumerable:false,value: () => stringReperesentation});
  //destFunc.toString = destFunc.prototype.toString;
//console.log(res.prototype.toString());
  return destFunc;
}
