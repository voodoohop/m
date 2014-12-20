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
    addObjectProps = $__2.addObjectProps;
addGenerator(function* data(data) {
  if (isIterable(data)) {
    for (var $__4 = data[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
        $__5; !($__5 = $__4.next()).done; ) {
      var d = $__5.value;
      {
        yield* getIterator(m().data(d));
      }
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
        valueOf: (function() {
          return data;
        })
      });
      console.log("created dataObj from value", dataObj);
    }
    yield dataObj;
  }
});
addGenerator(function* loopData(dataNode) {
  var $__10;
  for (var $__6 = dataNode[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
      $__7; !($__7 = $__6.next()).done; ) {
    var data = $__7.value;
    {
      var keys = Object.keys(data);
      if (keys.length == 0) {
        yield* getIterator(m(dataNode).loop());
        return;
      }
      for (var $__4 = ($__10 = m()).zip.apply($__10, $traceurRuntime.spread(_.values(data)))[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
          $__5; !($__5 = $__4.next()).done; ) {
        var props = $__5.value;
        {
          var resData = props.reduce(function(prev, val, i) {
            return prev.set(keys[$traceurRuntime.toProperty(i)], val);
          }, immutableObj());
          yield immutableObj(resData);
        }
      }
    }
  }
});
addGenerator(function* zipMerge(node) {
  for (var $__4 = node[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
      $__5; !($__5 = $__4.next()).done; ) {
    var n = $__5.value;
    yield addObjectProps(n[0], n[1]);
  }
});
addGenerator(function* simpleMerge(node1, node2) {
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
  yield* getIterator(m().data(data).loopData().simpleMerge(node));
});
addGenerator(function* evt(data) {
  if (isIterable(data)) {
    for (var $__4 = m().loop(data)[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
        $__5; !($__5 = $__4.next()).done; ) {
      var e = $__5.value;
      yield* getIterator(MData(e));
    }
  } else
    yield* getIterator(m().data(data).loopData());
});
addGenerator(function* prop(name, tomValue, children) {
  var $__3;
  yield* getIterator(m(children).set(($__3 = {}, Object.defineProperty($__3, name, {
    value: tomValue,
    configurable: true,
    enumerable: true,
    writable: true
  }), $__3)));
});
addGenerator(function* loop(node) {
  if (isIterable(node)) {
    if (node.length > 0)
      node = Array.from(node);
    while (true)
      yield* getIterator(node);
  } else
    while (true)
      yield node;
});
addGenerator(function* filter(filterFunc, node) {
  for (var $__4 = node[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
      $__5; !($__5 = $__4.next()).done; ) {
    var e = $__5.value;
    {
      if (filterFunc(e))
        yield e;
    }
  }
});
addGenerator(function* takeWhile(filterFunc, node) {
  for (var $__4 = node[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
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
  for (var $__4 = node[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
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
  for (var $__4 = node[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
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
    nodes[$traceurRuntime.toProperty($__8)] = arguments[$traceurRuntime.toProperty($__8)];
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
addGenerator(function* simpleMap(mapFunc, node) {
  for (var $__4 = node[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
      $__5; !($__5 = $__4.next()).done; ) {
    var n = $__5.value;
    {
      var mapRes = mapFunc(n);
      yield mapRes;
    }
  }
});
addGenerator(function* repeat(n, node) {
  yield* getIterator(m(node).loop().take(n));
});
addGenerator(function* flattenShallow(node) {
  for (var $__4 = node[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
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
      $__9 = 0; $__9 < arguments.length; $__9++)
    nodes[$traceurRuntime.toProperty($__9)] = arguments[$traceurRuntime.toProperty($__9)];
  for (var $__4 = nodes[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
      $__5; !($__5 = $__4.next()).done; ) {
    var node = $__5.value;
    {
      yield* getIterator(node);
    }
  }
});
addGenerator(function* flatten(node) {
  for (var $__4 = node[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
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
  for (var $__4 = node[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
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
addGenerator(function* reduce(reduceFunc, startValue, node) {
  var current = startValue;
  for (var $__4 = node[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
      $__5; !($__5 = $__4.next()).done; ) {
    var e = $__5.value;
    {
      current = reduceFunc(current, e);
    }
  }
  yield current;
});
