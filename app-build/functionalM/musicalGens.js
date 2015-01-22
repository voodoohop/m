"use strict";
var $___46__46__47_lib_47_wu__,
    $__baseLib__,
    $___46__46__47_lib_47_logger__,
    $___46__46__47_lib_47_utils__,
    $___46__46__47_immutable_47_nodeProxiedImmutable__;
var _ = require("lodash");
var wu = ($___46__46__47_lib_47_wu__ = require("../lib/wu"), $___46__46__47_lib_47_wu__ && $___46__46__47_lib_47_wu__.__esModule && $___46__46__47_lib_47_wu__ || {default: $___46__46__47_lib_47_wu__}).wu;
var $__1 = ($__baseLib__ = require("./baseLib"), $__baseLib__ && $__baseLib__.__esModule && $__baseLib__ || {default: $__baseLib__}),
    addGenerator = $__1.addGenerator,
    m = $__1.m;
var log = ($___46__46__47_lib_47_logger__ = require("../lib/logger"), $___46__46__47_lib_47_logger__ && $___46__46__47_lib_47_logger__.__esModule && $___46__46__47_lib_47_logger__ || {default: $___46__46__47_lib_47_logger__}).default;
var SortedMap = require("collections/sorted-map");
var $__3 = ($___46__46__47_lib_47_utils__ = require("../lib/utils"), $___46__46__47_lib_47_utils__ && $___46__46__47_lib_47_utils__.__esModule && $___46__46__47_lib_47_utils__ || {default: $___46__46__47_lib_47_utils__}),
    prettyToString = $__3.prettyToString,
    toStringObject = $__3.toStringObject,
    toStringDetailed = $__3.toStringDetailed,
    addFuncProp = $__3.addFuncProp,
    isIterable = $__3.isIterable,
    getIterator = $__3.getIterator,
    fixFloat = $__3.fixFloat;
var $__4 = ($___46__46__47_immutable_47_nodeProxiedImmutable__ = require("../immutable/nodeProxiedImmutable"), $___46__46__47_immutable_47_nodeProxiedImmutable__ && $___46__46__47_immutable_47_nodeProxiedImmutable__.__esModule && $___46__46__47_immutable_47_nodeProxiedImmutable__ || {default: $___46__46__47_immutable_47_nodeProxiedImmutable__}),
    immutableObj = $__4.immutableTom,
    addObjectProp = $__4.addObjectProp,
    addObjectProps = $__4.addObjectProps,
    addLazyProp = $__4.addLazyProp;
