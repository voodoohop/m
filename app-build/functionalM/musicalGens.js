"use strict";
var $___46__46__47_lib_47_wu__,
    $__baseLib__,
    $___46__46__47_lib_47_utils__,
    $___46__46__47_immutable_47_nodeProxiedImmutable__;
var _ = require("lodash");
var wu = ($___46__46__47_lib_47_wu__ = require("../lib/wu"), $___46__46__47_lib_47_wu__ && $___46__46__47_lib_47_wu__.__esModule && $___46__46__47_lib_47_wu__ || {default: $___46__46__47_lib_47_wu__}).wu;
var $__1 = ($__baseLib__ = require("./baseLib"), $__baseLib__ && $__baseLib__.__esModule && $__baseLib__ || {default: $__baseLib__}),
    addGenerator = $__1.addGenerator,
    m = $__1.m;
var SortedMap = require("collections/sorted-map");
var $__2 = ($___46__46__47_lib_47_utils__ = require("../lib/utils"), $___46__46__47_lib_47_utils__ && $___46__46__47_lib_47_utils__.__esModule && $___46__46__47_lib_47_utils__ || {default: $___46__46__47_lib_47_utils__}),
    prettyToString = $__2.prettyToString,
    toStringObject = $__2.toStringObject,
    toStringDetailed = $__2.toStringDetailed,
    addFuncProp = $__2.addFuncProp,
    isIterable = $__2.isIterable,
    getIterator = $__2.getIterator,
    fixFloat = $__2.fixFloat;
var $__3 = ($___46__46__47_immutable_47_nodeProxiedImmutable__ = require("../immutable/nodeProxiedImmutable"), $___46__46__47_immutable_47_nodeProxiedImmutable__ && $___46__46__47_immutable_47_nodeProxiedImmutable__.__esModule && $___46__46__47_immutable_47_nodeProxiedImmutable__ || {default: $___46__46__47_immutable_47_nodeProxiedImmutable__}),
    immutableObj = $__3.immutableTom,
    addObjectProp = $__3.addObjectProp,
    addObjectProps = $__3.addObjectProps,
    addLazyProp = $__3.addLazyProp;
