"use strict";
var $__baseLib__,
    $___46__46__47_lib_47_utils__,
    $___46__46__47_immutable_47_nodeProxiedImmutable__;
var _ = require("lodash");
var $__0 = ($__baseLib__ = require("./baseLib"), $__baseLib__ && $__baseLib__.__esModule && $__baseLib__ || {default: $__baseLib__}),
    addGenerator = $__0.addGenerator,
    m = $__0.m;
var $__1 = ($___46__46__47_lib_47_utils__ = require("../lib/utils"), $___46__46__47_lib_47_utils__ && $___46__46__47_lib_47_utils__.__esModule && $___46__46__47_lib_47_utils__ || {default: $___46__46__47_lib_47_utils__}),
    prettyToString = $__1.prettyToString,
    toStringObject = $__1.toStringObject,
    toStringDetailed = $__1.toStringDetailed,
    addFuncProp = $__1.addFuncProp,
    isIterable = $__1.isIterable,
    getIterator = $__1.getIterator,
    fixFloat = $__1.fixFloat;
var $__2 = ($___46__46__47_immutable_47_nodeProxiedImmutable__ = require("../immutable/nodeProxiedImmutable"), $___46__46__47_immutable_47_nodeProxiedImmutable__ && $___46__46__47_immutable_47_nodeProxiedImmutable__.__esModule && $___46__46__47_immutable_47_nodeProxiedImmutable__ || {default: $___46__46__47_immutable_47_nodeProxiedImmutable__}),
    immutableObj = $__2.immutableTom,
    addObjectProp = $__2.addObjectProp,
    addObjectProps = $__2.addObjectProps,
    objIsImmutable = $__2.objIsImmutable;
