import {
  wu
}
from "../lib/wu";

import log from "../lib/logger";

import {
  prettyToString, toStringObject, toStringDetailed, addFuncProp, /*clone, addObjectProp, addObjectProps, */ isIterable, getIterator, fixFloat
}
from "../lib/utils";

import {
  immutableTom as immutableObj, addObjectProp, addObjectProps
}
from "../immutable/nodeProxiedImmutable";



var util = require("util");

var _ = require("lodash");

import webServer from "../webConnection";

var logDetails = true;


// // TODO: work in progress
// TODO: change to one option param
var Immutable = require("immutable");


var stackTrace = require("stack-trace");
import findSourcePos from "../lib/findSourceStackPos";



function* runGenFeedback(generator, name, args) {
  for (let e of {
      [wu.iteratorSymbol]: () => generator(...args)
    }) {
    // console.log(name,e);
    var spos = findSourcePos();
    if (spos !== undefined && spos !== null) {
      console.warn(name, spos);
      webServer.sequenceFeedback.push(spos);

    }
    yield e;
  };
}

var stackTrace = require('stack-trace');

var path = process.cwd();


var mGenerator = function(generator, options = {}) {
  var name = options.nameOverride || generator.name;
  var getIterable = function(...args) {
    // var trace = stackTrace.get();
    // console.log(path);
    // console.log(trace.map(t => t.toString().replace(path,"")).filter(t => t.indexOf("evalmachine")>=0));
    // console.log(args);
    var res = {};
    res.isTom = true;
    res.name = name;

    res[wu.iteratorSymbol] = () => generator(...args); //runGenFeedback(generator,name,args);
    if (options.toStringOverride)
      res.toString = () => options.toStringOverride;
    else {
      // var stringRep =
      res.toString = () => {
        if (!res.toStringCached)
          res.toStringCached = prettyToString(name, args);
        return res.toStringCached;
      }
    }
    // console.log("res",res);
    return new M(res);
  }
  getIterable.prototype = M.prototype;

  return getIterable;
}

var rootNode = Object.freeze({
  isTom: true,
  name: "m()"
});

var wrappedSymbol = Symbol("M wrapped Object");

var typeValidate = require('tcomb-validation').validate;



function M(node = rootNode) {
  if (!node.isTom)
    throw TypeError("expecting a node of type isTom in M");

  this.currentNode = node;
  this.name = node.name;
  this.isTom = true;
  this.metaData = this.currentNode.metaData;
  //this.parentNode=null;
  // this._loopLength=node._loopLength;
  this.length = node.length;
  this[wu.iteratorSymbol] = node[wu.iteratorSymbol];
  // Object.seal(this);
  // Object.seal(node);
}

M.prototype.toString = function() {
  return this.currentNode.toString()
};

export var m = function(wrapObject = rootNode) {
  // console.log("creating m from ",wrapObject);
  if (!wrapObject.isTom || (!isIterable(wrapObject) && wrapObject != rootNode)) {
    return new M(rootNode).data(wrapObject);
  }


  return new M(wrapObject);
}


m.prototype = M.prototype;

console.log(m.prototype);


var addFunction = function(name, func, options = rootNode) {
  M.prototype[name] = function(...args) {
    // console.log("called",name);
    // console.log("this in prototype",this);
    if (options.notChainable)
      return func(...[...args, this.currentNode]);

    // var argument = isIterable(this) ? this : this[wrappedSymbol];
    var callArgs = (this.currentNode != rootNode && !options.noInputChain) ? [...args, this.currentNode] : args;
    // if (logDetails)
    //   console.log("call".bold,name, "being called on", callArgs);
    var newNode = func(...callArgs);
    // console.log("lineNumber",name,(new Error()).stack);
    newNode.parentNode = this;
    if (! newNode.metaData && newNode.parentNode.metaData)
      newNode.metaData = newNode.parentNode.metaData;

    // newNode.metaData = _.extend({},this.metaData,newNode.metaData);
    // console.log("name",name," returning",newNode);
    return newNode;
  }
}







// process.exit(1);

// A decorator for rewrapping a method's returned iterable in m to maintain
// chainability.
// const rewrap = fn => function (...args) {
//   return m(fn.call(this, ...args));
// };


// var addFunction = function(name, func, chaining=true) {
//   M.prototype[name] = function(...args) {
//
//     console.log(this);
//     return this;
//
//     if (args.length == 0  || args[args.length-1].prototype != M.prototype) {
//       console.log("first in chain",name);
//
//     }
//     var res;
//     if (this.res) {
//       // if (name == "take") {
//       // console.log("args",[...args,this].length);
//       // args.push(this.res);
//       // process.exit(1);
//       // }
//       res = func(...[...args,this.res]);
//     }
//     else {
//       console.log("start of chain")
//       res = func(...args);
//     }
//     console.log(name,":",this);
//     // if (res[wu.iteratorSymbol])
//     //   this[wu.iteratorSymbol]=res[wu.iteratorSymbol];
//
//     if (chaining) {
//       return this;
//     }
//     else {
//       console.log("end of chain", name,"res",res);
//       delete this.res;
//       return res;
//     }
//     // return chaining ? this : res;
//   }
// }
//


export function addGenerator(generatorFunc, options = {}, thirdOption = false) {
  if (thirdOption)
    throw "thirdOption removed";


  // console.log("name:",nameOverride || generatorFunc.name);
  if (!(options.nameOverride || generatorFunc.name).length)
    throw "no name given" + generatorFunc;
  addFunction(options.nameOverride || generatorFunc.name, mGenerator(generatorFunc, options), options);
}

export function addChainEndFunction(func) {
  if (log.showDebug) log.debug("added chain end function", func.name);
  addFunction(func.name, func, {
    notChainable: true
  });
}


addGenerator(function* val(value) {
  if (value instanceof Object)
    yield immutableObj(value);
  else
    yield value;
});

addFunction("setMetaData",function setMetaData(data,node) {
  // this.metaData = data;
  var newNode = m(node);
  if (node.metaData)
    data = _.extend({}, node.metaData, data);
  newNode.metaData = data;
  return newNode;
});

M.prototype.addGen = addGenerator;
M.prototype.getIterator = getIterator;