addGenerator(function* withNext(node) {
  var me = null;
  for (var $__4 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    var n = $__5.value;
    {
      if (me == null) {
        me = n;
        continue;
      }
      yield addObjectProps(me, {next: n});
      me = n;
    }
  }
});
const iterableWithTime = function(grouped, time) {
  var res = _.clone(grouped);
  return grouped;
};
addGenerator(function* groupByTime(node) {
  var currentTime = -1;
  var grouped = [];
  for (var $__4 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    var n = $__5.value;
    {
      if (!n.hasOwnProperty("time")) {
        console.error("groupByTime called but no time property".red);
        return;
      }
      if (n.time > currentTime) {
        if (grouped.length > 0) {
          yield iterableWithTime(grouped, currentTime);
          grouped = [];
        }
        currentTime = n.time;
      }
      grouped.push(n);
    }
  }
});
addGenerator(function* removeDuplicateNotes(node) {
  for (var $__6 = m(node).groupByTime()[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    var timeGrouped = $__7.value;
    {
      for (var $__4 = _.values(_.groupBy(timeGrouped, "pitch"))[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__5; !($__5 = $__4.next()).done; ) {
        var n = $__5.value;
        yield n[n.length - 1];
      }
    }
  }
});
addGenerator(function* lazyMap(name, mapFunc, node) {
  for (var $__4 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    let n = $__5.value;
    {
      var newN = addLazyProp(n, name, mapFunc);
      yield newN;
    }
  }
});
var lazyProps = (function(n) {
  return Object.keys(n).filter((function(k) {
    return n[k] && n[k].isLazy;
  }));
});
addGenerator(function* lazyResolve(node) {
  var mapped = m(node).map((function(n) {
    var res = lazyProps(n).map((function(k) {
      return n[k];
    })).map((function(autoSeq) {
      return autoSeq(n);
    }));
    var merged = res.reduce((function(prev, next) {
      return m(prev).merge(next);
    }), []);
    return merged;
  }));
  yield* getIterator(mapped);
});
var isNote = (function(n) {
  return n.hasOwnProperty("pitch") && n.hasOwnProperty("velocity") && n.hasOwnProperty("time") && n.duration > 0;
});
addGenerator(function* notePlay(node) {
  yield* getIterator(m(node).filter(isNote).lazyMap("automation_noteOnOff", (function(n) {
    return [{
      type: "noteOn",
      velocity: n.velocity,
      pitch: n.pitch,
      duration: n.duration,
      time: n.time,
      color: n.color
    }, {
      type: "noteOff",
      pitch: n.pitch,
      time: n.time + n.duration
    }];
  })));
});
addGenerator(function* automate(paramName, valGenerator, node) {
  yield* getIterator(m(node).filter(isNote).lazyMap("automation_" + paramName, (function(n) {
    var automation = m().data({
      type: "automation",
      target: n,
      name: paramName,
      duration: n.duration
    }).duration(n.duration).loop().metro(1 / 8).takeWhile((function(a) {
      return a.time < n.duration;
    })).simpleMap((function(n) {
      return n.set("automationVal", valGenerator(n));
    })).delay(n.time);
    return automation;
  })));
});
addGenerator(function* toPlayable(node) {
  yield* getIterator(m(node).notePlay().lazyResolve().flattenAndSchedule());
});
addGenerator(function* setValue(value, child) {
  yield* child.prop("value", value, child);
});
addGenerator(function* combine(combineNode, node) {
  var combineFunc = (function(me, previousOther, nextOther) {
    return addObjectProps(me, {
      previous: previousOther,
      next: nextOther
    });
  });
  var meMapped = m(node).simpleMap((function(n) {
    return {
      time: n.time,
      me: n
    };
  }));
  var otherMapped = m(combineNode).simpleMap((function(n) {
    return {
      time: n.time,
      other: n
    };
  }));
  var merged = meMapped.merge(otherMapped);
  var previousOther = null;
  var nextOther = null;
  var meWaitingForNextOther = [];
  for (var $__6 = merged[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    let n = $__7.value;
    {
      console.log("combining", "" + m, n);
      if (n.hasOwnProperty("me"))
        meWaitingForNextOther.push(n.me);
      if (n.hasOwnProperty("other") && meWaitingForNextOther.length > 0) {
        previousOther = nextOther;
        nextOther = n.other;
        for (var $__4 = meWaitingForNextOther[$traceurRuntime.toProperty(Symbol.iterator)](),
            $__5; !($__5 = $__4.next()).done; ) {
          var me = $__5.value;
          {
            yield combineFunc(me, previousOther, nextOther);
          }
        }
        meWaitingForNextOther = [];
      }
    }
  }
  for (var $__8 = meWaitingForNextOther[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__9; !($__9 = $__8.next()).done; ) {
    var me = $__9.value;
    {
      yield combineFunc(me, previousOther, nextOther);
      ;
    }
  }
});
addGenerator(function* combineMap(combineFunc, combineNode, node) {
  yield* getIterator(m(node).combine(combineNode).map((function(combined) {
    return combineFunc(combined, combined.other);
  })));
});
addGenerator(function* loopLength(loopLength, node) {
  var time = 0;
  var count = 0;
  console.log("looplength started");
  while (true) {
    for (var $__4 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__5; !($__5 = $__4.next()).done; ) {
      var n = $__5.value;
      {
        console.log("looplenghtime", time, count++);
        yield addObjectProp(n, "time", time + n.time);
      }
    }
    time += loopLength;
  }
});
var convertToObject = (function(externalVal) {
  return immutableObj(externalVal);
});
addGenerator(function* flattenAndSchedule(node) {
  var scheduled = {};
  for (var $__8 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__9; !($__9 = $__8.next()).done; ) {
    var n = $__9.value;
    {
      var minTime = Infinity;
      if (isIterable(n)) {
        for (var $__4 = n[$traceurRuntime.toProperty(Symbol.iterator)](),
            $__5; !($__5 = $__4.next()).done; ) {
          let nFlat = $__5.value;
          {
            var time = nFlat.time;
            if (time < minTime)
              minTime = time;
            (scheduled[time] = scheduled[time] || []).push(nFlat);
          }
        }
      } else {
        yield n;
        minTime = n.time;
      }
      for (var $__6 = _.filter(Object.keys(scheduled), (function(k) {
        return k < minTime;
      }))[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__7; !($__7 = $__6.next()).done; ) {
        let k = $__7.value;
        {
          if (k < minTime) {
            yield* getIterator(scheduled[k]);
            delete scheduled[k];
          }
        }
      }
    }
  }
});
addGenerator(function* map(mapFunc, node) {
  var mapped = m(node).simpleMap(mapFunc);
  yield* getIterator(mapped.flattenAndSchedule());
});
addGenerator(function* subSequence(subSeq, node) {
  yield* node;
  yield* subSeq;
});
addGenerator(function* pluck(propertyName, node) {
  yield* getIterator(m(node).simpleMap((function(e) {
    return e[propertyName];
  }), node));
});
addGenerator(function* memoryMap(initial, mapFunc, node) {
  var current = initial;
  yield* getIterator(m(initial));
  for (var $__4 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    var e = $__5.value;
    {
      current = mapFunc(current, e);
      yield* getIterator(m(e).set(m(current)));
    }
  }
});
addGenerator(function* takeTime(time, node) {
  var timeTaken = 0;
  for (var $__4 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    var e = $__5.value;
    {
      yield e;
      timeTaken += e.event.duration;
      if (timeTaken >= time)
        break;
    }
  }
});
addGenerator(function* durationSum(node) {
  yield* getIterator(node.reduce((function(sum, timedEvent) {
    return sum + timedEvent.duration;
  }), 0));
});
addGenerator(function* branch(condition, branchNode, elseNode, node) {
  for (var $__4 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    var e = $__5.value;
    {
      var branchTo = (condition(e) ? branchNode : elseNode);
      yield* getIterator(branchTo.takeWhile((function(n) {
        return n.time < e.duration;
      })).set({time: (function(n) {
          return n.time + e.time;
        })}));
    }
  }
});
addGenerator(function* endMarker() {
  yield {type: "endMarker"};
});
var propSetter = (function(name) {
  var func = function*(value, node) {
    yield* getIterator(m(node).prop(name, value));
  };
  return func;
});
addGenerator(propSetter("pitch"), {nameOverride: "pitch"});
addGenerator(propSetter("velocity"), {nameOverride: "velocity"});
addGenerator(propSetter("time"), {nameOverride: "time"});
addGenerator(propSetter("duration"), {nameOverride: "duration"});
addGenerator(function* eventCount(node) {
  yield* getIterator(m(node).prop("count", m().count(0, 1)));
});
addGenerator(function* delay(amount, node) {
  if (isIterable(amount)) {
    var zipped = m(amount.map((function(a) {
      return ({delayAmount: a});
    }))).zipLooping(node);
    yield* getIterator(zipped.simpleMap((function(n) {
      console.log("ntomshould delay", n);
      return n[0].set("time", n[0].time + n[1].delayAmount);
    })));
    return;
  } else
    yield* getIterator(m(node).map((function(n) {
      return n.set("time", amount + n.time);
    })));
});
addGenerator(function* externalProp(propName, baconProp, initialVal, node) {
  var propVal = initialVal;
  baconProp.onValue(function(v) {
    propVal = v;
  });
  var res = node.prop(propName, (function() {
    return propVal;
  }));
  yield* getIterator(res);
}, {toStringOverride: "externalProp"});
var endMarker = m().endMarker();
addGenerator(function* metro(tickDuration, node) {
  yield* getIterator(m(node).set({time: m().count(0, tickDuration)}));
});
addGenerator(function* timeFromDurations(node) {
  console.log("memmap used");
  var durationSumIterator = node.pluck("duration").memoryMap(0, (function(current, x) {
    return x + current;
  }));
  yield* getIterator(endMarker.compose(node).time(durationSumIterator));
});
addGenerator(function* durationsFromTime(node) {
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
addGenerator(function* merge(mergeNode, node) {
  if (!isIterable(node))
    retrn;
  var nodeIterator = getIterator(node);
  var x = nodeIterator.next();
  var nextNode = x.value;
  for (var $__4 = mergeNode[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    var mergeEvent = $__5.value;
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
});
addGenerator(function* swing(timeGrid, amount, node) {
  yield* getIterator(m(node).time((function(e) {
    var diff = (e.time % (timeGrid * 2)) / timeGrid - 1;
    var dist = diff * diff;
    return e.time + amount * (1 - dist) * timeGrid;
  })));
});
addGenerator(function* quantize(timeGrid, amount, node) {
  yield* getIterator(node.time((function(e) {
    var diff = (e.time % (timeGrid * 2)) / timeGrid - 1;
    return e.time - amount * diff;
  }), node));
});
addGenerator(function* bjorklund(steps, pulses, rotation, node) {
  var pattern = bjorklundMaker(steps, pulses);
  var counter = rotation;
  if (pattern.length == 0)
    pattern = [1];
  for (var $__4 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    var n = $__5.value;
    {
      if (pattern[counter++ % pattern.length]) {
        yield n;
      }
    }
  }
});
function bjorklundMaker(steps, pulses) {
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