addGenerator(function* data(dataInput) {
  var loopLength = arguments[1];
  if (isIterable(dataInput)) {
    for (var $__4 = dataInput[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__5; !($__5 = $__4.next()).done; ) {
      var d = $__5.value;
      {
        if (dataInput.length)
          yield* data(d, dataInput.length);
        else
          yield* data(d);
      }
    }
  } else {
    yield immutableObj(dataInput);
  }
});
addGenerator(function* loopData(dataNode) {
  var $__12;
  for (var $__6 = dataNode[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var data = $__7.value;
    {
      var keys = Object.keys(data);
      if (keys.length == 0) {
        yield* getIterator(m(dataNode).loop());
        return;
      }
      for (var $__4 = ($__12 = m()).zipLooping.apply($__12, $traceurRuntime.spread(_.values(data)))[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__5; !($__5 = $__4.next()).done; ) {
        var props = $__5.value;
        {
          var resData = props.reduce(function(prev, val, i) {
            return addObjectProp(prev, keys[i], val);
          }, immutableObj());
          yield* getIterator(m().data(resData));
        }
      }
    }
  }
});
addGenerator(function* zipMerge(node) {
  for (var $__4 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    var n = $__5.value;
    yield addObjectProps(n[0], n[1]);
  }
});
addGenerator(function* simpleMerge(node2, node1) {
  var iterators = [node1, node2].map((function(node) {
    return getIterator(node);
  }));
  while (true) {
    var next = iterators.map((function(i) {
      return i.next().value;
    }));
    if (next[0] == undefined || next[1] == undefined)
      return;
    yield addObjectProps(next[0], next[1]);
  }
});
addGenerator(function* set(data, node) {
  yield* getIterator(m(node).simpleMerge(m(data).loopData()));
});
addGenerator(function* evt(data) {
  if (isIterable(data)) {
    yield* getIterator(m(data).loop());
  } else
    yield* getIterator(m(data).loopData());
});
addGenerator(function* prop(name, tomValue, children) {
  var $__3;
  if (typeof tomValue === "function" && tomValue.length <= 1) {
    yield* getIterator(m(children).simpleMap((function(n) {
      var evaluated = tomValue(n);
      if (evaluated === undefined) {
        console.error("tomValue undefined", evaluated, n, tomValue, "" + tomValue);
        throw new TypeError("shouldn't try to set a property to undefined" + n + "/" + tomValue);
      }
      return n.set(name, evaluated);
    })));
  } else
    yield* getIterator(m(children).set(($__3 = {}, Object.defineProperty($__3, name, {
      value: tomValue,
      configurable: true,
      enumerable: true,
      writable: true
    }), $__3)));
});
addGenerator(function* loop(node) {
  if (isIterable(node)) {
    if (node.length > 0) {
      node = Array.from(node);
    }
    while (true)
      yield* getIterator(node);
  } else {
    while (true)
      yield node;
  }
});
addGenerator(function* filter(filterFunc, node) {
  for (var $__4 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    var e = $__5.value;
    {
      if (filterFunc(e))
        yield e;
    }
  }
});
addGenerator(function* takeWhile(filterFunc, node) {
  for (var $__4 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    var e = $__5.value;
    {
      if (!filterFunc(e))
        break;
      yield e;
    }
  }
});
addGenerator(function* skipWhile(skipFunc, node) {
  var skipNo = 0;
  for (var $__4 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    var e = $__5.value;
    {
      if (skipFunc(e)) {
        continue;
      }
      yield e;
    }
  }
});
addGenerator(function* take(n, node) {
  var count = n;
  for (var $__4 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    var e = $__5.value;
    {
      yield e;
      if (--count <= 0)
        break;
    }
  }
});
addGenerator(function* zip() {
  for (var nodes = [],
      $__8 = 0; $__8 < arguments.length; $__8++)
    nodes[$__8] = arguments[$__8];
  var iterators = nodes.map((function(node) {
    return getIterator(node);
  }));
  while (true) {
    var next = iterators.map((function(i) {
      return i.next().value;
    }));
    if (_.every(next, (function(n) {
      return n != undefined;
    })))
      yield next;
  }
});
addGenerator(function* zipLooping() {
  for (var nodes = [],
      $__9 = 0; $__9 < arguments.length; $__9++)
    nodes[$__9] = arguments[$__9];
  var loopedIterators = nodes.map((function(node) {
    return getIterator(m(node).loop());
  }));
  while (true) {
    var next = loopedIterators.map((function(i) {
      return i.next().value;
    }));
    yield next;
  }
});
addGenerator(function* invoke(func, node) {
  yield* getIterator(func(m(node)));
});
addGenerator(function* simpleMap(mapFunc, node) {
  for (var $__4 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    var n = $__5.value;
    {
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
      if (!isIterable(mapRes))
        yield immutableObj(mapRes);
      else
        yield mapRes;
    }
  }
});
addGenerator(function* repeat(n, node) {
  yield* getIterator(m(node).loop().take(n));
});
addGenerator(function* flattenShallow(node) {
  for (var $__4 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    var n = $__5.value;
    {
      if (isIterable(n))
        yield* getIterator(n);
      else
        yield n;
    }
  }
});
addGenerator(function* compose() {
  for (var nodes = [],
      $__10 = 0; $__10 < arguments.length; $__10++)
    nodes[$__10] = arguments[$__10];
  for (var $__4 = nodes[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    var node = $__5.value;
    {
      yield* getIterator(node);
    }
  }
});
addGenerator(function* flatten(node) {
  for (var $__4 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    var e = $__5.value;
    if (isIterable(e))
      yield* getIterator(m().flatten(e));
    else
      yield e;
  }
});
addGenerator(function* skip(n, node) {
  var count = n;
  for (var $__4 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    var e = $__5.value;
    {
      if (count > 0)
        count--;
      else
        yield e;
    }
  }
});
addGenerator(function* count() {
  var start = arguments[0] !== (void 0) ? arguments[0] : 0;
  var stepSize = arguments[1] !== (void 0) ? arguments[1] : 1;
  var c = start;
  while (true) {
    yield c;
    c += stepSize;
  }
}, {noInputChain: true});
addGenerator(function* scan(func, initial) {
  var $__11;
  var node = arguments[2] !== (void 0) ? arguments[2] : null;
  if (node === null) {
    ($__11 = [initial, undefined], node = $__11[0], initial = $__11[1], $__11);
  }
  for (var $__4 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    let n = $__5.value;
    {
      if (initial === undefined) {
        initial = n;
        continue;
      }
      initial = func(initial, n);
      yield initial;
    }
  }
});
