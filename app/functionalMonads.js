// TODO: add sanity checks and user understandable errors in every method



import {
  wu
}
from "./wu";

import {
  prettyToString, toStringObject, toStringDetailed, addFuncProp, /*clone, addObjectProp, addObjectProps, */ isIterable, getIterator, fixFloat
}
from "./utils";

import {
  immutableTom as immutableObj, addObjectProp, addObjectProps
}
from "./nodeProxiedImmutable";


var _ = require("lodash");

var memoize = require('memoizee/weak');

var SortedMap = require("collections/sorted-map");

var getIterators = (values) => values.map(getIterator);

var iteratorNextVal = (iterator) => iterator.next().value;

var iteratorNextValLooping = (value, iterator) => {
  var nextVal = iterator.next().value;
  return nextVal == undefined ? iteratorNextValLooping(value, getIterator(value)) : [nextVal, iterator];
};

var loopValue = function*(value) {
  var iterator = getIterator(value);
  while (true) {
    var nextVal = null;
    [iterator, nextVal] = iteratorNextValLooping(value, iterator);
    yield nextVal;
  }
}

// last argument is the child node
// var mergeDiscreteLooping = function*(propNames,tomValues,child) {
//   var loopers = tomValues.map(loopValue);
//   while (true) {
//     var nextValues = loopers.map(iteratorNextVal);
//     yield ;
//   }
// }
var loopGeneratorArgs = function(generatorProducer, args) {
  var node = args[args.length - 1];

}

// // TODO: work in progress
// TODO: change to one option param
var Immutable = require("immutable");
var cacheLimit = 500;
var cache_disabled = {disabled:true};

var createCache = function() {
  // var cache = new WeakMap();
  var caches = {};
  return function(key,disable) {
      if (disable) {
        caches[key] = cache_disabled;
        return undefined;
      }
      if (!caches[key])
        caches[key] = [];
      return caches[key];
    }
}


var createCacheWM = function() {
  var caches = new WeakMap();
  // var caches = {};
  return function(key) {
    // console.log(key);
    if (!caches.get(key))
      caches.set(key,[]);
    return caches.get(key);
  }
}

var cache = createCache();

var mGenerator = function(...args) {
  var origGenerator = args.shift();
  if (origGenerator.isTom)
    origGenerator[wu.iteratorSymbol] = MCache(origGenerator)[wu.iteratorSymbol];
  args.unshift(origGenerator);
  return mGeneratorUnCached(...args);
};

var doCache = function*(node) {
yield* getIterator(node);
return;

  var cacheKey = ""+node;
  // console.log("cacheKey",cacheKey);
  // if (!caches[cacheKey]) {
  //   // console.log("not yet cashed".bgBlue.white,cacheKey);
  //   caches[cacheKey] = [];
  // }

  var cached = cache(cacheKey);
  if (cached === cache_disabled) {
    yield* getIterator(node);
    return;
  }

  var count = 0;
  var iterator = null;
  while (true) {
    if (cached.length <= count || count > cacheLimit) {
      if (iterator == null) {
        node = MSkip(count, node);
        if (count > cacheLimit) {
          cache(cacheKey,true);
          // console.warn("cache full", node);
        }
        iterator = getIterator(node);
      }
      var n = iterator.next();
      if (n.done)
        break;
      if (count > cacheLimit) {
        yield n.value;
        yield* iterator;
        return;
        //continue;
      }
      cached.push(n.value);
    }
    yield cached[count++];
  }

}

;

var MCache = function(node) {
  //return node;

  var gen = mGeneratorUnCached(doCache, "cache");
  return gen(node);
}




var mGeneratorUnCached = function(generator, name, curryArgCount = 0, toStringOverride = null) {

  var getIterable = function(...args) {
    var res = Object.create(null);
    res.isTom = true;
    res.name = name;


    res[wu.iteratorSymbol] = () => generator(...args); //loopGeneratorArgs(generatorProducer, args);
    if (toStringOverride)
      res.toString = () => toStringOverride;
    else
      prettyToString(name, args, res);



    return res;
  };
  getIterable.producerName = name;
  //console.log("constructed node",generatorProducer,name);
  return curryArgCount > 0 ? wu.curryable(getIterable, curryArgCount) : getIterable;
}