var Immutable = require("immutable");
addGenerator(function* withNext(node) {
  var me = null;
  for (var $__5 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__6; !($__6 = $__5.next()).done; ) {
    var n = $__6.value;
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
  for (var $__5 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__6; !($__6 = $__5.next()).done; ) {
    var n = $__6.value;
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
  for (var $__7 = m(node).groupByTime()[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__8; !($__8 = $__7.next()).done; ) {
    var timeGrouped = $__8.value;
    {
      for (var $__5 = _.values(_.groupBy(timeGrouped, "pitch"))[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__6; !($__6 = $__5.next()).done; ) {
        var n = $__6.value;
        yield n[n.length - 1];
      }
    }
  }
});
addGenerator(function* lazyMap(name, mapFunc, node) {
  for (var $__5 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__6; !($__6 = $__5.next()).done; ) {
    let n = $__6.value;
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
var hasTimeAndDuration = (function(n) {
  return n.hasOwnProperty("time") && n.hasOwnProperty("duration");
});
addGenerator(function* automationOnly(node) {
  yield* getIterator(m(node).set({noteDisabled: true}));
});
addGenerator(function* notePlay(node) {
  yield* getIterator(m(node).filter(isNote).lazyMap("automation_noteOnOff", (function(n) {
    return [{
      type: "noteOn",
      velocity: n.velocity,
      pitch: n.pitch,
      duration: n.duration,
      time: n.time,
      color: n.color,
      noteDisabled: n.noteDisabled
    }, {
      type: "noteOff",
      pitch: n.pitch,
      time: n.time + n.duration,
      noteDisabled: n.noteDisabled
    }];
  })));
});
addGenerator(function* automate(paramName, valGenerator, node) {
  yield* getIterator(m(node).filter(hasTimeAndDuration).lazyMap("automation_" + paramName, (function(n) {
    var automation = m().data({
      type: "automation",
      target: n,
      name: paramName,
      duration: n.duration
    }).loop().metro(1 / 4).takeWhile((function(a) {
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
var R = require("ramda");
addGenerator(function* setValue(value, child) {
  yield* child.prop("value", value, child);
});
addGenerator(function* groupBy(groupFunc, node) {
  var currentGroup = [];
  for (var $__5 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__6; !($__6 = $__5.next()).done; ) {
    let n = $__6.value;
    {
      if (log.showDebug)
        log.debug("groupBy", currentGroup, n);
      if (!((currentGroup.length == 0) || (groupFunc(currentGroup[currentGroup.length - 1], n)))) {
        yield currentGroup;
        currentGroup = [];
      }
      currentGroup.push(n);
    }
  }
});
addGenerator(function* slidingWindow(no, node) {
  var accumulated = [];
  for (var $__5 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__6; !($__6 = $__5.next()).done; ) {
    let n = $__6.value;
    {
      accumulated.push(n);
      if (accumulated.length > no)
        accumulated.shift();
      log.debug("slidingWindow accumulated", accumulated);
      if (accumulated.length == no)
        yield accumulated;
    }
  }
});
addGenerator(function* combine(combineNode, node) {
  var combineFunc = (function(me, previousOthers, nextOthers) {
    return addObjectProps(me, {
      previous: previousOthers[previousOthers.length - 1].other,
      next: nextOthers[0].other
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
  var grouped = merged.groupBy((function(n1, n2) {
    return (n1.me && n2.me) || (n1.other && n2.other);
  }));
  var accumulated = grouped.slidingWindow(3);
  for (var $__7 = accumulated[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__8; !($__8 = $__7.next()).done; ) {
    let n = $__8.value;
    {
      if (log.showDebug)
        log.debug("combining", n, n[1]);
      if (n[1][0].hasOwnProperty("me")) {
        log.debug("yielding", "previous:", n[0], "next:", n[2]);
        for (var $__5 = n[1][$traceurRuntime.toProperty(Symbol.iterator)](),
            $__6; !($__6 = $__5.next()).done; ) {
          let n2 = $__6.value;
          yield combineFunc(n2.me, n[0], n[2]);
        }
      }
    }
  }
});
addGenerator(function* combine2(combineNode, node) {
  var combineFunc = (function(me, previousOthers, nextOthers) {
    return addObjectProps(me, {
      previous: previousOthers[previousOthers.length - 1],
      next: nextOthers[0]
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
  var previousOthers = [];
  var nextOthers = [];
  var meWaitingForNextOther = [];
  for (var $__7 = merged[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__8; !($__8 = $__7.next()).done; ) {
    let n = $__8.value;
    {
      if (log.showDebug)
        log.debug("combining", "" + m, n);
      if (n.hasOwnProperty("me")) {
        for (var $__5 = meWaitingForNextOther[$traceurRuntime.toProperty(Symbol.iterator)](),
            $__6; !($__6 = $__5.next()).done; ) {
          let me = $__6.value;
          {
            yield combineFunc(me, previousOthers, nextOthers);
          }
        }
        meWaitingForNextOther = [n.me];
        previousOthers = nextOthers;
        nextOthers = [];
      }
      if (n.hasOwnProperty("other")) {
        nextOthers.push(n.other);
      }
    }
  }
  for (var $__9 = meWaitingForNextOther[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__10; !($__10 = $__9.next()).done; ) {
    var me = $__10.value;
    {
      yield combineFunc(me, previousOthers, nextOthers);
      ;
    }
  }
});
addGenerator(function* combineMap(combineFunc, combineNode, node) {
  yield* getIterator(m(node).combine(combineNode).map((function(combined) {
    return combineFunc(combined, combined.other);
  })));
});
addGenerator(function* loopLength(loopL, node) {
  var time = loopL;
  var count = 1;
  if (log.showDebug)
    log.debug("looplength started");
  var evaluatedNodes = m(node).takeWhile((function(n) {
    return n.time < loopL;
  })).toArray();
  if (log.showDebug)
    log.debug("looplength evaluated nodes", evaluatedNotes.length);
  yield* getIterator(evaluatedNodes);
  while (true) {
    for (var $__5 = evaluatedNodes[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__6; !($__6 = $__5.next()).done; ) {
      var n = $__6.value;
      {
        if (log.showDebug)
          log.debug("looplenghtime", time, count++);
        var _optimizeTimeJump = yield addObjectProp(n, "time", time + n.time);
        if (_optimizeTimeJump)
          console.log(("" + _optimizeTimeJump + "").red());
      }
    }
    time += loopL;
  }
});
var convertToObject = (function(externalVal) {
  return immutableObj(externalVal);
});
var PriorityQueue = require("js-priority-queue");
function getScheduleKey(o) {
  if (o && o.time !== undefined && o.time !== null && o.time.valueOf)
    return o.time.valueOf();
  if (o !== undefined && o.valueOf)
    return o;
  return undefined;
}
addGenerator(function* flattenAndSchedule(node) {
  var scheduled = new PriorityQueue({comparator: (function(a, b) {
      return getScheduleKey(a) - getScheduleKey(b);
    })});
  for (var $__7 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__8; !($__8 = $__7.next()).done; ) {
    var n = $__8.value;
    {
      var minTime = Infinity;
      if (isIterable(n)) {
        for (var $__5 = n[$traceurRuntime.toProperty(Symbol.iterator)](),
            $__6; !($__6 = $__5.next()).done; ) {
          let nFlat = $__6.value;
          {
            var time = getScheduleKey(nFlat);
            if (time < minTime)
              minTime = time;
            if (log.showDebug)
              log.debug("queuing", nFlat);
            scheduled.queue(nFlat);
          }
        }
      } else {
        yield n;
        minTime = getScheduleKey(n);
      }
      while (scheduled.length > 0 && getScheduleKey(scheduled.peek()) < minTime) {
        yield scheduled.dequeue();
      }
    }
  }
  while (scheduled.length > 0) {
    yield scheduled.dequeue();
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
addGenerator(function* scan(initial, mapFunc, node) {
  var current = initial;
  yield* getIterator(m(initial));
  for (var $__5 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__6; !($__6 = $__5.next()).done; ) {
    var e = $__6.value;
    {
      current = mapFunc(current, e);
      if (log.showDebug)
        log.debug("scan", current, e);
      yield current;
    }
  }
});
addGenerator(function* takeTime(time, node) {
  var timeTaken = 0;
  for (var $__5 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__6; !($__6 = $__5.next()).done; ) {
    var e = $__6.value;
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
  for (var $__5 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__6; !($__6 = $__5.next()).done; ) {
    var e = $__6.value;
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
      if (log.showDebug)
        log.debug("ntomshould delay", n);
      return n[0].set("time", n[0].time + n[1].delayAmount);
    })));
    return;
  } else
    yield* getIterator(m(node).map((function(n) {
      return n.set("time", amount + n.time);
    })));
});
addGenerator(function* translate(amount, node) {
  if (isIterable(amount)) {
    var zipped = m(amount.map((function(a) {
      return ({translateAmount: a});
    }))).zipLooping(node);
    yield* getIterator(zipped.simpleMap((function(n) {
      if (log.showDebug)
        log.debug("ntomshould translate", n);
      return n[0].set("pitch", n[0].pitch + n[1].translateAmount);
    })));
    return;
  } else
    yield* getIterator(m(node).map((function(n) {
      return n.set("pitch", amount + n.pitch);
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
  if (log.showDebug)
    log.debug("memmap used");
  var durationSumIterator = m(node).pluck("duration").scan(0, (function(current, x) {
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
  for (var $__5 = mergeNode[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__6; !($__6 = $__5.next()).done; ) {
    var mergeEvent = $__6.value;
    {
      while (nextNode != undefined && nextNode.time <= mergeEvent.time) {
        yield nextNode;
        nextNode = nodeIterator.next().value;
      }
      yield mergeEvent;
    }
  }
  if (nextNode !== undefined)
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
function paramEval(param) {
  if (typeof param === "function")
    return (function(n) {
      return param(n);
    });
  if (isIterable(param)) {
    var iterator = getIterator(param);
    var lastVal = undefined;
    return (function() {
      var next = iterator.next();
      if (next.done)
        return lastVal;
      return next.value;
    });
  }
  return (function() {
    return param;
  });
}
addGenerator(function* bjorklund(steps, pulses, rotation, node) {
  var stepsEval = paramEval(steps);
  var pulsesEval = paramEval(pulses);
  var counter = 0;
  for (var $__5 = node[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__6; !($__6 = $__5.next()).done; ) {
    var n = $__6.value;
    {
      var pattern = bjorklundMaker(stepsEval(n), pulsesEval(n));
      if (pattern.length == 0)
        pattern = [1];
      if (pattern[((counter++) + rotation) % pattern.length]) {
        yield n;
      }
    }
  }
});
var bjorklundMemo = {};
function memoizedBjorklundMaker(steps, pulses) {
  var key = "" + steps + "_" + pulses;
  if (bjorklundMemo[key])
    return bjorklundMemo[key];
  return (bjorklundMemo[key] = bjorklundMaker(steps, pulses));
}
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
var testCombine1 = m().evt({pitch: 50}).metro(1).delay(0.1);
var testCombine2 = m().evt({pitch: 50}).metro(0.25);
var combined = testCombine1.combine(testCombine2);
combined.take(10).toArray().forEach((function(n) {
  return console.log("combineTest", n);
}));
