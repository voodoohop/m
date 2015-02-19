var _ = require("lodash");

import {
  wu
}
from "../lib/wu";

import {
  addGenerator, m
}
from "./baseLib";

import log from "../lib/logger";

var SortedMap = require("collections/sorted-map");

import {
  forOf, prettyToString, toStringObject, toStringDetailed, addFuncProp, /*clone, addObjectProp, addObjectProps, */ isIterable, getIterator, fixFloat
}
from "../lib/utils";

import {
  immutableTom as immutableObj, addObjectProp, addObjectProps, addLazyProp
}
from "../immutable/nodeProxiedImmutable";

var Immutable = require("immutable");

addGenerator(function* note(node) {
  yield* getIterator(m().evt({pitch:60,velocity:0.8, duration: 0.2}));
});

addGenerator(function* withNext(node) {
  var me = null;
  for (var n of node) {
    if (me == null) {
      me = n;
      continue;
    }
    // // console.log({me:me,next:n, time:me.time });
    yield addObjectProps(me, {
      next: n
    });
    me = n;
  }
});



const iterableWithTime = function(grouped, time) {

  var res = _.clone(grouped);
  // res.time = time;
  // res.events = group;
  // res.length = grouped.length;
  // console.log("sending event group", res);
  return grouped;
}