var MData = mGenerator(function*(data) {


  if (isIterable(data)) {
    for (var d of data) {
      // console.log("data:",d);
      yield * getIterator(MData(d));
    }
  } else {
    var dataObj;
    if (data instanceof Object) {
      dataObj = immutableObj(data);


      if (isIterable(data))
        throw "Errrrroorr data shouldn't be iterable";


      //   //   //   //   //   // Object.defineProperty(dataObj,"toString", {enumerable:false,value:() => toStringDetailed(data)});


    } else {
      dataObj = immutableObj({
        type: "value",
        valueOf: () => data
      });
      console.log("created dataObj from value", dataObj);
    }
    yield dataObj;
  }
}, "data");


for (var e of MData([{
    pitch: 12,
    velocity: 0.5
  }, {
    bla: 2
  }]))
  console.log("datatest", e);


// TODO: remove this data generator nonsense? if it's not used later yes!
var MLoopData = mGenerator(function*(dataNode) {
  for (var data of dataNode) {
    var keys = Object.keys(data);

    if (keys.length == 0) {
      yield * getIterator(MLoop(dataNode));
      return;
    }

    for (var props of MZip(..._.values(data))) {
      //console.log(zippedProps);

      var resData = props.reduce(function(prev, val, i) {
        // console.log("reduceLoopData",prev,keys[i]+":"+val,i);
        return prev.set(keys[i], val);
      }, immutableObj());
      //resData._data = data;
      yield immutableObj(resData);
    }
  }
}, "loopData");


var MMergeZipped = mGenerator(function*(node) {
  for (var n of node)
    yield addObjectProps(n[0], n[1]);
}, "mergeZippedObjects");

var MMerge = mGenerator(function*(node1, node2) {
  var iterators = [node1, node2].map((node) => getIterator(node));
  while (true) {
    var next = iterators.map((i) => i.next().value);
    if (next[0] == undefined || next[1] == undefined)
      return;
    // console.log("addobprops",next[0], next[1]);
    yield addObjectProps(next[0], next[1]);
  }
}, "mergeObjects");

var MSet = mGenerator(function*(data, node) {
  yield * getIterator(MMerge(node, MLoopData(MData(data))));
}, "set");


// TODO: if we leave out the shallow check we automatically have a flatmap (Maybe??)
var MEvent = mGenerator(function*(data) {
  // here if data is iterable we are not looping individual properties
  if (isIterable(data)) {
    for (var e of MLoop(data))
      yield * getIterator(MData(e));
  } else
    yield * getIterator(MLoopData(MData(data)));
}, "evt");


var MProperty = mGenerator(function*(name, tomValue, children) {
  yield * getIterator(MSet({
    [name]: tomValue
  }, children));
}, "prop", 3);


var MWithNext = mGenerator(function*(node) {
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
}, "withNext")

var MGroupTime = mGenerator(function*(node) {
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
}, "groupByTime");

var MDuplicateRemover = mGenerator(function*(node) {


  for (var timeGrouped of MGroupTime(node)) {

    //console.log(_.groupBy(timeGrouped, "pitch"));
    for (var n of _.values(_.groupBy(timeGrouped.events, "pitch")))
      yield n[n.length - 1]; // last one... could be first too

  }

}, "removeDuplicateNotes");





var MNoteAutomate = mGenerator(function*(node) {
  // console.log(MToArray(MTake(2,node)));

  var notes = MFilter((n) => n.hasOwnProperty("pitch") && n.hasOwnProperty("velocity") && n.hasOwnProperty("time") && n.duration > 0, node);
  // console.log(MToArray(MTake(2,notes)));

  // console.log("notes", m.data(notes).take(5).toArray());
  yield * getIterator(MMapOp((n) => {
      // var automationHolder = n.hasOwnProperty("children") ? n.children : Object.create(null);
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
      // console.log("returing automation",{["automation_note"]: automation});
      return {
        ["automation_note"]: automation
      };
    },
    MDuplicateRemover(notes)));
}, "notePlay");


//TODO: figure out how to deal with automations of notes that overlap in duration. at the moment automations are overlapping
var MAutomate = mGenerator(function*(paramName, valGenerator, node) {
  yield * getIterator(MMapOp((n) => {
    // var automationHolder = n.hasOwnProperty("children") ? n.children : Object.create(null);
    var automation = m.data({
        type: "automation",
        evt: n,
        name: paramName,
        duration: n.duration
      }).loop()
      .metro(1 / 8)
      //  .log("automation")
      .takeWhile((a) => a.time < a.evt.duration)
      .set({
        automationVal: valGenerator
      });

    automation.automation = true;
    return {
      [paramName]: automation
    };
  }, node));
}, "automate");



