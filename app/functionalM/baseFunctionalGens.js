// TODO: add sanity checks and user understandable errors in every method

var _ = require("lodash");

import {
  addGenerator, m
}
from "./baseLib";

import {
  prettyToString, toStringObject, toStringDetailed, addFuncProp, /*clone, addObjectProp, addObjectProps, */ isIterable, getIterator, fixFloat
}
from "../lib/utils";

import {
  immutableTom as immutableObj, addObjectProp, addObjectProps, objIsImmutable
}
from "../immutable/nodeProxiedImmutable";



addGenerator(function* data(dataInput, loopLength = undefined) {
  if (isIterable(dataInput)) {
    // yield* getIterator(dataInput);
    for (var d of dataInput) {
      // console.log("data:",d);
      if (dataInput.hasOwnProperty("length"))
        yield * data(d, dataInput.length)
      else
        yield * data(d);
    }
  } else {
    // var dataObj;
    // if (dataInput instanceof Object && (typeof dataInput != "function")) {
    //   dataObj = immutableObj(dataInput);
    // } else {
    //   dataObj = dataInput;
    // }
    yield immutableObj(dataInput);
    // console.log("resObj",resObj, resObj instanceof Object);
    // yield objIsImmutable(resObj) && loopLength ? addObjectProp(resObj,"loopSize",loopLength):resObj;
  }
})




// TODO: remove this data generator nonsense? if it's not used later yes!
addGenerator(function* loopData(dataNode) {
  for (var data of dataNode) {
    // console.log("loopData",data);
    var keys = Object.keys(data);

    if (keys.length == 0) {
      yield * getIterator(m(dataNode).loop());
      return;
    }
    for (var props of m().zipLooping(..._.values(data))) {
      //console.log(zippedProps);
      var resData = props.reduce(function(prev, val, i) {
        // console.log("reduceLoopData",prev,keys[i]+":"+val,i);
        return addObjectProp(prev, keys[i], val);
      }, immutableObj());
      //resData._data = data;
      yield * getIterator(m().data(resData));
    }
  }
})


addGenerator(function* zipMerge(node) {
  for (var n of node)
    yield addObjectProps(n[0], n[1]);
});


addGenerator(function* simpleMerge(node2, node1) {
  // console.log("node1,2",node2,"---",node1);
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
  yield * getIterator(m(node).simpleMerge(m(data).loopData()));
});


// TODO: if we leave out the shallow check we automatically have a flatmap (Maybe??)
addGenerator(function* evt(data) {
  // here if data is iterable we are not looping individual properties
  if (isIterable(data)) {
    yield * getIterator(m(data).loop());
  } else
    yield * getIterator(m(data).loopData())
})

addGenerator(function* prop(name, tomValue, children) {
  // console.log("name, tomval",name,""+tomValue);
  if (typeof tomValue === "function" && tomValue.length <= 1) {
    //console.log("tomValueFunc"+tomValue);
    // tomValue = tomValue(n);
    // console.log("tomValueRes"+tomValue);

    yield * getIterator(m(children).simpleMap(n => {
      var evaluated = tomValue(n);
      if (evaluated === undefined) {
        console.error("tomValue undefined", evaluated, n, tomValue, "" + tomValue);
        throw new TypeError("shouldn't try to set a property to undefined" + n + "/" + tomValue)
      }
      return n.set(name, evaluated);
    }));
  } else
    yield * getIterator(m(children).set({
      [name]: tomValue
    }));
});



addGenerator(function* loop(node) {
  if (isIterable(node)) {
    if (node.length > 0) {
      node = Array.from(node);
      // this._loopLength = node.length;
    }
    while (true)
      yield * getIterator(node);
  } else {
    // this._loopLength = 1;
    while (true)
      yield node;

  }
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
  var iterators = nodes.map(node => getIterator(node));
  while (true) {
    var next = iterators.map((i) => i.next().value);
    if (_.every(next, (n) => n != undefined))
      yield next;
  }
});


addGenerator(function* zipMerge(mergeNode,node) {
  yield* getIterator(m(node).zip(mergeNode).simpleMap(n => addObjectProps(n[1], n[0])));
});

addGenerator(function* zipLooping(...nodes) {
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


addGenerator(function* invoke(func, node) {
  yield * getIterator(func(m(node)));
});


addGenerator(function* simpleMap(mapFunc, node) {
  // console.log("simpleMap",""+mapFunc,node);
  for (var n of node) {


    try {
      var mapRes = mapFunc(n);
    } catch (exception) {
      console.error("simpleMap", "" + (typeof mapFunc), "" + mapFunc, node);
      console.error("exception", exception, "in simpleMap", exception.stack);
      throw new Error("exception in simpleMap" + exception);
    }

    if (mapRes === undefined) {
      console.error("mapRes undefined, for node:" + n + "func:" + mapFunc);
      throw new TypeError("simpleMap shouldn't map to undefined");
    }

    // console.log("mapRes",mapRes);
    if (!isIterable(mapRes))
      yield immutableObj(mapRes);
    else
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
}, {
  noInputChain: true
});

//
// addGenerator(function* scan(reduceFunc, startValue, node) {
//   var current = startValue;
//   for (var e of node) {
//     current = reduceFunc(current, e);
//   }
//   yield current;
// });



addGenerator(function* scan(initial, func, node = null) {
  if (node === null) {
    [node, initial] = [initial, undefined];
  }
  for (let n of node) {
    if (initial === undefined) {
      initial = n;
      continue;
    }
    initial = func(initial, n);
    yield initial;
  }
});