addGenerator(function* groupByTime(node) {
  var currentTime = -1;
  var grouped = [];
  //// console.log(""+node);
  for (var n of node) {
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
});

addGenerator(function* removeDuplicateNotes(node) {
  for (var timeGrouped of m(node).groupByTime()) {
    for (var n of _.values(_.groupBy(timeGrouped, "pitch")))
      yield n[n.length - 1]; // last one... could be first too
  }
});




// lazy mapping that can be evaluated later (for automations for example)
// and to skip from a certain point in time
addGenerator(function* lazyMap(name, mapFunc, node) {
  // var lazyFunc = (obj) => { var resFunc = mapFunc(obj);  return resFunc;}
  // lazyFunc.isLazy = true;
  // yield* m(node).simpleMap(n => n.set(name,lazyFunc));
  for (let n of node) {
    var newN = addLazyProp(n, name, mapFunc);
    // console.log("after adding lazy func", newN);
    yield newN;
  }

});


var lazyProps = (n) => Object.keys(n).filter(k => {
  // console.log("isLazy test",n,k,n[k]);

  return n[k] && n[k].isLazy
});

addGenerator(function* lazyResolve(node) {
  // // console.log("should be",m(node).take(1).toArray()[0].automation_param1.isLazy);
  // // console.log("should be".bold,""+lazyProps(m(node).take(1).toArray()[0]));
  var mapped = m(node).map(n => {
    // // console.log(n.automation_param1,lazyProps(n));
    var res = lazyProps(n).map(k => n[k]).map(autoSeq => autoSeq(n));

    var merged = res.reduce((prev, next) => {
      return m(prev).merge(next);
    }, [] /* or [n], to keep previous */ );
    // debugger;
    // console.log("----------".bgBlack);
    // console.log("merged", merged.toArray());
    // console.log("----------".bgBlack);

    // var m(res[0]).toArray());
    // console.log("lazymap merged",typeof merged);
    merged = m(n).merge(merged);
    return merged; //.simpleMap(n => n());
  });
  // mapped = mapped.merge(m(n));
  // // console.log("toA",mapped.toArray().map(n => ""+n));
  //.flattenAndSchedule();//.merge(node);
  // // console.log(m(node).simpleMap(lazyProps).toArray().map(n => n));
  yield * getIterator(mapped);
});



var isNote = n => n.hasOwnProperty("pitch") && n.hasOwnProperty("velocity") && n.hasOwnProperty("time") && n.duration > 0;

var hasTimeAndDuration = n => n.hasOwnProperty("time") && n.hasOwnProperty("duration");

addGenerator(function* automationOnly(node) {
  yield * getIterator(m(node).set({
    noteDisabled: true
  }));
});

addGenerator(function* notePlay(node) {

  // // console.log(MToArray(MTake(2,notes)));
  // // console.log("notes", m.data(notes).take(5).toArray());
  yield * getIterator(m(node).lazyMap("automation_noteOnOff", n => {

  if (isNote(n))
    return ([{
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
      }]);
  else
    return [];
  }
  ));
})



// TODO: THIS is only a  template for creating automations from notes with durations. many other possibilities. check this
//TODO: figure out how to deal with automations of notes that overlap in duration. at the moment automations are overlapping
addGenerator(function* automate(paramName, valGenerator, node) {
  // // console.log("automate".bgRed,paramName,valGenerator);
  // if (isIterable(valGenerator)) {
  //   yield* m(node).
  // }

  yield * getIterator(m(node).filter(hasTimeAndDuration).lazyMap("automation_" + paramName, (n) => {

    // // console.log("lazymap",paramName, valGenerator, "noteeeee".red.bold+"  ",n);
    var automation = m().data({
        type: "automation",
        target: n,
        name: paramName,
        duration: n.duration
      })
      // .duration(n.duration)
      .loop()
      .metro(1 / 8)
      .takeWhile(a => a.time < n.duration)
      .simpleMap(n => n.set("automationVal", valGenerator(n)))
      .delay(n.time)

    // .delay(n.time)
    // .take(2)

    // // console.log("created automation", automation.toArray(), "from",n);
    // // console.log(automation.toArray());
    return automation;
  }));
});



addGenerator(function* toPlayable(node) {
  yield * getIterator(
    m(node).notePlay()
    // .merge(m(node).filter(n => n.type=="continuous"))
    .lazyResolve()
    .flattenAndSchedule()
  )
})


var R = require("ramda");

addGenerator(function* setValue(value, child) {
  yield * child.prop("value", value, child);
});


addGenerator(function* groupBy(groupFunc, node) {
  var currentGroup = [];
  for (let n of node) {
    if (log.showDebug)
      log.debug("groupBy", currentGroup, n);
    if (!((currentGroup.length == 0) ||
        (groupFunc(currentGroup[currentGroup.length - 1], n)))) {
      yield currentGroup;
      currentGroup = [];
    }
    currentGroup.push(n);
  }
});

addGenerator(function* slidingWindow(no, node) {
  var accumulated = [];
  for (let n of node) {
    accumulated.push(n);
    if (accumulated.length > no)
      accumulated.shift();
    if(log.showDebug)
      log.debug("slidingWindow accumulated", accumulated);
    if (accumulated.length == no)
      yield accumulated;
  }
});

addGenerator(function* combine(combineNode, node) {
  var combineFunc = (me, previousOthers, nextOthers) => addObjectProps(me, {
    previous: previousOthers[previousOthers.length - 1].other,
    next: nextOthers[0].other
  });
  var meMapped = m(node).simpleMap((n) => {
    return {
      time: n.time,
      me: n
    }
  });
  var otherMapped = m(combineNode).simpleMap((n) => {
    return {
      time: n.time,
      other: n
    }
  });
  var merged = meMapped.merge(otherMapped);

  var grouped = merged.groupBy((n1, n2) => (n1.me && n2.me) || (n1.other && n2.other));

  var accumulated = grouped.slidingWindow(3);

  for (let n of accumulated) {
    if (log.showDebug)
      log.debug("combining", n, n[1]);
    if (n[1][0].hasOwnProperty("me")) {
      if(log.showDebug)
      log.debug("yielding", "previous:", n[0], "next:", n[2]);
      for (let n2 of n[1])
        yield combineFunc(n2.me, n[0], n[2]);
    }
  }


  // yield* getIterator(merged.scan(immutableObj({previous:[], next:null, lastN:null,waiting:[]}), (state,n) => {
  //   if (log.showDebug)
  //     log.debug("combine",state,n);
  //
  //   if (n.hasOwnProperty("other")) {
  //     log.debug("combineOther",state);
  //     return state.set({
  //       next: n.other,
  //       lastN: n
  //     });
  //   }
  //   if (n.hasOwnProperty("me")) {
  //     log.debug("combineMe", state);
  //     if (state.next !== null)
  //       return state.set({
  //         previous: R.append(state.next,state.previous),
  //         next: null,
  //         lastN:n,
  //         waiting: R.append(n.me,state.waiting)
  //       });
  //     else
  //       return state.set({
  //         lastN:n,
  //         waiting: R.append(n.me,state.waiting)
  //       });
  //   }
  // } ).filter(n => n.lastN !== null && n.lastN.hasOwnProperty("me")));
});


addGenerator(function* combine2(combineNode, node) {
  var combineFunc = (me, previousOthers, nextOthers) => addObjectProps(me, {
    previous: previousOthers[previousOthers.length - 1],
    next: nextOthers[0]
  });
  var meMapped = m(node).simpleMap((n) => {
    return {
      time: n.time,
      me: n
    }
  });
  var otherMapped = m(combineNode).simpleMap((n) => {
    return {
      time: n.time,
      other: n
    }
  });
  var merged = meMapped.merge(otherMapped);
  // for (var test of merged)
  //   // console.log("mergedSeq", test);
  var previousOthers = [];
  var nextOthers = [];
  var meWaitingForNextOther = [];
  // for (let n of merged) {
  //   if (n.hasOwnProperty("me")) {
  //     meWaiting.push(n.me);
  //     if (nextOthers.length>0) {
  //       for (let me of meWaiting) {
  //         yield combineFunc(me, previousOthers,nextOthers);
  //       }
  //       meWaiting=[];
  //     }
  //   }
  //   if (n.hasOwnProperty("other")) {
  //     if (meWaiting.length == 0 && nextOthers.leng) {
  //       previousOthers = nextOthers;
  //       nextOthers=[];
  //     }
  //     else
  //       nextOthers.push(n.other);
  //
  //   }
  // }


  for (let n of merged) {
    if (log.showDebug) log.debug("combining", "" + m, n);
    if (n.hasOwnProperty("me")) {
      for (let me of meWaitingForNextOther) {
        yield combineFunc(me, previousOthers, nextOthers);
      }
      meWaitingForNextOther = [n.me];
      previousOthers = nextOthers;
      nextOthers = [];
    }
    if (n.hasOwnProperty("other")) {
      nextOthers.push(n.other);
    }
  }
  for (var me of meWaitingForNextOther) {
    yield combineFunc(me, previousOthers, nextOthers);;
  }
});

addGenerator(function* combineMap(combineFunc, combineNode, node) {
  // here we could add time diffs to parameters of combineFunc
  yield * getIterator(
    m(node).combine(combineNode).map((combined) => combineFunc(combined, combined.other))
  );
});








addGenerator(function* loopLength(loopL, node) {
  var time = loopL;
  var count = 1;
  if (log.showDebug) log.debug("looplength started");

  var evaluatedNodes = m(node).takeWhile(n => n.time < loopL).toArray();
  if (log.showDebug) log.debug("looplength evaluated nodes", evaluatedNodes.length);

  yield * getIterator(evaluatedNodes);

  while (true) {
    for (var n of evaluatedNodes) {
      if (log.showDebug) log.debug("looplenghtime", time, count++);
      var _optimizeTimeJump =
        yield addObjectProp(n, "time", time + n.time);
      if (_optimizeTimeJump)
        console.log(("" + _optimizeTimeJump + "").red());
    }

    time += loopL;
  }
});



var convertToObject = (externalVal) => immutableObj(externalVal);


var PriorityQueue = require("js-priority-queue");

function getScheduleKey(o) {
  if (o && o.time !== undefined && o.time !== null && o.time.valueOf)
    return o.time.valueOf();
  if (o !== undefined && o.valueOf)
    return o;
  return undefined;
  //  (o.valueOf && o.valueOf()));
}

addGenerator(function* flattenAndSchedule(node) {
  // var outerIterator = getIterator(node);
  var scheduled = new PriorityQueue({
    comparator: (a, b) => {
      // if (log.showDebug) log.debug("scheduleKey", getScheduleKey(b)- getScheduleKey(a));
      return getScheduleKey(a) - getScheduleKey(b)
    }
  });
  yield* forOf(node,n => {
    var minTime = Infinity;

    var toYield=[];

    if (isIterable(n)) {
      for (let nFlat of n) {
        var time = getScheduleKey(nFlat); //.time;
        // if (log.showDebug) log.debug("key for flatten",time);
        if (time < minTime)
          minTime = time;

        scheduled.queue(nFlat);

      }
    } else {
      toYield.push(n);
      minTime = getScheduleKey(n);
    }
    // if (log.showDebug) log.debug("minTime2", getScheduleKey(scheduled.peek()), minTime);
    while (scheduled.length > 0 && getScheduleKey(scheduled.peek()) < minTime) {
      // if (log.showDebug) log.debug("scheduledLength",scheduled.length, scheduled.peek());
      toYield.push(scheduled.dequeue());
      // if (log.showDebug) log.debug("scheduledLength2",scheduled.length);
    }


    return toYield;
  });

  while (scheduled.length > 0) {
    // if (log.showDebug) log.debug("scheduledLength2",scheduled.length);
    yield scheduled.dequeue();
  }

  // yield* getIterator(scheduled.keySeq().sort().flatMap(k => scheduled.get(k)));
});



// cases:
// 1: mapFunc returns an iterable
// - flatten and schedule returned elements
// 2: mapFunc returns one element
// - just simpleMap
// both same actually



addGenerator(function* map(mapFunc, node) {

  var mapped = m(node).simpleMap(mapFunc);

  yield * getIterator(mapped.flattenAndSchedule());

});







//
// // somehow like sequencer
// var MCombineLast = mGenerator(function*(combineFunc, combineNode, node) {
//   var meIterator = getIterator(node);
//   //var meNext = null;
//   var last = meIterator.next().value;
//   for (var c of combineNode) {
//     var next = meIterator.next();
//     if (next.time < c.time) {
//       last = next;
//       continue;
//     }
//     yield combineFunc(last, next, combineNode);
//
//     last = next;
//   }
// });
//




addGenerator(function* subSequence(subSeq, node) {
  // change yield* to iterating through subSequence
  yield * node;
  yield * subSeq;
});



addGenerator(function* pluck(propertyName, node) {
  yield * getIterator(m(node).simpleMap(e => e[propertyName], node))
});



// addGenerator(function* scan(initial, mapFunc, node) {
//   var current = initial;
//   yield * getIterator(m(initial));
//   for (var e of node) {
//     current = mapFunc(current, e);
//     if (log.showDebug)
//       log.debug("scan", current, e);
//     //  // console.log("current",current);
//     yield current;
//   }
// });
//



addGenerator(function* takeTime(time, node) {
  var timeTaken = 0;
  for (var e of node) {
    yield e;
    timeTaken += e.event.duration;
    if (timeTaken >= time)
      break;
  }
});


// // TODO: possible duplicate of time??
// addGenerator(function* mapTime(mapFunc, node) {
//   for (var e of node) {
//     yield e.set("time",mapFunc(e.time));
//   }
// });

// addGenerator(function* delay(amount, node) {
//   // console.log("delaying",node)
//   yield* getIterator(node.time(n => {
//     // console.log("nnn",n,amount,n);
//     return n.time + amount;
//   }));
// });
//

addGenerator(function* durationSum(node) {
  yield * getIterator(node.reduce((sum, timedEvent) => sum + timedEvent.duration, 0));
});




addGenerator(function* branch(condition, branchNode, node) {
  for (var e of node) {
    //// console.log("branching", condition, e);
    var branchTo = (condition(e) ? branchNode : node);

    //// console.log(e,branchTo.set);
    yield * getIterator(branchTo.takeWhile((n) => n.time < e.duration).set({
      time: (n) => n.time + e.time
    }));
    //yield* getIterator(branchTo
    //  .takeWhile((n) => n.time < e.duration)
    //  .set((n) => {time: n.time+e.time})
    //);
  }
});



addGenerator(function* endMarker() {
  yield {
    type: "endMarker"
  };
});

var propSetter = (name) => {
  var func = function*(value, node) {
    yield * getIterator(m(node).prop(name, value));
  };
  // func.displayMame =name;
  return func;
};

addGenerator(propSetter("pitch"), {
  nameOverride: "pitch"
});

addGenerator(propSetter("velocity"), {
  nameOverride: "velocity"
});

addGenerator(propSetter("time"), {
  nameOverride: "time"
});

addGenerator(propSetter("duration"), {
  nameOverride: "duration"
});

addGenerator(function* eventCount(node) {
  // // console.log("nnnode",node);
  yield * getIterator(m(node).prop("count", m().count(0, 1)))
});
// addGenerator(propSetter("count", MCount(0, 1));

addGenerator(function* delay(amount, node) {
  // console.log("delaying",amount, node);
  if (isIterable(amount)) {
    var zipped = m(amount.map(a => ({
      delayAmount: a
    }))).zipLooping(node);
    yield * getIterator(zipped.simpleMap(n => {
      if (log.showDebug) log.debug("ntomshould delay", n);
      return n[0].set("time", n[0].time + n[1].delayAmount);
    }));
    return;
  } else
  // for (var a of amount)
    yield * getIterator(m(node).map(n => {
    return n.set("time", amount + n.time)
  }));
});

addGenerator(function* translate(amount, node) {
  // console.log("delaying",amount, node);
  if (isIterable(amount)) {
    var zipped = m(amount.map(a => ({
      translateAmount: a
    }))).zipLooping(node);
    yield * getIterator(zipped.simpleMap(n => {
      if (log.showDebug) log.debug("ntomshould translate", n);
      return n[0].set("pitch", n[0].pitch + n[1].translateAmount);
    }));
    return;
  } else
  // for (var a of amount)
    yield * getIterator(m(node).map(n => {
    return n.set("pitch", amount + n.pitch);
  }));
});


// maybe possible to modify event properties to have iterables with time somehow connecting to time of external events
addGenerator(function* externalProp(propName, baconProp, initialVal, node) {
  // var propVal = initialVal;
  // // set up bacon listener
  // baconProp.onValue(function(v) {
  //   // console.log('new param val', propName, v);
  //   propVal = v;
  // });

  var asyncSeq = m().asyncDataLatest(baconProp, initialVal)
    .simpleMap(v => ({[propName]: () => v.valueOf()}));

  // var res = m(node).set({[propName]: () => propVal});
  yield * getIterator(m(node).zipMerge(asyncSeq));
}, {
  toStringOverride: "externalProp"
});

var endMarker = m().endMarker();

addGenerator(function* metro(tickDuration, node) {
  // console.log("timtimtim",m(node).set({time:m().count(0,tickDuration)}).take(5).toArray());
  yield * getIterator(m(node).set({
    time: m().count(0, tickDuration)
  }));
});


addGenerator(function* timeFromDurations(node) {
  if (log.showDebug) log.debug("memmap used");
  var durationSumIterator = m(node).pluck("duration").scan(0, (current, x) => x + current);
  yield * getIterator(endMarker.compose(node).time(durationSumIterator));
});


addGenerator(function* durationsFromTime(node) {
  var i = getIterator(node);
  var previous = undefined;
  while (true) {
    var next = i.next().value;
    if (next === undefined)
      return;
    if (previous != undefined && previous.hasOwnProperty("time") && next.hasOwnProperty("time")) {
      yield addObjectProps(previous, {
        duration: next.time - previous.time - 0.01
      });
    }
    previous = next;
  }
});



// var MInsertWhen = MDirectOp(
//   function* (nodeIterator, insertCondition, insertNode) {
//     for (var e of nodeIterator) {
//       if (insertCondition(e))
//         yield* insertNode;
//       yield e;
//     }
//   }
// )


// before insert, could make explicit
//var MInsertOnce = (insertCondition, insertNode, node) => MCompose(MTakeWhile(e => !insertCondition(e),node), insertNode, MSkipWhile(e => !insertCondition(e),node));


// Time ordered merge
addGenerator(function* merge(mergeNode, node) {
  if (!isIterable(node))
    retrn;
  var nodeIterator = getIterator(node);
  // console.log("nextNode",nextNode);
  var x = nodeIterator.next();
  // console.log(x);
  var nextNode = x.value;
  for (var mergeEvent of mergeNode) {
    while (nextNode != undefined && nextNode.time <= mergeEvent.time) {
      yield nextNode;
      nextNode = nodeIterator.next().value;
    }
    yield mergeEvent;
  }
  if (nextNode !== undefined)
    yield nextNode;
  yield * nodeIterator;
});





addGenerator(function* swing(timeGrid, amount, node) {
  // console.log("swinging",timeGrid, amount, node);
  yield * getIterator(m(node).time((e) => {
    // // console.log("swing, mapping,",e);
    var diff = (e.time % (timeGrid * 2)) / timeGrid - 1;

    var dist = diff * diff;
    // // console.log("swing", {time: fixFloat(e.time + amount * (1-dist) * timeGrid)});
    return e.time + amount * (1 - dist) * timeGrid;
  }))
});

addGenerator(function* quantize(timeGrid, amount, node) {
  yield * getIterator(node.time((e) => {
    // // console.log("swing, mapping,",e);
    var diff = (e.time % (timeGrid * 2)) / timeGrid - 1;


    // // console.log("swing", {time: fixFloat(e.time + amount * (1-dist) * timeGrid)});
    return e.time - amount * diff;
  }, node))
});

function paramEval(param) {
  if (typeof param === "function")
    return n => param(n);
  if (isIterable(param)) {
    var iterator = getIterator(param);
    var lastVal = undefined;
    return () => {
      var next = iterator.next();
      if (next.done)
        return lastVal;
      return next.value;
    };
  }
  return () => param;
}

addGenerator(function* bjorklund(steps, pulses, rotation, node) {
  var stepsEval = paramEval(steps);
  var pulsesEval = paramEval(pulses);
  var rotationEval = paramEval(rotation);

  //var memoizedBjorklund = _.memoize(bjorklundMaker);
  // var pattern = bjorklundMaker(steps, pulses);

  var counter = 0; //rotation;
  for (var n of node) {
    var pattern = bjorklundMaker(stepsEval(n), pulsesEval(n));
    if (pattern.length == 0)
      pattern = [1];
    // c  onsole.log(stepsEval(n), pulsesEval(n),rotationEval(n));
    if (pattern[((counter++) + rotationEval(n)) % pattern.length]) {
      yield n;
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


var testCombine1 = m().evt({
  pitch: 49
}).metro(1).delay(0.1);
var testCombine2 = m().evt({
  pitch: 49
}).metro(0.25);

var combined = testCombine1.combine(testCombine2);

combined.take(10).toArray().forEach(n => console.log("combineTest", n));

// throw "bye";