var MProcessAutomations = mGenerator(function*(node) {
  // if (MToArray(MNoteAutomate(MTake(100,node))).length ==0)
  //   throw "no notes to automate";

  yield * getIterator(MCache(MFlattenAndSchedule(MSimpleMap((n) => {
    var merged = m.data([]);
    for (var automation of _.filter(_.values(n), (nVal) => Object(nVal).automation === true)) {
      // console.log("processing automation",automation.toArray());
      // throw "hey";
      merged = merged.merge(automation);
    }
    // console.log("mapping",n);
    // console.log("returning for flatten and schedule", {time:n.time, events: merged.delay(n.time).toArray()});
    return immutableObj({
      time: n.time,
      events: merged.delay(n.time)
    });
  }, MNoteAutomate(node)))));

}, "processAutomations");



// var MAutomatePlay = mGenerator(function*(propName,node) {
//   for (var v of node) {
//     var play = mGenerator(function* () {
//       //console.log("called playMethod of automateplay");
//
//
//       return baconTime
//         .skipWhile((t) => t.time < v.time)
//         .takeWhile((t) => v.duration ? t.time < v.time + v.duration : true)
//
//         .map((t) => {
//           //console.log("returning automateplay function",v[name]);
//           return function(instrument) {
//             //console.log("calling instrument", );
//             instrument.param(name, v[name](t.time,v), t.time + t.offset)
//           };
//         });
//     },"automationPlayer");
//     var playerObj = _.extend({},v.instrumentPlayers, {[name]: playMethod})
//     yield addObjectProp(v, "instrumentPlayers", playerObj);
//   }
// },"automatePlay",2);


var MSetValue = mGenerator(function*(value, child) {
  //  console.log("MSetValue", value, child);
  yield * MProperty("value", value, child);
}, "setValue", 2);



var MZip = mGenerator(function*(...nodes) {
  var loopedIterators = nodes.map((node) => getIterator(MLoop(node)));
  while (true) {
    var next = loopedIterators.map((i) => i.next().value);
    yield next;
  }
}, "zip");



var MLoop = mGenerator(function*(node) {
  // var cached = [];
  //
  // for (var e of node) {
  //   cached.push(e);
  // //  console.log("caching",e);
  // }
  // console.log("cached",cached);
  //
  // while (true) {
  //   yield* getIterator(cached);
  // }
  var cached = null;
  while (true) {
    //console.log(""+node);
    if (isIterable(node)) {
      // if (cached == null)
      //   cached = MCache(node);
      yield * getIterator(node);
    } else {
      // this is an optimization
      //console.warn("using mloop on non-iterable");
      yield node;

    }
  }
}, "loop");







var simpleMap = mGenerator(function*(mapFunc, node) {
  for (var n of node) {
    yield mapFunc(n);
  }
}, "simpleMap");



var MCombine = mGenerator(function*(combineNode, node) {
  var combineFunc = (me, previousOther, nextOther) => addObjectProps(me, {
    other: {
      previous: previousOther,
      next: nextOther
    }
  });
  var meMapped = simpleMap((n) => {
    return {
      time: n.time,
      me: n
    }
  }, node);
  var otherMapped = simpleMap((n) => {
    return {
      time: n.time,
      other: n
    }
  }, combineNode);
  var merged = MTimeOrderedMerge(meMapped, otherMapped);
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
}, "combine");

var MCombineMap = mGenerator(function*(combineFunc, combineNode, node) {
  // here we could add time diffs to parameters of combineFunc
  yield * getIterator(MMapOp((combined) => combineFunc(combined, combined.other), MCombine(combineNode, node)));
}, "combineMap", 3);


// var MCombine2 = mGenerator(function*(combineFunc, combineNode,node) {
//   var cIterator = getIterator(combineNode);
//   var cNext = [];
//   cNext.push(cIterator.next().value);
//   cNext.push(cIterator.next().value);
//   for (var n of node) {
//     // make it do a zip in case of no time value present ( later)
//     //if (cNext[0].time == undefined || cNext[1].time == undefined || n.time == undefined)
//     while (n.time > cNext[1].time) {
//       cNext.shift();
//       cNext.push(cIterator.next().value);
//     }
//
//     if (n.time <= cNext[1].time) {
//       if (n.time < cNext[0].time)
//         combineFunc({prev: undefined, next: cNext[0]});
//       else
//         if (n.time > cNext[0].time && n.time <= cNext[1].time)
//           combineFunc({prev:cNext[0], next: cNext[1]});
//     }
//
//   }
// },"combine",3);


