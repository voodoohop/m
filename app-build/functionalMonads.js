"use strict";
Object.defineProperties(exports, {
  FunctionalMusic: {get: function() {
      return FunctionalMusic;
    }},
  m: {get: function() {
      return m;
    }},
  __esModule: {value: true}
});
var $__proxiedImmutable__,
    $__wu__,
    $__utils__;
var immutableTom = ($__proxiedImmutable__ = require("./proxiedImmutable"), $__proxiedImmutable__ && $__proxiedImmutable__.__esModule && $__proxiedImmutable__ || {default: $__proxiedImmutable__}).immutableTom;
var wu = ($__wu__ = require("./wu"), $__wu__ && $__wu__.__esModule && $__wu__ || {default: $__wu__}).wu;
var $__2 = ($__utils__ = require("./utils"), $__utils__ && $__utils__.__esModule && $__utils__ || {default: $__utils__}),
    prettyToString = $__2.prettyToString,
    toStringObject = $__2.toStringObject,
    toStringDetailed = $__2.toStringDetailed,
    addFuncProp = $__2.addFuncProp,
    clone = $__2.clone,
    addObjectProp = $__2.addObjectProp,
    addObjectProps = $__2.addObjectProps,
    isIterable = $__2.isIterable,
    getIterator = $__2.getIterator,
    fixFloat = $__2.fixFloat,
    cloneableEmptyObject = $__2.cloneableEmptyObject;
