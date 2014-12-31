var _ = require("lodash");

import {isIterable} from "../lib/utils";

const nothing = Object.freeze({reallyNothing:true});

const deleteMe = {
  DELETED: true
};

const isImmutable = Symbol("isImmutableTom");


var undefinedToNull = (val) => (val === undefined) ? null:val;

const getFunc = ((target, newProps, name) => {
  var res;

  if (newProps && newProps.hasOwnProperty(name))
    res = newProps[name];
  else
    res = target[name];

  // if (res && res[isLazy])
  //   return () => target[name] ? res.func(target.set(name,undefinedToNull(target[name]()))) : res.func(target);

  // console.log("res", name, res && res.length, ""+res);
  return res === deleteMe ? undefined : res;//;
});

const keysFunc = ((oldKeys, newKeys, newProps) => _.filter(_.union(oldKeys(), newKeys()), (k) => !(newProps[k] == deleteMe)));

const convertFuncToVal = function(val,target) {
  return ((typeof val === "function" && val.length <= 1) ? val(target) : val);
}

var wrapNewProps = (target, newProps) => {
  if (! (newProps instanceof Object)) {
    console.log("newProps",newProps);
    console.log("stacktrace", require("stack-trace").get().map(s => s.getFileName()+":"+s.getLineNumber()+":"+s.getFunctionName()));
    throw new TypeError("trying to add props that are not object"+newProps);
  }
  // console.log("wrapping",target," with newProps",newProps);
  // console.log("adding ",newProps,"to",target)

  // console.log("newProps", newProps, Object.keys(newProps));
  // if (Object.keys(newProps).length > 0 && Object.keys(newProps)[0] == "undefined")
  //   console.trace();

  const delFunc = (name) => setFunc(name, deleteMe);

  const setFunc = (name, val = nothing) => wrapNewProps(newProxy,
    val != nothing ?
    { [name]: val} : name);

  const hasCheck = _.memoize((name) =>
    (newProps.hasOwnProperty(name) && newProps[name] != deleteMe) || (!newProps.hasOwnProperty(name) && target.hasOwnProperty(name)));

  const getPropDescriptor = _.memoize(name =>
    name === "set" ? {
      value: setFunc,
      enumerable: false,
      configurable: true
    } : (getFunc(target, newProps, name) === undefined ? undefined : {
      value: getFunc(target, newProps, name),
      enumerable: true,
      configurable: true
    }));

  var newKeysSave = null;
  const newKeys = function() {
    if (newKeysSave == null)
      newKeysSave = Object.keys(newProps);
    return newKeysSave;
  }; //Object.keys(newProps);

  var oldKeysSave = null;
  const oldKeys = function() {
    if (oldKeysSave == null)
      oldKeysSave = Object.keys(target);
    return oldKeysSave;
  }
  const handler = {
    get: (t, name) => {
      // if (name == parentGetter)
      //   return getFunc(target,{}, name);
      if (name === "set")
        return setFunc;
      if (name === "delete")
        return delFunc;
      // if (name === "isImmutable")
      //   return true;
      // if (name === "toString")
      //   return () => "vlaaaa";
      return getFunc(target, newProps, name);
    },
    has: (name) => hasCheck(name),
    hasOwn: (name) => hasCheck(name),
    iterate: () => keysFunc(oldKeys, newKeys, newProps).map(k => getFunc(target, newProps, k)),
    enumerate: () => keysFunc(oldKeys, newKeys, newProps),
    keys: () => keysFunc(oldKeys, newKeys, newProps),
    getPropertyNames: () => keysFunc(oldKeys, newKeys, newProps),
    getOwnPropertyNames: () => keysFunc(oldKeys, newKeys, newProps),
    getPropertyDescriptor: (name) => getPropDescriptor(name),
    getOwnPropertyDescriptor: (name) => getPropDescriptor(name),
  };
  const newProxy = Proxy.create(handler);
  return newProxy;
}

const empty={[isImmutable]:true};

// TODO: not using deep yet
export const immutableTom = function(initial={}) {
  if (! (initial instanceof Object))
    return initial;
  if (initial[isImmutable])
    return initial;
  if (isIterable(initial))
    console.warn("initial is iterable, making an immutable object may mean we lose the Symbol.iterator", initial);
    // throw new Error("can't create immutable from non-object");
  return wrapNewProps(empty, initial);
}


// throw "bye";

export var isLazy = Symbol("Lazy Resolving Function");

export var addLazyProp = (obj, name, resolveFunc) => {
  // console.log("add lazy", obj,name,resolveFunc);
  resolveFunc.isLazy=true;
  // console.log(typeof obj.set(name,resolveFunc)[name]);
  return obj.set(name,resolveFunc);
  // return addObjectProp(obj, name, lazy);
};


var processVal = (obj,name,value) => (typeof value === "function" && value.length <= 1 && name.length>0 && name != "toString" && name != "toJSON" && name != "valueOf") ? value(obj) : value

export var addObjectProp = (obj, name, value) => {
  // console.log("proxy adding prop1", name,value);
  //
  // console.log("proxy adding prop2", obj,name,value);
  return obj.set(name, processVal(obj,name,value));
}

export var addObjectProps = (obj, props) => {
  // console.log("proxy adding prop1", props,obj);
  if (typeof props.time =="object" ) {
    // debugger;
    throw Error("time shouldn't be object")
  }
  // console.log("adding to immuuutable",obj,props,obj.set);
  // props = _.mapValues(props, (value,name) => processVal(name,value));
  var propsNew = {}
  for (let k of Object.keys(props))
    propsNew[k] = processVal(obj,k,props[k]);
  // console.log("ppppppp");
  // console.log("props after",propsNew,obj);

  return obj.set(propsNew, nothing);
}




var assert = require("assert");

var test1 = immutableTom({
  bla: 2
}).set("test", 5);

assert.equal(test1.bla, 2);
assert.equal(test1.test, 5);

assert.throws(() => test1.x = 2);

assert.throws(() => delete test1.bla);

var deletedProp = test1.delete("bla");

assert.equal(deletedProp.bla, undefined);
assert.equal(deletedProp.hasOwnProperty("bla"), false);



// console.log("immutableTom Test1", test1, test1.test, deletedProp, Object.keys(test1));
//
//
// console.log("test lazyness");
//
// var lazyTest1 = immutableTom({bla:2});
//
// lazyTest1 = addLazyProp(lazyTest1, "lazyAccess", (obj) =>  { console.log("heeey",obj); return "manno"});
// lazyTest1 = lazyTest1.set({tom:3});
// lazyTest1 = addLazyProp(lazyTest1, "lazyAccess", (obj) => { console.log("heeey2",obj); return obj; });
//
// console.log(lazyTest1);
// console.log(lazyTest1.lazyAccess());
// // assert.equal(lazyTest1.lazyAccess().lazyAccess,"manno");
