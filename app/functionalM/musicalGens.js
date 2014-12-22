

var _ = require("lodash");

import {wu} from "../lib/wu";

import {addGenerator,m} from "./baseLib";

var SortedMap = require("collections/sorted-map");

import {
  prettyToString, toStringObject, toStringDetailed, addFuncProp, /*clone, addObjectProp, addObjectProps, */ isIterable, getIterator, fixFloat
}
from "../lib/utils";

import {
  immutableTom as immutableObj, addObjectProp, addObjectProps, addLazyProp
} from "../immutable/nodeProxiedImmutable";





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



const iterableWithTime=function(grouped, time) {

  var res = _.clone(grouped);
  res.time = time;
  // console.log("sending event group", res);
  return res;
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
      currentTime = fixFloat(n.time);
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
addGenerator(function* lazyMap(name, mapFunc,node) {
  // var lazyFunc = (obj) => { var resFunc = mapFunc(obj);  return resFunc;}
  // lazyFunc.isLazy = true;
  // yield* m(node).simpleMap(n => n.set(name,lazyFunc));
  for (let n of node) {
    var newN = addLazyProp(n, name, mapFunc);
    // console.log("after adding lazy func", newN);
    yield newN;
  }

});


var lazyProps = (n) => Object.keys(n).filter(k => n[k].isLazy);

addGenerator(function* lazyResolve(node) {
  // // console.log("should be",m(node).take(1).toArray()[0].automation_param1.isLazy);
  // // console.log("should be".bold,""+lazyProps(m(node).take(1).toArray()[0]));
  var mapped = m(node).map(n => {
    // // console.log(n.automation_param1,lazyProps(n));
    var res = lazyProps(n).map(k => n[k]).map(autoSeq => autoSeq(n));



    var merged=res.reduce((prev,next) => {
      return m(prev).merge(next);
    },[n]);
    // debugger;
    // console.log("----------".bgBlack);
    // console.log("merged", merged.toArray());
    // console.log("----------".bgBlack);

    // var m(res[0]).toArray());
    return merged;//.simpleMap(n => n());
  });
  // // console.log("toA",mapped.toArray().map(n => ""+n));
  //.flattenAndSchedule();//.merge(node);
  // // console.log(m(node).simpleMap(lazyProps).toArray().map(n => n));
  yield* getIterator(mapped);
});



var isNote = n => n.hasOwnProperty("pitch") && n.hasOwnProperty("velocity") && n.hasOwnProperty("time") && n.duration > 0;

addGenerator(function* notePlay(node) {

  // // console.log(MToArray(MTake(2,notes)));
  // // console.log("notes", m.data(notes).take(5).toArray());
  yield * getIterator(m(node).filter(isNote).lazyMap("automation_noteOnOff",n =>
      [{
        type: "noteOn",
        velocity: n.velocity,
        pitch: n.pitch,
        duration: n.duration,
        time: n.time
      }, {
        type: "noteOff",
        pitch: n.pitch,
        time: n.time+n.duration
      }]
  ));
})



// TODO: THIS is only a  template for creating automations from notes with durations. many other possibilities. check this
//TODO: figure out how to deal with automations of notes that overlap in duration. at the moment automations are overlapping
addGenerator(function* automate(paramName, valGenerator, node) {
  // // console.log("automate".bgRed,paramName,valGenerator);
  yield * getIterator(m(node).filter(isNote).lazyMap("automation_"+paramName,(n) => {

    // // console.log("lazymap",paramName, valGenerator, "noteeeee".red.bold+"  ",n);
    var automation = m().evt({
        type: "automation",
        target: n,
        name: paramName,
        duration: n.duration
      })
      .duration(n.duration)
      .loop()
      .metro(1/8)
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
    m(node).notePlay().lazyResolve().flattenAndSchedule()
  )
})



addGenerator(function* setValue(value, child) {
  yield* child.prop("value", value, child);
});



addGenerator(function* combine(combineNode, node) {
  var combineFunc = (me, previousOther, nextOther) => addObjectProps(me, {
    previous: previousOther,
    next: nextOther
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
  var merged = otherMapped.merge(meMapped);
  // for (var test of merged)
  //   // console.log("mergedSeq", test);
  var previousOther = null;
  var nextOther = null;
  var meWaitingForNextOther = [];
  for (var m of merged) {
    // // console.log("combining",m);
    if (m.hasOwnProperty("me"))
      meWaitingForNextOther.push(m.me);
    if (m.hasOwnProperty("other") && meWaitingForNextOther.length > 0) {
      previousOther = nextOther;
      nextOther = m.other;
      for (var me of meWaitingForNextOther) {
        yield combineFunc(me, previousOther, nextOther);
      }
      meWaitingForNextOther = [];
    }
  }
  for (var me of meWaitingForNextOther) {
    yield combineFunc(me, previousOther, nextOther);;
  }
});

addGenerator(function* combineMap(combineFunc, combineNode, node) {
  // here we could add time diffs to parameters of combineFunc
  yield * getIterator(
    m(node).combine(combineNode).map((combined) => combineFunc(combined, combined.other))
  );
});








addGenerator(function* loopLength(loopLength, node) {
  var time = 0;
  while (true) {
    for (var n of node) {
      //  // console.log("looplengtime",time);
      yield addObjectProp(n, "time", time + n.time);
    }
    time += loopLength;
  }
});



var convertToObject = (externalVal) => immutableObj(externalVal);



addGenerator(function* flattenAndSchedule(node) {
  // var outerIterator = getIterator(node);
  var scheduled = {};
  for (var n of node) {
    var minTime = Infinity;
    if (isIterable(n)) {
      for (let nFlat of n) {
        var time = nFlat.time;
        if (time < minTime)
          minTime = time;

        // if (!scheduled[time))
        (scheduled[time] = scheduled[time] || []).push(nFlat);

        // scheduled.get(time).push(nFlat);
        // // console.log("nFlat",nFlat,"scheduled",scheduled.entries());
        // bucket.push(nFlat);

      }
    }
    else {
      yield n;
      minTime = n.time;
    }
    // // console.log(scheduled);

    // // console.log(minTime, scheduled);
    // var sIterator = scheduled.iterator();
    for (let k of _.filter(Object.keys(scheduled), (k) => k < minTime )) {
      // // console.log(scheduled[k]);
      // // console.log("k",k);
      if (k < minTime) {
        // // console.log("yielding",k,scheduled[k]);
        yield* getIterator(scheduled[k]);
        // scheduled.delete(s.time);
        delete scheduled[k];
      }

    }


  }
});



// cases:
// 1: mapFunc returns an iterable
// - flatten and schedule returned elements
// 2: mapFunc returns one element
// - just simpleMap
// both same actually



addGenerator(function* map(mapFunc, node) {

  var mapped = m(node).simpleMap(mapFunc);

  yield* getIterator(mapped.flattenAndSchedule());

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



addGenerator(function* memoryMap(initial, mapFunc, node) {
  var current = initial;
  yield * getIterator(m(initial));
  for (var e of node) {
    current = mapFunc(current, e);
    //  // console.log("current",current);
    yield * getIterator(m(e).set(m(current)));
  }
});




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
  yield* getIterator(node.reduce((sum, timedEvent) => sum + timedEvent.duration, 0));
});




addGenerator( function* branch(condition, branchNode, elseNode, node) {
  for (var e of node) {
    //// console.log("branching", condition, e);
    var branchTo = (condition(e) ? branchNode : elseNode);

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

var propSetter= (name) => {
  var func = function*(value, node) {
    yield* getIterator(m(node).prop(name,value));
  };
  // func.displayMame =name;
  return func;
};

addGenerator(propSetter("pitch"),{nameOverride:"pitch"});

addGenerator(propSetter("velocity"),{nameOverride:"velocity"});

addGenerator(propSetter("time"),{nameOverride:"time"});

addGenerator(propSetter("duration"),{nameOverride:"duration"});

addGenerator(function* eventCount(node) {
  // // console.log("nnnode",node);
  yield* getIterator(m(node).prop("count",m().count(0,1)))
});
// addGenerator(propSetter("count", MCount(0, 1));

addGenerator(function* delay(amount, node) {
  // console.log("delaying",amount, node);
  // if (!isIterable(amount))
  //   amount = [amount];
  //
  // for (var a of amount)
    yield * getIterator(m(node).simpleMap(n => n.set("time",amount+n.time)));
});


// maybe possible to modify event properties to have iterables with time somehow connecting to time of external events
addGenerator(function* externalProp(propName, baconProp, initialVal, node) {
  var propVal = initialVal;
  // set up bacon listener
  baconProp.onValue(function(v) {
    // console.log('new param val', propName, v);
    propVal = v;
  });
  var res = node.prop(propName, () => propVal);
  yield * getIterator(res);
}, {toStringOverride:"externalProp"});

var endMarker = m().endMarker();

addGenerator(function* metro(tickDuration, node) {
  // console.log("timtimtim",m(node).set({time:m().count(0,tickDuration)}).take(5).toArray());
  yield* getIterator(m(node).set({time:m().count(0,tickDuration)}));
});


addGenerator(function* timeFromDurations(node) {
  console.log("memmap used");
  var durationSumIterator = node.pluck("duration").memoryMap(0, (current, x) => x + current);
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
  console.log("nextNode",nextNode);
  var x=nodeIterator.next();
  console.log(x);
  var nextNode = x.value;
  for (var mergeEvent of mergeNode) {
    while (nextNode != undefined && nextNode.time < mergeEvent.time) {
      yield nextNode;
      nextNode = nodeIterator.next().value;
    }
    yield mergeEvent;
  }
  if (nextNode != undefined)
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
    return fixFloat(e.time + amount * (1 - dist) * timeGrid);
  } ))
});

addGenerator(function* quantize(timeGrid, amount, node) {
  yield * getIterator( node.time((e) => {
    // // console.log("swing, mapping,",e);
    var diff = (e.time % (timeGrid * 2)) / timeGrid - 1;


    // // console.log("swing", {time: fixFloat(e.time + amount * (1-dist) * timeGrid)});
    return fixFloat(e.time - amount * diff);
  }, node))
});


addGenerator(function* bjorklund(steps, pulses, rotation, node) {
  var pattern = bjorklundMaker(steps, pulses);
  var counter = rotation;
  if (pattern.length == 0)
    pattern = [1];
  for (var n of node) {

    if (pattern[counter++ % pattern.length]) {
      yield n;
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