var MCompose = mGenerator(function*(...nodes) {
  for (var node of nodes) {
    yield * getIterator(node);
  }
}, "compose");



var MLoopFixedLength = mGenerator(function*(loopLength, node) {
  var time = 0;
  while (true) {
    for (var n of node) {
      //  console.log("looplengtime",time);
      yield addObjectProp(n, "time", time + n.time);
    }
    time += loopLength;
  }
}, "loopLength", 2);

var convertToObject = (externalVal) => Object(externalVal);


var MSimpleMap = mGenerator(function*(mapFunc, node) {
  for (var e of node) {
    // console.log("mapping",e);
    yield mapFunc(e);
    // console.log("after mapping",e);
    //throw "hey";
  }
}, "simpleMap");


var MFlattenAndSchedule = mGenerator(function*(node) {
  var scheduled = new SortedMap();
  for (var n of node) {
    //console.log(n);
    if (n.hasOwnProperty("time")) {
      var scheduledNow = _.take(scheduled.entries(), (s) => s[0] < n.time);
      //console.log(scheduledNow);
      for (var scheduledEvents of scheduledNow) {

        for (var scheduledEvent of scheduledEvents[1]) {
          yield scheduledEvent;
        }
        scheduled.delete(scheduledEvents[0]);
      }
    } else
      console.error("Flatten and Schedule should work on events with time set");
    // if (!isIterable(n))
    //   n=[n];
    for (var nFlat of n.events) {
      //    console.log(nFlat);
      if (nFlat.hasOwnProperty("time")) {
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

  yield * getIterator(scheduled.values());
}, "flattenAndSchedule");


var MFlattenShallow = mGenerator(function*(node) {
  for (var n of node) {
    if (isIterable(n))
      yield * getIterator(n);
    else
      yield n;
  }
}, "flattenShallow");

var MMapOp = mGenerator(function*(mapFunc, node) {
  var mapped = MSimpleMap(mapFunc, node);

  var timed = false;

  var merged = MSimpleMap((e) => {
    var mappedRes = MData(e[1]);
    var orig = e[0];
    //console.log("merging",orig,"mappedRes", mappedRes);
    var res = {
      events: MSimpleMap((m) => addObjectProps(orig, m), mappedRes)
    };

    if (orig.hasOwnProperty("time")) {
      res.time = orig.time;
      timed = true;
    }

    return res;
  }, MZip(node, mapped));


  // for (var z of MTake(5,merged))
  //   console.log("merged",z);
  if (timed)
    yield * getIterator(MFlattenAndSchedule(merged));
  else
    yield * getIterator(MFlattenShallow(MSimpleMap((e) => e.events, merged)));
});


// somehow like sequencer
var MCombineLast = mGenerator(function*(combineFunc, combineNode, node) {
  var meIterator = getIterator(node);
  //var meNext = null;
  var last = meIterator.next().value;
  for (var c of combineNode) {
    var next = meIterator.next();
    if (next.time < c.time) {
      last = next;
      continue;
    }
    yield combineFunc(last, next, combineNode);

    last = next;
  }
});


var MFlatten = mGenerator(function*(node) {
  for (var e of node)
    if (isIterable(e))
      yield * getIterator(MFlatten(e))
    else
      yield e;
}, "flatten");


var MSubSequence = mGenerator(function*(subSequence, node) {
  // change yield* to iterating through subSequence
  yield * node;
  yield * subSequence;
}, "subSequence");

var MPluck = mGenerator(function*(propertyName, node) {
  yield * getIterator(MMapOp(e => e[propertyName], node))
}, "pluck", 2);

var MMapWithMemory = mGenerator(function*(initial, mapFunc, node) {
  var current = initial;
  yield * getIterator(MSet(convertToObject(current), MData(current)));
  for (var e of node) {
    current = mapFunc(current, e.value);
    //  console.log("current",current);
    yield * getIterator(MSet(convertToObject(current), MData(e)));
  }
}, "memoryMap", 3);


var MFilter = mGenerator(function*(filterFunc, node) {
  for (var e of node) {
    if (filterFunc(e))
      yield e;
  }
}, "filter", 2);



var MTakeWhile = mGenerator(function*(filterFunc, node) {
  for (var e of node) {
    if (!filterFunc(e))
      break;
    yield e;
  }
}, "takeWhile", 2);

var MSkipWhile = mGenerator(function*(skipFunc, node) {
  var skipNo = 0;
  for (var e of node) {
    if (skipFunc(e)) {
      continue;
    }
    yield e;
  }
}, "skipWhile", 2);


var MTake = mGenerator(function*(n, node) {
  var count = n;
  // console.log("mtake",node,n);
  for (var e of node) {
    yield e;
    if (--count <= 0)
      break;
  }
}, "take", 2);

var MTakeTime = mGenerator(function*(time, node) {
  var timeTaken = 0;
  for (var e of node) {
    yield e;
    timeTaken += e.event.duration;
    if (timeTaken >= time)
      break;
  }
}, "takeTime", 2);

var MRepeat = mGenerator(function*(n, node) {
  yield * getIterator(MTake(n, MLoop(node)));
}, "repeat", 2);

var MMapTime = mGenerator(function*(mapFunc, node) {
  for (var e of node) {
    yield e.set("time", mapFunc(e.time));
  }
}, "mapTime", 2);

var MTimeShift = mGenerator((amount, node) => MMapTime((time) => time + amount, node), "timeShift", 2);

var MReduce = mGenerator(function*(reduceFunc, startValue, node) {
  var current = startValue;
  for (var e of node) {
    current = reduceFunc(current, e);
  }
  yield current;
}, "reduce", 3);


var MDurationSum = mGenerator(MReduce((sum, timedEvent) => sum + timedEvent.duration, 0), "durationSum");


var MSkip = mGenerator(function*(n, node) {
  var count = n;
  for (var e of node) {
    if (count > 0)
      count--;
    else
      yield e;
  }
}, "skip", 2);

var MBranch = mGenerator(function*(condition, branchNode, elseNode, node) {
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
}, "branch", 4);



var MCount = mGenerator(function*(start = 0, stepSize = 1) {
  var c = start;
  while (true) {
    yield c;
    c += stepSize;
  }
}, "count");

var MSequenceEndMarker = mGenerator(function*() {
  yield * getIterator(MEvent({
    type: "endMarker"
  }))
}, "endMarker");

var MPitch = MProperty("pitch");
var MVelocity = MProperty("velocity");
var MTime = MProperty("time");
var MDuration = MProperty("duration");
var MEventCount = MProperty("count", MCount(0, 1));

var MDelay = mGenerator(function*(amount, node) {
  //console.log("delaying", node.toArray());
  if (!isIterable(amount))
    amount = [amount];

  for (var a of amount)
    yield * getIterator(MProperty("time", (n) => n.time + a, node));
}, "delay");


// maybe possible to modify event properties to have iterables with time somehow connecting to time of external events
var MExternalProperty = mGenerator(function*(propName, baconProp, initialVal, node) {
  var propVal = initialVal;
  // set up bacon listener
  baconProp.onValue(function(v) {
    console.log('new param val', propName, v);
    propVal = v;
  });

  var res = MProperty(propName, () => propVal, node);

  yield * getIterator(res);
}, "externalProperty", 3, "externalProp");


var MMetronome = mGenerator(function*(tickDuration, node) {
  yield * getIterator(MTime(MCount(0, tickDuration), MCompose(node, MSequenceEndMarker())));
}, "metro");

var MTimeFromDurations = mGenerator(function*(node) {
  var durationSumIterator = MMapWithMemory(0, (current, x) => x + current, MPluck("duration", node));
  yield * getIterator(MTime(durationSumIterator, MCompose(node, MSequenceEndMarker())));
}, "timeFromDurations");


var MDurationsFromTime = mGenerator(function*(node) {
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



var MTimeOrderedMerge = mGenerator(function*(mergeNode, node) {
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
}, "merge");



// safe and ordered NoteOnOffSequence generator which doesn't cause StackOverflows. not very functionally elegant;
var MNoteOnOffSequence = mGenerator(function*(node) {
  var iterator = getIterator(node);
  var next = null;
  var toInsert = {};
  while (next = iterator.next().value) {
    var ks = Object.keys(toInsert)
    for (var time of ks) {
      if (time < next.time) {
        yield * toInsert[time];
        delete toInsert[time];
      }
    }
    if (next.type == "note") {
      //console.log(next.set("type", "noteOn"));
      yield addObjectProp(next, "type", "noteOn");
      //console.log("next",next,next.time);
      var noteOffTime = next.time + next.duration - 1;

      var noteOff = MEvent({
        type: "noteOff",
        pitch: next.pitch,
        time: noteOffTime
      });
      //console.log("inserting noteOff", noteOff)
      toInsert[noteOffTime] = noteOff;
    } else {
      yield next;
    }
  }
}, "noteOnOff");

var MSwing = mGenerator(function*(timeGrid, amount, node) {
  yield * getIterator(MTime((e) => {
    // console.log("swing, mapping,",e);
    var diff = (e.time % (timeGrid * 2)) / timeGrid - 1;

    var dist = diff * diff;
    // console.log("swing", {time: fixFloat(e.time + amount * (1-dist) * timeGrid)});
    return fixFloat(e.time + amount * (1 - dist) * timeGrid);
  }, node))
}, "swing", 3);

var MQuantize = mGenerator(function*(timeGrid, amount, node) {
  yield * getIterator(MTime((e) => {
    // console.log("swing, mapping,",e);
    var diff = (e.time % (timeGrid * 2)) / timeGrid - 1;


    // console.log("swing", {time: fixFloat(e.time + amount * (1-dist) * timeGrid)});
    return fixFloat(e.time - amount * diff);
  }, node))
}, "quantize", 3);


var MLog = mGenerator(function*(name, node) {
  for (var e of node) {
    console.log(name, e);
    yield e;
  }
}, "log");

// var MPlay = function(sequencer,node) {
//   // console.log("playing, showing first five notes here",""+node);
//   // for (var e of node.take(5)) {
//   //   console.log("note",e);
//   // }
//   //console.log("converting to noteOnOff");
//   //var noteOnOff = node.toNoteOnOff();
//   //console.log("converted to noteOnOff");
//   console.log();
//   console.log();
//   console.log("playing, showing first five notes here");
//   console.log("--------------------------------------")
//   console.log(""+node);
//   console.log("--------------------------------------")
//   for (var e of node.take(4)) {
//     console.log("note",e);
//   }
//   var s = sequencer(node);
//
//   console.log("returning sequencer");
//   return s;
// }
//
//
// var nextLooping = wu.curryable(function(generator,iterator) {
//   var next = iterator.next();
//   var newIterator = iterator;
//   if (next.done) {
//     newIterator = getIterator(generator);
//     next = newIterator.next();
//     if (next.done)
//       console.error("it seems like we are trying to loop an iterator that doesn't yield any values");
//   }
//   return {newIterator, next}
// });




var MBjorklund = mGenerator(function*(steps, pulses, rotation, node) {
  var pattern = bjorklund(steps, pulses);
  var counter = rotation;
  console.log(pattern, steps, pulses);
  if (pattern.length == 0)
    pattern = [1];
  for (var n of node) {
    if (pattern[counter++ % pattern.length])
      yield n;
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
  for (var n of node)
    res.push(n.valueOf());
  return res;
}

var Rx = require("Rx");

var MToRx = (node) => Rx.Observable.from(node);

var wait=require('wait.for-es6');

var MfromRx = function*(rxObservable) {
  return {
    next: function*() {
      var nextVal = yield wait.for(rxObservable.onValue);
      return {value: nextVal, done: false};
    }
  }
}

var makeChainable = function(lib, name, funcToChain) {
  return function(...args) {
    var result = funcToChain(...args);
    _.each(lib, (origFunction, origFunctionName) => {
      result[origFunctionName] = function(...chainedArgs) {
        chainedArgs.push(result);
        var res = lib[origFunctionName](...chainedArgs);
        return res;
      };
    });
    return result;
  }
}

export var FunctionalMusic = function() {
  var lib = {};

  var addFunction = function(name, func, chaining = true) {
    func.prototype = _.clone(func.prototype);
    func.displayName = name;
    func.prototype.toString = () => name;

    lib[name] = chaining ? makeChainable(lib, name, func) : func;
  }

  addFunction("evt", MEvent);
  addFunction("data", MData);
  addFunction("prop", MProperty);

  // addFunction("value", MValue);

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

  //    addFunction("note",MNoteEvent);


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
  //addFunction("play",MPlay,false);
  addFunction("toArray", MToArray, false);
  addFunction("toRx", MToRx, false);
  addFunction("fromRx", MfromRx);


  addFunction("withNext", MWithNext);
  addFunction("cache", MCache);
  return lib;
}


export var m = FunctionalMusic();





// import {kick} from "abletonClip";
var kickGrid = 2;

export var kick = m.evt({
    pitch: [54, 60, 65],
    velocity: 0.9,
    duration: kickGrid - 0.5
  }).metro(kickGrid)
  .automate("pitchBend", n => Math.sin((n.time + n.evt.time) * Math.PI / 1) / 4 + 0.5);


export var tom = m.evt({
  pitch: 60,
  velocity: 0.7,
  duration: 0.1,
  color: "yellow"
}).metro(0.2).bjorklund(16, 9, 2);


var rxified = tom.take(100).toRx();

rxified.subscribe((v) => console.log("rx",v));

var mified = m.fromRx(rxified);

console.log(mified.toArray());

export var hat = m.evt({
  pitch: [48, 60],
  velocity: [0.3, 0.5, 0.7, 0.3, 0.6],
  duration: 0.1
}).metro(0.25).bjorklund(4, 3, 0).swing(1 / 4, 0.15);

export var kick_real = m.evt({
  pitch: 60,
  velocity: [0.9, 0.7, 0.8],
  duration: 0.1
}).metro(1);
// .automate("pitchBend", n => Math.sin((n.time+n.evt.time)*Math.PI/8)/4+0.5)

var microtime = require("microtime");


var profilerDataStore = [];
var profileSamples = 2000;

var startTime = microtime.nowDouble();


for (var n of kick.toPlayable().take(profileSamples))
  var x = ({
    time: n.time,
    pitch: n.pitch,
    veloctiy: n.velocity,
    type: n.type
  });

var timeTaken = microtime.nowDouble() - startTime;
console.log("time:", timeTaken);

for (var n of tom.toPlayable().take(profileSamples))
  var x = ({
    time: n.time,
    pitch: n.pitch,
    veloctiy: n.velocity
  });

// startTime = microtime.nowDouble();
timeTaken = microtime.nowDouble() - startTime;
console.log("time:", timeTaken);

for (var n of tom.toPlayable().take(profileSamples)) {
  var x = ({
    time: n.time,
    pitch: n.pitch,
    veloctiy: n.velocity,
    type: n.type
  });
  x = ({
    time: n.time,
    pitch: n.pitch,
    veloctiy: n.velocity,
    type: n.type
  });
  x = ({
    time: n.time,
    pitch: n.pitch,
    veloctiy: n.velocity,
    type: n.type
  });
}

timeTaken = microtime.nowDouble() - startTime;
console.log("time2:", timeTaken);


for (var n of tom.toPlayable().take(profileSamples))
  var x= ({
    time: n.time,
    pitch: n.pitch,
    veloctiy: n.velocity
  });

timeTaken = microtime.nowDouble() - startTime;
console.log("time:", timeTaken);




// throw "bye";


// var test1 = m.evt({pitch:12}).metro(10).automate("param1",(n) => 0.5).delay(10);
// var test2 = m.evt({pitch:3, velocity:0.3}).metro(4);
// console.log(test1);
// throw "bye";


// for (var m of test1)
//   console.log("test1",m.time, m);
// for (var m of test2)
//   console.log("test2",m.time, m);

// var combined = test2.combineMap((c,other) =>  {
//   var nextTime = null;
//   var prevTime = null;
//   //console.log("other",other);
//
//   if (c.other.previous)
//     prevTime = combine.previous.time;
//   if (combine.next)
//     nextTime = combine.next.time;
//   //console.log(me, combine,"prevTime:",prevTime,"nextTime",nextTime);
//
//   return {pitch: nextTime == me.time ? 5: 24}
// }, test1);

// console.log(test2.combine(test1).take(5));
// for (var c of combined.take(5))
//   console.log("combined",c);

// var test1 =m.evt({pitch:20, velocity:[30,40], duration:0.5}).metro(0.25).duration([0.3,0.7])
// .swing(0.25,0.1)
// .map((n) => {return {velocity: n.velocity/100}})
// .notePlay();

// throw "just terminating";
//
// var simpleMelody = m.evt().set({pitch:[62,65,70,75], velocity:[0.8,0.6,0.5], duration:1.5}).metro(2)
// // .duration((n) => {
// // //  console.log("durationmap",n);
// //   return n.duration*200
// // })
// .duration((n) => {
// //  console.log("durationmap",n);
//   return n.duration;
// })
// .swing(1,0.3)
// .automate("pitchBend",(n) => 1.5);


// console.log(simpleMelody);



// throw "Byebye";
//
//
// for (var e of simpleMelody.skip(10).toPlayable().take(5)) {
//   console.log("eventNoteOnOffYeeee",e);
// }


// console.log("getting combined");
// for (var m of combined) {
//
//   console.log("combined",m);
// }
//

//var count = MTime(MCount(0,1),MLoop(MEvent({pitch:[12,13,100]})));
//for (var c of count)
//  console.log(c);
//var automator = m.value([40,50]).set({duration:t.bars(1)}).timeFromDurations().automatePlay("pitchBend");
//for (var a of automator) {console.log(a);}
//return;
//
//
// //console.log("iteratorSymbol",wu.iteratorSymbol);
//
// var val = MValue(40);
// for (var e of val) {
//   console.log("VAAL",e);
// }
// //return;
//
// var valtest = m.value().loop().setValue([20,30,40,50]).take(5);
// console.log("VAAAAAL3",[for (e of valtest) e]);
//
//
// var valToNoteTest3 = m.note({pitch:12, duration:10,time:0})
//   .loop()
//   .set({pitch:[12,13]})
//   .set({velocity:[11,50,60]})
//   .set({time: m.count(0,20), bla: (n) => {console.log("inSet",n); return Math.random()}})
//   .set({test2: m.value().loop().setValue([20,30,40,50])}).toNoteOnOff().take(5);
// var valToNoteTest = m.note({pitch:12,duration:20}).loop().set({velocity: m.value().loop().setValue([20,30,40,50])}).take(5);
// console.log("VAAAAALToNOOOTE3",[for (e of valToNoteTest) e]);
//
// //return;
//
// var seqNewNew = m.note().loop().pitch([12,13,14]).set({bla:"test"}).take(5);
// console.log(""+seqNewNew);
//
// var tsts = m.note().loop().pitch([12,13,14]).set({bla:"test"}).take(5);
//
// console.log("tststs",""+tsts);
//
// for (var n of tsts) {
//   console.log("tsts",n);
// }
//
// //return;
//
// //var seqNewNew2 = m.note().repeat(10).pitch([3,4,5]).velocity(100).duration([20,10,10]).eventCount().timeFromDurations().filter((e) => e.count % 5 != 0);

//
//
// var pitchMap=wu.curryable(function(pitches,node) {
//   return node.pitch(n => n.pitch+pitches[Math.floor(n.time/4%pitches.length)]);
// });
//
// var tPitchMap=pitchMap([2,0,3,4,-12,-5,12,12]);
// //var tPitchMap=pitchMap([0]);
//
// export var marimba2=tPitchMap(m.evt({pitch:50,duration:[0.2,0.1,0.3],color:"red",velocity:[0.9,0.7]})
// .metro(1)
// //.bjorklund(8,6,0)
// .automate("param1", n => (n.time+n.evt.time) % 4 /4)
// .automate("pitchBend", n => (n.time+n.evt.time) % 64 /64));
//
//
// var c=0;
// for (let e of marimba2.toPlayable()) {
//   c++;
//   if (c %500==0)
//     console.log("m2",c,e);
//     if (c > 5000)
//       break;
//
//     }
//
// c=0;
//     for (let e of marimba2.toPlayable()) {
//       c++;
//       if (c %500==0)
//         console.log("m2",c,e);
//         if (c > 5000)
//           break;
//         }
//         c=0;
//         for (let e of marimba2.toPlayable()) {
//           c++;
//           if (c %500==0)
//             console.log("m2",c,e);
//             if (c > 5000)
//               break;
//             }
//
//             c=0;
//             for (let e of marimba2.toPlayable()) {
//               c++;
//               if (c %500==0)
//                 console.log("m2",c,e);
//                 if (c > 5000)
//                   break;
//                 }
//                 c=0;
