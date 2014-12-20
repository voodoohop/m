// TODO: add sanity checks and user understandable errors in every method

var _ = require("lodash");

import {addGenerator,m} from "./baseLib";

import {
  prettyToString, toStringObject, toStringDetailed, addFuncProp, /*clone, addObjectProp, addObjectProps, */ isIterable, getIterator, fixFloat
}
from "../lib/utils";

import {
  immutableTom as immutableObj, addObjectProp, addObjectProps
} from "../immutable/nodeProxiedImmutable";


addGenerator(function* data(data) {
  if (isIterable(data)) {
    for (var d of data) {
      // console.log("data:",d);
      yield * getIterator(m().data(d));
    }
  } else {
    var dataObj;
    if (data instanceof Object) {
      dataObj = immutableObj(data);
      if (isIterable(data))
        throw new Error("data shouldn't be iterable");
    } else {
      dataObj = immutableObj({
        type: "value",
        valueOf: () => data
      });
      console.log("created dataObj from value", dataObj);
    }
    yield dataObj;
  }
});


// TODO: remove this data generator nonsense? if it's not used later yes!
addGenerator(function* loopData(dataNode) {
  for (var data of dataNode) {
    var keys = Object.keys(data);

    if (keys.length == 0) {
      yield * getIterator(m(dataNode).loop());
      return;
    }
    for (var props of m().zip(..._.values(data))) {
      //console.log(zippedProps);
      var resData = props.reduce(function(prev, val, i) {
        // console.log("reduceLoopData",prev,keys[i]+":"+val,i);
        return prev.set(keys[i], val);
      }, immutableObj());
      //resData._data = data;
      yield immutableObj(resData);
    }
  }
});


addGenerator(function* zipMerge(node) {
  for (var n of node)
    yield addObjectProps(n[0], n[1]);
});


addGenerator(function* simpleMerge(node1, node2) {
  //console.log("node1,2",node1,"---",node2);
  var iterators = [node1, node2].map((node) => getIterator(node));
  while (true) {
    var next = iterators.map((i) => i.next().value);
    if (next[0] == undefined || next[1] == undefined)
      return;
    // console.log("addobprops",next[0], next[1]);
    yield addObjectProps(next[0], next[1]);
  }
});

addGenerator(function* set(data, node) {
  // console.log("setnode",node,data);
  yield * getIterator(m().data(data).loopData().simpleMerge(node));
});


// TODO: if we leave out the shallow check we automatically have a flatmap (Maybe??)
addGenerator(function* evt(data) {
  // here if data is iterable we are not looping individual properties
  if (isIterable(data)) {
    for (var e of m().loop(data))
      yield *getIterator(MData(e));
  } else
    yield *getIterator(m().data(data).loopData());
});


addGenerator(function* prop(name, tomValue, children) {
  // console.log("children",children);
  yield * getIterator(m(children).set({[name]: tomValue}));
});



addGenerator(function* loop(node) {
  if (isIterable(node)) {
    if (node.length>0)
      node = Array.from(node);
    while(true)
      yield* getIterator(node);
  }
  else
    while(true)
      yield node;
});


addGenerator(function* filter(filterFunc, node) {
  for (var e of node) {
    if (filterFunc(e))
      yield e;
  }
});



addGenerator(function* takeWhile(filterFunc, node) {
  for (var e of node) {
    if (!filterFunc(e))
      break;
    yield e;
  }
});

addGenerator(function* skipWhile(skipFunc, node) {
  var skipNo = 0;
  for (var e of node) {
    if (skipFunc(e)) {
      continue;
    }
    yield e;
  }
});


addGenerator(function* take(n, node) {
  var count = n;

  // console.log("mtake",node,n);
  for (var e of node) {
    yield e;
    if (--count <= 0)
      break;
  }
});


addGenerator(function* zip(...nodes) {
  var loopedIterators = nodes.map((node) => {
    // console.log(node.length,MLoop(node),MLoop(node).length)
    return getIterator(m(node).loop())
  });
  while (true) {
    var next = loopedIterators.map((i) => i.next().value);
    // console.log("nextZip",next);
    yield next;
  }
});



addGenerator(function* simpleMap(mapFunc, node) {
  // console.log("simpleMap",mapFunc,node);
  for (var n of node) {
    // console.log("simpleMap",""+(typeof mapFunc),node);
    var mapRes=mapFunc(n);
    // console.log("mapRes",mapRes);
    yield mapRes;
  }
});


addGenerator(function* repeat(n, node) {
  yield * getIterator(m(node).loop().take(n));
});


addGenerator(function* flattenShallow(node) {
  for (var n of node) {
    if (isIterable(n))
      yield * getIterator(n);
    else
      yield n;
  }
});


addGenerator(function* compose(...nodes) {
  for (var node of nodes) {
    yield * getIterator(node);
  }
})


addGenerator(function* flatten(node) {
  for (var e of node)
    if (isIterable(e))
      yield * getIterator(m().flatten(e))
    else
      yield e;
});

addGenerator(function* skip(n, node) {
  var count = n;
  for (var e of node) {
    if (count > 0)
      count--;
    else
      yield e;
  }
});

addGenerator(function* count(start = 0, stepSize = 1) {
  var c = start;
  while (true) {
    yield c;
    c += stepSize;
  }
}, {noInputChain:true});


addGenerator(function* reduce(reduceFunc, startValue, node) {
  var current = startValue;
  for (var e of node) {
    current = reduceFunc(current, e);
  }
  yield current;
});
