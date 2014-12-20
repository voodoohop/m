"use strict";
var $__baseLib__,
    $___46__46__47_lib_47_utils__,
    $___46__46__47_immutable_47_nodeProxiedImmutable__;
var _ = require("lodash");
var $__0 = ($__baseLib__ = require("./baseLib"), $__baseLib__ && $__baseLib__.__esModule && $__baseLib__ || {default: $__baseLib__}),
    addGenerator = $__0.addGenerator,
    m = $__0.m;
var SortedMap = require("collections/sorted-map");
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
addGenerator(function* withNext(node) {
  var me = null;
  for (var $__4 = node[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
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
addGenerator(function* groupByTime(node) {
  var currentTime = -1;
  var grouped = [];
  for (var $__4 = node[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
      $__5; !($__5 = $__4.next()).done; ) {
    var n = $__5.value;
    {
      if (!n.hasOwnProperty("time")) {
        console.error("groupByTime called but no time property".red);
        return;
      }
      if (n.time > currentTime) {
        if (grouped.length > 0) {
          yield immutableObj({
            events: grouped,
            time: currentTime
          });
          grouped = [];
        }
        currentTime = fixFloat(n.time);
      }
      grouped.push(n);
    }
  }
});
addGenerator(function* removeDuplicateNotes(node) {
  for (var $__6 = m(node).groupByTime()[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
      $__7; !($__7 = $__6.next()).done; ) {
    var timeGrouped = $__7.value;
    {
      for (var $__4 = _.values(_.groupBy(timeGrouped.events, "pitch"))[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
          $__5; !($__5 = $__4.next()).done; ) {
        var n = $__5.value;
        yield n[$traceurRuntime.toProperty(n.length - 1)];
      }
    }
  }
});
addGenerator(function* notePlay(node) {
  var notes = m(node).filter((function(n) {
    return n.hasOwnProperty("pitch") && n.hasOwnProperty("velocity") && n.hasOwnProperty("time") && n.duration > 0;
  }));
  yield* getIterator(m(notes).removeDuplicateNotes().map((function(n) {
    var automation = m().data([{
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
    return {automation_note: automation};
  })));
});
addGenerator(function* automate(paramName, valGenerator, node) {
  yield* getIterator(m(node).map((function(n) {
    var $__3;
    var automation = m().data({
      type: "automation",
      evt: n,
      name: paramName,
      duration: n.duration
    }).loop().metro(1 / 8).takeWhile((function(a) {
      return a.time < a.evt.duration;
    })).set({automationVal: valGenerator});
    return ($__3 = {}, Object.defineProperty($__3, "automation_" + paramName, {
      value: automation,
      configurable: true,
      enumerable: true,
      writable: true
    }), $__3);
  })));
});
addGenerator(function* toPlayable(node) {
  yield* getIterator(m(node).notePlay().simpleMap((function(n) {
    var merged = new SortedMap();
    for (var $__6 = _.filter(Object.keys(n), (function(k) {
      return k.indexOf("automation_") == 0;
    }))[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
        $__7; !($__7 = $__6.next()).done; ) {
      var automationKey = $__7.value;
      {
        var automation = n[$traceurRuntime.toProperty(automationKey)];
        for (var $__4 = automation[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
            $__5; !($__5 = $__4.next()).done; ) {
          let a = $__5.value;
          {
            var newA = a.set("time", n.time + a.time);
            if (!merged.has(newA.time))
              merged.set(newA.time, [newA]);
            else
              merged.get(newA.time).push(newA);
          }
        }
      }
    }
    return {
      time: n.time,
      events: _.flatten(merged.values())
    };
  })).flattenAndSchedule());
});
addGenerator(function* setValue(value, child) {
  yield* child.prop("value", value, child);
});
addGenerator(function* combine(combineNode, node) {
  var combineFunc = (function(me, previousOther, nextOther) {
    return addObjectProps(me, {other: {
        previous: previousOther,
        next: nextOther
      }});
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
  var merged = otherMapped.merge(meMapped);
  var previousOther = null;
  var nextOther = null;
  var meWaitingForNextOther = [];
  for (var $__6 = merged[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
      $__7; !($__7 = $__6.next()).done; ) {
    var m = $__7.value;
    {
      if (m.hasOwnProperty("me"))
        meWaitingForNextOther.push(m.me);
      if (m.hasOwnProperty("other") && meWaitingForNextOther.length > 0) {
        previousOther = nextOther;
        nextOther = m.other;
        for (var $__4 = meWaitingForNextOther[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
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
  for (var $__8 = meWaitingForNextOther[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
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
  while (true) {
    for (var $__4 = node[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
        $__5; !($__5 = $__4.next()).done; ) {
      var n = $__5.value;
      {
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
  var scheduled = new SortedMap();
  var passedInStartTime = null;
  for (var $__10 = node[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
      $__11; !($__11 = $__10.next()).done; ) {
    var n = $__11.value;
    {
      if (n.hasOwnProperty("time")) {
        var scheduledNow = _.take(scheduled.entries(), (function(s) {
          return s[0] < n.time;
        }));
        for (var $__6 = scheduledNow[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
            $__7; !($__7 = $__6.next()).done; ) {
          var scheduledEvents = $__7.value;
          {
            for (var $__4 = scheduledEvents[1][$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
                $__5; !($__5 = $__4.next()).done; ) {
              var scheduledEvent = $__5.value;
              {
                yield scheduledEvent;
              }
            }
            scheduled.delete(scheduledEvents[0]);
          }
        }
      } else
        console.error("Flatten and Schedule should work on events with time set");
      for (var $__8 = n.events[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
          $__9; !($__9 = $__8.next()).done; ) {
        var nFlat = $__9.value;
        {
          if (nFlat.hasOwnProperty("time")) {
            if (nFlat.time <= n.time)
              yield nFlat;
            else {
              if (!scheduled.has(nFlat.time)) {
                scheduled.set(nFlat.time, []);
              }
              scheduled.get(nFlat.time).push(nFlat);
            }
          } else
            console.error("Flatten and Schedule should work on events with time set");
        }
      }
    }
  }
  yield* getIterator(scheduled.values());
});
addGenerator(function* map(mapFunc, node) {
  var mapped = m(node).simpleMap(mapFunc);
  var timed = false;
  var merged = mapped.zip(node).simpleMap(function(e) {
    var mappedRes = m().data(e[1]);
    var orig = e[0];
    var res = {events: mappedRes.simpleMap((function(m) {
        return addObjectProps(orig, m);
      }))};
    if (orig.hasOwnProperty("time")) {
      res.time = orig.time;
      timed = true;
    }
    ;
    return immutableObj(res);
  });
  if (timed)
    yield* getIterator(merged.flattenAndSchedule());
  else
    yield* getIterator(merged.simpleMap((function(e) {
      return e.events;
    })).flattenShallow());
});
addGenerator(function* subSequence(subSeq, node) {
  yield* node;
  yield* subSeq;
});
addGenerator(function* pluck(propertyName, node) {
  yield* getIterator(m(node).simpleMap((function(e) {
    return e[$traceurRuntime.toProperty(propertyName)];
  }), node));
});
addGenerator(function* memoryMap(initial, mapFunc, node) {
  var current = initial;
  yield* getIterator(m(initial));
  for (var $__4 = node[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
      $__5; !($__5 = $__4.next()).done; ) {
    var e = $__5.value;
    {
      current = mapFunc(current, e.value);
      yield* getIterator(m(e).set(m(current)));
    }
  }
});
addGenerator(function* takeTime(time, node) {
  var timeTaken = 0;
  for (var $__4 = node[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
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
addGenerator(function* delay(amount, node) {
  yield* getIterator(node.time((function(time) {
    return time + amount;
  })));
});
addGenerator(function* durationSum(node) {
  yield* getIterator(node.reduce((function(sum, timedEvent) {
    return sum + timedEvent.duration;
  }), 0));
});
addGenerator(function* branch(condition, branchNode, elseNode, node) {
  for (var $__4 = node[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
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
  if (!isIterable(amount))
    amount = [amount];
  for (var $__4 = amount[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
      $__5; !($__5 = $__4.next()).done; ) {
    var a = $__5.value;
    yield* getIterator(m(node).prop("time", (function(n) {
      return n.time + a;
    })));
  }
});
addGenerator(function* externalProp(propName, baconProp, initialVal, node) {
  var propVal = initialVal;
  baconProp.onValue(function(v) {
    console.log('new param val', propName, v);
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
  var nodeIterator = getIterator(node);
  var nextNode = nodeIterator.next().value;
  for (var $__4 = mergeNode[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
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
  yield* getIterator(node.time((function(e) {
    var diff = (e.time % (timeGrid * 2)) / timeGrid - 1;
    var dist = diff * diff;
    return fixFloat(e.time + amount * (1 - dist) * timeGrid);
  })));
});
addGenerator(function* quantize(timeGrid, amount, node) {
  yield* getIterator(node.time((function(e) {
    var diff = (e.time % (timeGrid * 2)) / timeGrid - 1;
    return fixFloat(e.time - amount * diff);
  }), node));
});
addGenerator(function* bjorklund(steps, pulses, rotation, node) {
  var pattern = bjorklundMaker(steps, pulses);
  var counter = rotation;
  if (pattern.length == 0)
    pattern = [1];
  for (var $__4 = node[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
      $__5; !($__5 = $__4.next()).done; ) {
    var n = $__5.value;
    {
      if (pattern[$traceurRuntime.toProperty(counter++ % pattern.length)]) {
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
    counts.push(Math.floor(divisor / remainders[$traceurRuntime.toProperty(level)]));
    remainders.push(divisor % remainders[$traceurRuntime.toProperty(level)]);
    divisor = remainders[$traceurRuntime.toProperty(level)];
    level += 1;
    if (remainders[$traceurRuntime.toProperty(level)] <= 1) {
      break;
    }
  }
  counts.push(divisor);
  var r = 0;
  var build = function(level) {
    r++;
    if (level > -1) {
      for (var i = 0; i < counts[$traceurRuntime.toProperty(level)]; i++) {
        build(level - 1);
      }
      if (remainders[$traceurRuntime.toProperty(level)] != 0) {
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
