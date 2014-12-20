

var _ = require("lodash");

import {addGenerator,m} from "./baseLib";

var SortedMap = require("collections/sorted-map");

import {
  prettyToString, toStringObject, toStringDetailed, addFuncProp, /*clone, addObjectProp, addObjectProps, */ isIterable, getIterator, fixFloat
}
from "../lib/utils";

import {
  immutableTom as immutableObj, addObjectProp, addObjectProps
} from "../immutable/nodeProxiedImmutable";





addGenerator(function* withNext(node) {
  var me = null;
  for (var n of node) {
    if (me == null) {
      me = n;
      continue;
    }
    // console.log({me:me,next:n, time:me.time });
    yield addObjectProps(me, {
      next: n
    });
    me = n;
  }
});



addGenerator(function* groupByTime(node) {
  var currentTime = -1;
  var grouped = [];
  //console.log(""+node);
  for (var n of node) {
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
});

addGenerator(function* removeDuplicateNotes(node) {
  for (var timeGrouped of m(node).groupByTime()) {
    for (var n of _.values(_.groupBy(timeGrouped.events, "pitch")))
      yield n[n.length - 1]; // last one... could be first too
  }
});



addGenerator(function* notePlay(node) {
  // console.log(MToArray(MTake(2,node)));

  var notes = m(node).filter((n) => n.hasOwnProperty("pitch") && n.hasOwnProperty("velocity") && n.hasOwnProperty("time") && n.duration > 0);
  // console.log(MToArray(MTake(2,notes)));
  // console.log("notes", m.data(notes).take(5).toArray());
  yield * getIterator(
    m(notes)
    .removeDuplicateNotes().map((n) => {
      // var automationHolder = n.hasOwnProperty("children") ? n.children : Object.create(null);
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
      // automation.automation = true;
      // console.log("returing automation",{["automation_note"]: automation});
      return {
        automation_note: automation
      };
    }));
});


//TODO: figure out how to deal with automations of notes that overlap in duration. at the moment automations are overlapping
addGenerator(function* automate(paramName, valGenerator, node) {
  yield * getIterator(m(node).map((n) => {
    var automation = m().data({
        type: "automation",
        evt: n,
        name: paramName,
        duration: n.duration
      }).loop()
      .metro(1/8)
      //  .log("automation")
      .takeWhile((a) => a.time < a.evt.duration)
      .set({
        automationVal: valGenerator
      });
    // automation.automation = true;
    return {
      ["automation_"+paramName]: automation
    };
  }));
});



addGenerator(function* toPlayable(node) {

  yield * getIterator(
    m(node).notePlay().simpleMap(n => {
      var merged = new SortedMap();

      // console.log("toPlayable",n,n.time);

      for (var automationKey of _.filter(Object.keys(n),k => k.indexOf("automation_") == 0)) {
        var automation = n[automationKey];
        // console.log("processing automation",automation.toArray());
        // throw "hey";
          // console.log(automation);

          for (let a of automation) {
            var newA = a.set("time", n.time+a.time);
            if (!merged.has(newA.time))
              merged.set(newA.time,[newA])
            else
              merged.get(newA.time).push(newA);
          }
      }
        // console.log("mergeeed",_.flatten(merged.values()));
      // console.log("mapping",n);
      // console.log("returning for flatten and schedule", {time:n.time, events: merged.delay(n.time).toArray()});
      return {
        time: n.time,
        events: _.flatten(merged.values())
      };
    }).flattenAndSchedule()
    // .cache()
  );

});



addGenerator(function* setValue(value, child) {
  yield* child.prop("value", value, child);
});



addGenerator(function* combine(combineNode, node) {
  var combineFunc = (me, previousOther, nextOther) => addObjectProps(me, {
    other: {
      previous: previousOther,
      next: nextOther
    }
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
  //   console.log("mergedSeq", test);
  var previousOther = null;
  var nextOther = null;
  var meWaitingForNextOther = [];
  for (var m of merged) {
    // console.log("combining",m);
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
      //  console.log("looplengtime",time);
      yield addObjectProp(n, "time", time + n.time);
    }
    time += loopLength;
  }
});



var convertToObject = (externalVal) => immutableObj(externalVal);


addGenerator(function* flattenAndSchedule(node) {
  var scheduled = new SortedMap();
  var passedInStartTime = null;
  for (var n of node) {
    // console.log("flattenAndSchedule node",n);
    if (n.hasOwnProperty("time")) {
      var scheduledNow = _.take(scheduled.entries(), (s) => s[0] < n.time);
      for (var scheduledEvents of scheduledNow) {

        for (var scheduledEvent of scheduledEvents[1]) {
          // passedInStartTime =
            yield scheduledEvent;
        }

        scheduled.delete(scheduledEvents[0]);
      }
    } else
      console.error("Flatten and Schedule should work on events with time set");

    for (var nFlat of n.events) {
      if (nFlat.hasOwnProperty("time")) {
        // if (passedInStartTime && nFlat.time < passedInStartTime)
        //   continue;
        if (nFlat.time <= n.time)
          yield nFlat;
        else {
          if (!scheduled.has(nFlat.time)) {
            // console.log("nflat",nFlat, nFlat.time);
            scheduled.set(nFlat.time, []);
          }
          scheduled.get(nFlat.time).push(nFlat);
        }
      } else
        console.error("Flatten and Schedule should work on events with time set");
    }
  }
  // console.log("yielding scheduled.values",scheduled.values());
  yield * getIterator(scheduled.values());
});





addGenerator(function* map(mapFunc, node) {

  // console.log("simpleMapping",node);
  var mapped = m(node).simpleMap(mapFunc);

  var timed = false;

  var merged = mapped.zip(node).simpleMap(function(e) {
    // console.log("eeee",e);
    var mappedRes = m().data(e[1]);
    var orig = e[0];
    // console.log("merging",orig,"mappedRes", mappedRes);
    var res = {
      events: mappedRes.simpleMap(m => addObjectProps(orig, m))
    };

    if (orig.hasOwnProperty("time")) {
      res.time = orig.time;
      timed = true;
    };

    return immutableObj(res);
  });


  // for (var z of MTake(5,merged))
  //   console.log("merged",z);
  if (timed)
    yield * getIterator(merged.flattenAndSchedule());
  else
    yield * getIterator(merged.simpleMap((e) => e.events).flattenShallow());
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
    current = mapFunc(current, e.value);
    //  console.log("current",current);
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

addGenerator(function* delay(amount, node) {
  yield* getIterator(node.time((time) => time + amount));
});


addGenerator(function* durationSum(node) {
  yield* getIterator(node.reduce((sum, timedEvent) => sum + timedEvent.duration, 0));
});




addGenerator( function* branch(condition, branchNode, elseNode, node) {
  for (var e of node) {
    //console.log("branching", condition, e);
    var branchTo = (condition(e) ? branchNode : elseNode);

    //console.log(e,branchTo.set);
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
  // console.log("nnnode",node);
  yield* getIterator(m(node).prop("count",m().count(0,1)))
});
// addGenerator(propSetter("count", MCount(0, 1));

addGenerator(function* delay(amount, node) {
  //console.log("delaying", node.toArray());
  if (!isIterable(amount))
    amount = [amount];

  for (var a of amount)
    yield * getIterator(m(node).prop("time", n => n.time + a));
});


// maybe possible to modify event properties to have iterables with time somehow connecting to time of external events
addGenerator(function* externalProp(propName, baconProp, initialVal, node) {
  var propVal = initialVal;
  // set up bacon listener
  baconProp.onValue(function(v) {
    console.log('new param val', propName, v);
    propVal = v;
  });
  var res = node.prop(propName, () => propVal);
  yield * getIterator(res);
}, {toStringOverride:"externalProp"});

var endMarker = m().endMarker();

addGenerator(function* metro(tickDuration, node) {
  yield* getIterator(m(node).set({time:m().count(0,tickDuration)}));
});


addGenerator(function* timeFromDurations(node) {
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
  var nodeIterator = getIterator(node);
  var nextNode = nodeIterator.next().value;
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
  yield * getIterator(node.time((e) => {
    // console.log("swing, mapping,",e);
    var diff = (e.time % (timeGrid * 2)) / timeGrid - 1;

    var dist = diff * diff;
    // console.log("swing", {time: fixFloat(e.time + amount * (1-dist) * timeGrid)});
    return fixFloat(e.time + amount * (1 - dist) * timeGrid);
  } ))
});

addGenerator(function* quantize(timeGrid, amount, node) {
  yield * getIterator( node.time((e) => {
    // console.log("swing, mapping,",e);
    var diff = (e.time % (timeGrid * 2)) / timeGrid - 1;


    // console.log("swing", {time: fixFloat(e.time + amount * (1-dist) * timeGrid)});
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