var _ = require("lodash");
var memoize = require('memoizee');
var SortedMap = require("collections/sorted-map");
var getIterators = (function(values) {
  return values.map(getIterator);
});
var iteratorNextVal = (function(iterator) {
  return iterator.next().value;
});
var iteratorNextValLooping = (function(value, iterator) {
  var nextVal = iterator.next().value;
  return nextVal == undefined ? iteratorNextValLooping(value, getIterator(value)) : [nextVal, iterator];
});
var loopValue = function*(value) {
  var $__19;
  var iterator = getIterator(value);
  while (true) {
    var nextVal = null;
    ($__19 = iteratorNextValLooping(value, iterator), iterator = $__19[0], nextVal = $__19[1], $__19);
    yield nextVal;
  }
};
var loopGeneratorArgs = function(generatorProducer, args) {
  var node = args[args.length - 1];
};
var Immutable = require("immutable");
var caches = {};
var cacheLimit = 10000;
var mGenerator = function() {
  for (var args = [],
      $__14 = 0; $__14 < arguments.length; $__14++)
    args[$__14] = arguments[$__14];
  var origGenerator = args.shift();
  if (origGenerator.isTom)
    origGenerator[wu.iteratorSymbol] = MCache(origGenerator)[wu.iteratorSymbol];
  args.unshift(origGenerator);
  return mGeneratorUnCached.apply(null, $traceurRuntime.spread(args));
};
var doCache = function*(node) {
  var cacheKey = "" + node;
  if (!caches[cacheKey]) {
    console.log("not yet cashed".bgBlue.white, cacheKey);
    caches[cacheKey] = [];
  }
  var cached = caches[cacheKey];
  var count = 0;
  var iterator = null;
  while (true) {
    if (cached.length <= count || count > cacheLimit) {
      if (iterator == null) {
        if (count > cacheLimit) {
          node = MSkip(count, node);
          console.warn("cache full", node);
        }
        iterator = getIterator(node);
      }
      var n = iterator.next();
      if (n.done)
        break;
      if (count > cacheLimit) {
        yield n.value;
        continue;
      }
      cached.push(n.value);
    }
    yield cached[count++];
  }
};
;
var MCache = function(node) {
  var gen = mGeneratorUnCached(doCache, "cache");
  return gen(node);
};
var mGeneratorUnCached = function(generator, name) {
  var curryArgCount = arguments[2] !== (void 0) ? arguments[2] : 0;
  var toStringOverride = arguments[3] !== (void 0) ? arguments[3] : null;
  var getIterable = function() {
    for (var args = [],
        $__15 = 0; $__15 < arguments.length; $__15++)
      args[$__15] = arguments[$__15];
    var res = Object.create(null);
    res.isTom = true;
    res.name = name;
    res[wu.iteratorSymbol] = (function() {
      return generator.apply(null, $traceurRuntime.spread(args));
    });
    if (toStringOverride)
      res.toString = (function() {
        return toStringOverride;
      });
    else
      prettyToString(name, args, res);
    return res;
  };
  getIterable.producerName = name;
  return curryArgCount > 0 ? wu.curryable(getIterable, curryArgCount) : getIterable;
};
var MData = mGenerator(function*(data) {
  if (isIterable(data)) {
    for (var $__4 = data[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__5; !($__5 = $__4.next()).done; ) {
      var d = $__5.value;
      {
        yield* getIterator(MData(d));
      }
    }
  } else {
    var dataObj;
    if (data instanceof Object) {
      dataObj = _.clone(data);
      if (isIterable(data))
        throw "Errrrroorr data shouldn't be iterable";
      Object.defineProperty(dataObj, "toString", {
        enumerable: false,
        value: (function() {
          return toStringDetailed(data);
        })
      });
    } else {
      dataObj = {
        type: "value",
        valueOf: (function() {
          return data;
        })
      };
    }
    yield dataObj;
  }
}, "data");
for (var $__4 = MData([{
  pitch: 12,
  velocity: 0.5
}, {bla: 2}])[$traceurRuntime.toProperty(Symbol.iterator)](),
    $__5; !($__5 = $__4.next()).done; ) {
  var e = $__5.value;
  console.log("datatest", e);
}
var MLoopData = mGenerator(function*(dataNode) {
  for (var $__8 = dataNode[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__9; !($__9 = $__8.next()).done; ) {
    var data = $__9.value;
    {
      var keys = Object.keys(data);
      if (keys.length == 0) {
        yield* getIterator(MLoop(dataNode));
        return;
      }
      for (var $__6 = MZip.apply(null, $traceurRuntime.spread(_.values(data)))[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__7; !($__7 = $__6.next()).done; ) {
        var props = $__7.value;
        {
          var resData = {};
          props.forEach(function(val, i) {
            resData[keys[i]] = val;
          });
          yield resData;
        }
      }
    }
  }
}, "loopData");
var MMergeZipped = mGenerator(function*(node) {
  for (var $__6 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var n = $__7.value;
    yield addObjectProps(n[0], n[1]);
  }
}, "mergeZippedObjects");
var MMerge = mGenerator(function*(node1, node2) {
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
}, "mergeObjects");
var MSet = mGenerator(function*(data, node) {
  yield* getIterator(MMerge(node, MLoopData(MData(data))));
}, "set");
var MEvent = mGenerator(function*(data) {
  if (isIterable(data)) {
    for (var $__6 = MLoop(data)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__7; !($__7 = $__6.next()).done; ) {
      var e = $__7.value;
      yield* getIterator(MData(e));
    }
  } else
    yield* getIterator(MLoopData(MData(data)));
}, "evt");
var MProperty = mGenerator(function*(name, tomValue, children) {
  var $__3;
  yield* getIterator(MSet(($__3 = {}, Object.defineProperty($__3, name, {
    value: tomValue,
    configurable: true,
    enumerable: true,
    writable: true
  }), $__3), children));
}, "prop", 3);
var MWithNext = mGenerator(function*(node) {
  var me = null;
  for (var $__6 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var n = $__7.value;
    {
      if (me == null) {
        me = n;
        continue;
      }
      yield addObjectProps(me, {next: n});
      me = n;
    }
  }
}, "withNext");
var MGroupTime = mGenerator(function*(node) {
  var currentTime = -1;
  var grouped = [];
  for (var $__6 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var n = $__7.value;
    {
      if (!n.hasOwnProperty("time")) {
        console.error("groupByTime called but no time property".red);
        return;
      }
      if (n.time > currentTime) {
        if (grouped.length > 0) {
          yield {
            events: grouped,
            time: currentTime
          };
          grouped = [];
        }
        currentTime = fixFloat(n.time);
      }
      grouped.push(n);
    }
  }
}, "groupByTime");
var MDuplicateRemover = mGenerator(function*(node) {
  for (var $__8 = MGroupTime(node)[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__9; !($__9 = $__8.next()).done; ) {
    var timeGrouped = $__9.value;
    {
      for (var $__6 = _.values(_.groupBy(timeGrouped.events, "pitch"))[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__7; !($__7 = $__6.next()).done; ) {
        var n = $__7.value;
        yield n[n.length - 1];
      }
    }
  }
}, "removeDuplicateNotes");
var MNoteAutomate = mGenerator(function*(node) {
  var notes = MFilter((function(n) {
    return n.hasOwnProperty("pitch") && n.hasOwnProperty("velocity") && n.hasOwnProperty("time") && n.duration > 0;
  }), node);
  yield* getIterator(MMapOp((function(n) {
    var $__3;
    var automation = m.data([{
      type: "noteOn",
      velocity: n.velocity,
      pitch: n.pitch,
      time: 0,
      evt: n
    }, {
      type: "noteOff",
      pitch: n.pitch,
      time: n.duration,
      evt: n
    }]);
    automation.automation = true;
    return ($__3 = {}, Object.defineProperty($__3, "automation_note", {
      value: automation,
      configurable: true,
      enumerable: true,
      writable: true
    }), $__3);
  }), MDuplicateRemover(notes)));
}, "notePlay");
var MAutomate = mGenerator(function*(paramName, valGenerator, node) {
  yield* getIterator(MMapOp((function(n) {
    var $__3;
    var automation = m.data({
      type: "automation",
      evt: n,
      name: paramName,
      duration: n.duration
    }).loop().metro(1 / 8).takeWhile((function(a) {
      return a.time < a.evt.duration;
    })).set({automationVal: valGenerator});
    automation.automation = true;
    return ($__3 = {}, Object.defineProperty($__3, paramName, {
      value: automation,
      configurable: true,
      enumerable: true,
      writable: true
    }), $__3);
  }), node));
}, "automate");
var MProcessAutomations = mGenerator(function*(node) {
  yield* getIterator(MCache(MFlattenAndSchedule(MSimpleMap((function(n) {
    var merged = m.data([]);
    for (var $__6 = _.filter(_.values(n), (function(nVal) {
      return Object(nVal).automation === true;
    }))[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__7; !($__7 = $__6.next()).done; ) {
      var automation = $__7.value;
      {
        merged = merged.merge(automation);
      }
    }
    return {
      time: n.time,
      events: merged.delay(n.time)
    };
  }), MNoteAutomate(node)))));
}, "processAutomations");
var MSetValue = mGenerator(function*(value, child) {
  yield* MProperty("value", value, child);
}, "setValue", 2);
var MZip = mGenerator(function*() {
  for (var nodes = [],
      $__15 = 0; $__15 < arguments.length; $__15++)
    nodes[$__15] = arguments[$__15];
  var loopedIterators = nodes.map((function(node) {
    return getIterator(MLoop(node));
  }));
  while (true) {
    var next = loopedIterators.map((function(i) {
      return i.next().value;
    }));
    yield next;
  }
}, "zip");
var MLoop = mGenerator(function*(node) {
  var cached = null;
  while (true) {
    if (isIterable(node)) {
      if (cached == null)
        cached = MCache(node);
      yield* getIterator(cached);
    } else {
      yield node;
    }
  }
}, "loop");
var simpleMap = mGenerator(function*(mapFunc, node) {
  for (var $__6 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var n = $__7.value;
    {
      yield mapFunc(n);
    }
  }
}, "simpleMap");
var MCombine = mGenerator(function*(combineNode, node) {
  var combineFunc = (function(me, previousOther, nextOther) {
    return addObjectProps(me, {other: {
        previous: previousOther,
        next: nextOther
      }});
  });
  var meMapped = simpleMap((function(n) {
    return {
      time: n.time,
      me: n
    };
  }), node);
  var otherMapped = simpleMap((function(n) {
    return {
      time: n.time,
      other: n
    };
  }), combineNode);
  var merged = MTimeOrderedMerge(meMapped, otherMapped);
  var previousOther = null;
  var nextOther = null;
  var meWaitingForNextOther = [];
  for (var $__8 = merged[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__9; !($__9 = $__8.next()).done; ) {
    var m = $__9.value;
    {
      if (m.hasOwnProperty("me"))
        meWaitingForNextOther.push(m.me);
      if (m.hasOwnProperty("other") && meWaitingForNextOther.length > 0) {
        previousOther = nextOther;
        nextOther = m.other;
        for (var $__6 = meWaitingForNextOther[$traceurRuntime.toProperty(Symbol.iterator)](),
            $__7; !($__7 = $__6.next()).done; ) {
          var me = $__7.value;
          {
            yield combineFunc(me, previousOther, nextOther);
          }
        }
        meWaitingForNextOther = [];
      }
    }
  }
  for (var $__10 = meWaitingForNextOther[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__11; !($__11 = $__10.next()).done; ) {
    var me = $__11.value;
    {
      yield combineFunc(me, previousOther, nextOther);
      ;
    }
  }
}, "combine");
var MCombineMap = mGenerator(function*(combineFunc, combineNode, node) {
  yield* getIterator(MMapOp((function(combined) {
    return combineFunc(combined, combined.other);
  }), MCombine(combineNode, node)));
}, "combineMap", 3);
var MCompose = mGenerator(function*() {
  for (var nodes = [],
      $__16 = 0; $__16 < arguments.length; $__16++)
    nodes[$__16] = arguments[$__16];
  for (var $__6 = nodes[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var node = $__7.value;
    {
      yield* getIterator(node);
    }
  }
}, "compose");
var MLoopFixedLength = mGenerator(function*(loopLength, node) {
  var time = 0;
  while (true) {
    for (var $__6 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__7; !($__7 = $__6.next()).done; ) {
      var n = $__7.value;
      {
        yield addObjectProp(n, "time", time + n.time);
      }
    }
    time += loopLength;
  }
}, "loopLength", 2);
var convertToObject = (function(externalVal) {
  return Object(externalVal);
});
var MSimpleMap = mGenerator(function*(mapFunc, node) {
  for (var $__6 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var e = $__7.value;
    {
      yield mapFunc(e);
    }
  }
}, "simpleMap");
var MFlattenAndSchedule = mGenerator(function*(node) {
  var scheduled = new SortedMap();
  for (var $__12 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__13; !($__13 = $__12.next()).done; ) {
    var n = $__13.value;
    {
      if (n.hasOwnProperty("time")) {
        var scheduledNow = _.take(scheduled.entries(), (function(s) {
          return s[0] < n.time;
        }));
        for (var $__8 = scheduledNow[$traceurRuntime.toProperty(Symbol.iterator)](),
            $__9; !($__9 = $__8.next()).done; ) {
          var scheduledEvents = $__9.value;
          {
            for (var $__6 = scheduledEvents[1][$traceurRuntime.toProperty(Symbol.iterator)](),
                $__7; !($__7 = $__6.next()).done; ) {
              var scheduledEvent = $__7.value;
              {
                yield scheduledEvent;
              }
            }
            scheduled.delete(scheduledEvents[0]);
          }
        }
      } else
        console.error("Flatten and Schedule should work on events with time set");
      for (var $__10 = n.events[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__11; !($__11 = $__10.next()).done; ) {
        var nFlat = $__11.value;
        {
          if (nFlat.hasOwnProperty("time")) {
            if (nFlat.time <= n.time)
              yield nFlat;
            else {
              if (!scheduled.has(nFlat.time))
                scheduled.set(nFlat.time, []);
              scheduled.get(nFlat.time).push(nFlat);
            }
          } else
            console.error("Flatten and Schedule should work on events with time set");
        }
      }
    }
  }
  yield* getIterator(scheduled.values());
}, "flattenAndSchedule");
var MFlattenShallow = mGenerator(function*(node) {
  for (var $__6 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var n = $__7.value;
    {
      if (isIterable(n))
        yield* getIterator(n);
      else
        yield n;
    }
  }
}, "flattenShallow");
var MMapOp = mGenerator(function*(mapFunc, node) {
  var mapped = MSimpleMap(mapFunc, node);
  var timed = false;
  var merged = MSimpleMap((function(e) {
    var mappedRes = MData(e[1]);
    var orig = e[0];
    var res = {events: MSimpleMap((function(m) {
        return addObjectProps(orig, m);
      }), mappedRes)};
    if (orig.hasOwnProperty("time")) {
      res.time = orig.time;
      timed = true;
    }
    return res;
  }), MZip(node, mapped));
  if (timed)
    yield* getIterator(MFlattenAndSchedule(merged));
  else
    yield* getIterator(MFlattenShallow(MSimpleMap((function(e) {
      return e.events;
    }), merged)));
});
var MCombineLast = mGenerator(function*(combineFunc, combineNode, node) {
  var meIterator = getIterator(node);
  var last = meIterator.next().value;
  for (var $__6 = combineNode[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var c = $__7.value;
    {
      var next = meIterator.next();
      if (next.time < c.time) {
        last = next;
        continue;
      }
      yield combineFunc(last, next, combineNode);
      last = next;
    }
  }
});
var MFlatten = mGenerator(function*(node) {
  for (var $__6 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var e = $__7.value;
    if (isIterable(e))
      yield* getIterator(MFlatten(e));
    else
      yield e;
  }
}, "flatten");
var MSubSequence = mGenerator(function*(subSequence, node) {
  yield* node;
  yield* subSequence;
}, "subSequence");
var MPluck = mGenerator(function*(propertyName, node) {
  yield* getIterator(MMapOp((function(e) {
    return e[propertyName];
  }), node));
}, "pluck", 2);
var MMapWithMemory = mGenerator(function*(initial, mapFunc, node) {
  var current = initial;
  yield* getIterator(MSet(convertToObject(current), MData(current)));
  for (var $__6 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var e = $__7.value;
    {
      current = mapFunc(current, e.value);
      yield* getIterator(MSet(convertToObject(current), MData(e)));
    }
  }
}, "memoryMap", 3);
var MFilter = mGenerator(function*(filterFunc, node) {
  for (var $__6 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var e = $__7.value;
    {
      if (filterFunc(e))
        yield e;
    }
  }
}, "filter", 2);
var MTakeWhile = mGenerator(function*(filterFunc, node) {
  for (var $__6 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var e = $__7.value;
    {
      if (!filterFunc(e))
        break;
      yield e;
    }
  }
}, "takeWhile", 2);
var MSkipWhile = mGenerator(function*(skipFunc, node) {
  var skipNo = 0;
  for (var $__6 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var e = $__7.value;
    {
      if (skipFunc(e)) {
        continue;
      }
      yield e;
    }
  }
}, "skipWhile", 2);
var MTake = mGenerator(function*(n, node) {
  var count = n;
  for (var $__6 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var e = $__7.value;
    {
      yield e;
      if (--count <= 0)
        break;
    }
  }
}, "take", 2);
var MTakeTime = mGenerator(function*(time, node) {
  var timeTaken = 0;
  for (var $__6 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var e = $__7.value;
    {
      yield e;
      timeTaken += e.event.duration;
      if (timeTaken >= time)
        break;
    }
  }
}, "takeTime", 2);
var MRepeat = mGenerator(function*(n, node) {
  yield* getIterator(MTake(n, MLoop(node)));
}, "repeat", 2);
var MMapTime = mGenerator(function*(mapFunc, node) {
  for (var $__6 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var e = $__7.value;
    {
      yield e.set("time", mapFunc(e.time));
    }
  }
}, "mapTime", 2);
var MTimeShift = mGenerator((function(amount, node) {
  return MMapTime((function(time) {
    return time + amount;
  }), node);
}), "timeShift", 2);
var MReduce = mGenerator(function*(reduceFunc, startValue, node) {
  var current = startValue;
  for (var $__6 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var e = $__7.value;
    {
      current = reduceFunc(_.clone(current), e);
    }
  }
  yield _.clone(current);
}, "reduce", 3);
var MDurationSum = mGenerator(MReduce((function(sum, timedEvent) {
  return sum + timedEvent.duration;
}), 0), "durationSum");
var MSkip = mGenerator(function*(n, node) {
  var count = n;
  for (var $__6 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var e = $__7.value;
    {
      if (count > 0)
        count--;
      else
        yield e;
    }
  }
}, "skip", 2);
var MBranch = mGenerator(function*(condition, branchNode, elseNode, node) {
  for (var $__6 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var e = $__7.value;
    {
      var branchTo = (condition(e) ? branchNode : elseNode);
      yield* getIterator(branchTo.takeWhile((function(n) {
        return n.time < e.duration;
      })).set({time: (function(n) {
          return n.time + e.time;
        })}));
    }
  }
}, "branch", 4);
var MCount = mGenerator(function*() {
  var start = arguments[0] !== (void 0) ? arguments[0] : 0;
  var stepSize = arguments[1] !== (void 0) ? arguments[1] : 1;
  var c = start;
  while (true) {
    yield c;
    c += stepSize;
  }
}, "count");
var MSequenceEndMarker = mGenerator(function*() {
  yield* getIterator(MEvent({type: "endMarker"}));
}, "endMarker");
var MPitch = MProperty("pitch");
var MVelocity = MProperty("velocity");
var MTime = MProperty("time");
var MDuration = MProperty("duration");
var MEventCount = MProperty("count", MCount(0, 1));
var MDelay = mGenerator(function*(amount, node) {
  if (!isIterable(amount))
    amount = [amount];
  for (var $__6 = amount[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var a = $__7.value;
    yield* getIterator(MProperty("time", (function(n) {
      return n.time + a;
    }), node));
  }
}, "delay");
var MExternalProperty = mGenerator(function*(propName, baconProp, initialVal, node) {
  var propVal = initialVal;
  baconProp.onValue(function(v) {
    console.log('new param val', propName, v);
    propVal = v;
  });
  var res = MProperty(propName, (function() {
    return propVal;
  }), node);
  yield* getIterator(res);
}, "externalProperty", 3, "externalProp");
var MMetronome = mGenerator(function*(tickDuration, node) {
  yield* getIterator(MTime(MCount(0, tickDuration), MCompose(node, MSequenceEndMarker())));
}, "metro");
var MTimeFromDurations = mGenerator(function*(node) {
  var durationSumIterator = MMapWithMemory(0, (function(current, x) {
    return x + current;
  }), MPluck("duration", node));
  yield* getIterator(MTime(durationSumIterator, MCompose(node, MSequenceEndMarker())));
}, "timeFromDurations");
var MDurationsFromTime = mGenerator(function*(node) {
  var i = getIterator(node);
  var previous = undefined;
  while (true) {
    var next = i.next().value;
    if (next === undefined)
      return;
    if (previous != undefined && previous.hasOwnProperty("time") && next.hasOwnProperty("time")) {
      yield addObjectProps(previous, {duration: next.time - previous.time - 0.01});
    }
    previous = next;
  }
});
var MTimeOrderedMerge = mGenerator(function*(mergeNode, node) {
  var nodeIterator = getIterator(node);
  var nextNode = nodeIterator.next().value;
  for (var $__6 = mergeNode[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var mergeEvent = $__7.value;
    {
      while (nextNode != undefined && nextNode.time < mergeEvent.time) {
        yield nextNode;
        nextNode = nodeIterator.next().value;
      }
      yield mergeEvent;
    }
  }
  if (nextNode != undefined)
    yield nextNode;
  yield* nodeIterator;
}, "merge");
var MNoteOnOffSequence = mGenerator(function*(node) {
  var iterator = getIterator(node);
  var next = null;
  var toInsert = {};
  while (next = iterator.next().value) {
    var ks = Object.keys(toInsert);
    for (var $__6 = ks[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__7; !($__7 = $__6.next()).done; ) {
      var time = $__7.value;
      {
        if (time < next.time) {
          yield* toInsert[time];
          delete toInsert[time];
        }
      }
    }
    if (next.type == "note") {
      yield addObjectProp(next, "type", "noteOn");
      var noteOffTime = next.time + next.duration - 1;
      var noteOff = MEvent({
        type: "noteOff",
        pitch: next.pitch,
        time: noteOffTime
      });
      toInsert[noteOffTime] = noteOff;
    } else {
      yield next;
    }
  }
}, "noteOnOff");
var MSwing = mGenerator(function*(timeGrid, amount, node) {
  yield* getIterator(MTime((function(e) {
    var diff = (e.time % (timeGrid * 2)) / timeGrid - 1;
    var dist = diff * diff;
    return fixFloat(e.time + amount * (1 - dist) * timeGrid);
  }), node));
}, "swing", 3);
var MQuantize = mGenerator(function*(timeGrid, amount, node) {
  yield* getIterator(MTime((function(e) {
    var diff = (e.time % (timeGrid * 2)) / timeGrid - 1;
    return fixFloat(e.time - amount * diff);
  }), node));
}, "quantize", 3);
var MLog = mGenerator(function*(name, node) {
  for (var $__6 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var e = $__7.value;
    {
      console.log(name, e);
      yield e;
    }
  }
}, "log");
var MBjorklund = mGenerator(function*(steps, pulses, rotation, node) {
  var pattern = bjorklund(steps, pulses);
  var counter = rotation;
  console.log(pattern, steps, pulses);
  if (pattern.length == 0)
    pattern = [1];
  for (var $__6 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var n = $__7.value;
    {
      if (pattern[counter++ % pattern.length])
        yield n;
    }
  }
}, "bjorklund", 4);
function bjorklund(steps, pulses) {
  steps = Math.round(steps);
  pulses = Math.round(pulses);
  if (pulses > steps || pulses == 0 || steps == 0) {
    return new Array();
  }
  var pattern = [],
      counts = [],
      remainders = [],
      divisor = steps - pulses;
  remainders.push(pulses);
  var level = 0;
  while (true) {
    counts.push(Math.floor(divisor / remainders[level]));
    remainders.push(divisor % remainders[level]);
    divisor = remainders[level];
    level += 1;
    if (remainders[level] <= 1) {
      break;
    }
  }
  counts.push(divisor);
  var r = 0;
  var build = function(level) {
    r++;
    if (level > -1) {
      for (var i = 0; i < counts[level]; i++) {
        build(level - 1);
      }
      if (remainders[level] != 0) {
        build(level - 2);
      }
    } else if (level == -1) {
      pattern.push(0);
    } else if (level == -2) {
      pattern.push(1);
    }
  };
  build(level);
  return pattern.reverse();
}
function MToArray(node) {
  var res = [];
  for (var $__6 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var n = $__7.value;
    res.push(n.valueOf());
  }
  return res;
}
var makeChainable = function(lib, name, funcToChain) {
  return function() {
    for (var args = [],
        $__17 = 0; $__17 < arguments.length; $__17++)
      args[$__17] = arguments[$__17];
    var result = funcToChain.apply(null, $traceurRuntime.spread(args));
    _.each(lib, (function(origFunction, origFunctionName) {
      result[origFunctionName] = function() {
        var $__20;
        for (var chainedArgs = [],
            $__18 = 0; $__18 < arguments.length; $__18++)
          chainedArgs[$__18] = arguments[$__18];
        chainedArgs.push(result);
        var res = ($__20 = lib)[origFunctionName].apply($__20, $traceurRuntime.spread(chainedArgs));
        return res;
      };
    }));
    return result;
  };
};
var FunctionalMusic = function() {
  var lib = {};
  var addFunction = function(name, func) {
    var chaining = arguments[2] !== (void 0) ? arguments[2] : true;
    func.prototype = _.clone(func.prototype);
    func.prototype.toString = (function() {
      return name;
    });
    lib[name] = chaining ? makeChainable(lib, name, func) : func;
  };
  addFunction("evt", MEvent);
  addFunction("data", MData);
  addFunction("prop", MProperty);
  addFunction("count", MCount);
  addFunction("repeat", MRepeat);
  addFunction("compose", MCompose);
  addFunction("loop", MLoop);
  addFunction("take", MTake);
  addFunction("filter", MFilter);
  addFunction("skip", MSkip);
  addFunction("flatten", MFlatten);
  addFunction("map", MMapOp);
  addFunction("simpleMap", MSimpleMap);
  addFunction("mapWithMemory", MMapWithMemory);
  addFunction("branch", MBranch);
  addFunction("takeWhile", MTakeWhile);
  addFunction("skipWhile", MSkipWhile);
  addFunction("loopLength", MLoopFixedLength);
  addFunction("takeTime", MTakeTime);
  addFunction("mapTime", MMapTime);
  addFunction("pitch", MPitch);
  addFunction("velocity", MVelocity);
  addFunction("duration", MDuration);
  addFunction("eventCount", MEventCount);
  addFunction("externalProperty", MExternalProperty);
  addFunction("merge", MTimeOrderedMerge);
  addFunction("delay", MDelay);
  addFunction("time", MTime);
  addFunction("set", MSet);
  addFunction("setValue", MSetValue);
  addFunction("groupByTime", MGroupTime);
  addFunction("subSequence", MSubSequence);
  addFunction("removeDuplicateNotes", MDuplicateRemover);
  addFunction("pluck", MPluck);
  addFunction("swing", MSwing);
  addFunction("quantize", MQuantize);
  addFunction("toNoteOnOff", MNoteOnOffSequence);
  addFunction("metro", MMetronome);
  addFunction("timeFromDurations", MTimeFromDurations);
  addFunction("durationsFromTime", MDurationsFromTime);
  addFunction("bjorklund", MBjorklund);
  addFunction("notePlay", MNoteAutomate);
  addFunction("notes", MNoteAutomate);
  addFunction("automate", MAutomate);
  addFunction("log", MLog);
  addFunction("toPlayable", MProcessAutomations);
  addFunction("combine", MCombine);
  addFunction("combineMap", MCombineMap);
  addFunction("toArray", MToArray, false);
  addFunction("withNext", MWithNext);
  addFunction("cache", MCache);
  return lib;
};
var m = FunctionalMusic();
