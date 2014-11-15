

// TODO: add sanity checks and user understandable errors in every method

import {wu} from "./wu";

import {prettyToString,toStringObject,addFuncProp, clone, addObjectProp, addObjectProps, isIterable, getIterator,fixFloat, cloneableEmptyObject} from "./utils";

var _ = require("lodash");

var SortedMap = require("collections/sorted-map");

var getIterators = (values) => values.map(getIterator);

var iteratorNextVal = (iterator) => iterator.next().value;

var iteratorNextValLooping = (value, iterator) => {
  var nextVal = iterator.next().value;
  return nextVal == undefined ? iteratorNextValLooping(value,getIterator(value)) : [nextVal, iterator];
};

var loopValue = function*(value) {
  var iterator = getIterator(value);
  while (true) {
    let nextVal = null;
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
  var node = args[args.length-1];

}

// // TODO: work in progress
// TODO: change to one option param
var mGenerator = function(generatorProducer, name, curryArgCount = 0, toStringOverride=null) {

  var genProducer = function(...args) {
    let res = Object.create(null);
    res.isTom = true;
    res.name = name;


    res[wu.iteratorSymbol] = () => generatorProducer(...args);//loopGeneratorArgs(generatorProducer, args);
    if (toStringOverride)
      res.toString = () => toStringOverride;
    else
      prettyToString(name,args,res);

    return res;
  };
  //console.log("constructed node",generatorProducer,name);
  return curryArgCount > 0 ? wu.curryable(genProducer, curryArgCount) : genProducer;
}





var MData = mGenerator(function*(data) {
  if (isIterable(data))
    for (let d of data)
      yield* getIterator(MData(d));
  else
    yield Object(data);
},"data");


for (let e of MData([{pitch:12, velocity:0.5},{bla:2}]))
  console.log("datatest",e);


// TODO: remove this data generator nonsense? if it's not used later yes!
var MLoopData = mGenerator( function*(dataNode) {
  for (let data of dataNode) {
    var keys = Object.keys(data);
    if (keys.length == 0) {
      yield n;
      continue;
    }

    for (let props of MZip(..._.values(data))) {
      //console.log(zippedProps);
      var resData = {};
      props.forEach(function(val,i) {
        val = Object(val);
        resData[keys[i]] = val;
      });
      //resData._data = data;
      yield resData;
    }
  }
},"loopData");

// iterable property stuff

// var MEvalFunctors = mGenerator(function*(node) {
//   var evalMapFunc = function(n) {
//     var res={};
//     for (let key of Object.keys(n)) {
//       let value = n[key];
//       let newValue = value;
//       if (typeof value === "function" && value.length <= 1) {
//         console.log("running functor ",value,"on",n);
//          newValue = Object(value(n));
//          newValue.functor = value;
//       }
//       res[key] = newValue;
//     }
//     return res;
//   }
//   yield* getIterator(MSimpleMap(evalMapFunc,node));
// },"evalFunctors");

var MMergeZipped = mGenerator(function*(node) {
  for (let n of node)
    yield addObjectProps(n[0], n[1]);
},"mergeZippedObjects");

var MMerge = mGenerator(function*(node1,node2) {
    var iterators = [node1,node2].map((node) => getIterator(node));
    while (true) {
      var next = iterators.map((i) => i.next().value);
      yield addObjectProps(next[0], next[1]);
    }
},"mergeObjects");

var MSet = mGenerator(function*(data, node) {
 yield* getIterator(MMerge(node, MLoopData(MData(data))));
},"set");


// TODO: if we leave out the shallow check we automatically have a flatmap (Maybe??)
var MEvent = mGenerator(function*(data) {
  yield* getIterator(MLoopData(MData(data)));
},"evt");


var MProperty = mGenerator(function* (name,tomValue, children) {
  yield* getIterator(MSet({[name]:tomValue},children));
},"property", 3);




var MGroupTime = mGenerator(function*(node) {
  var currentTime=-1;
  var grouped=[];
  for (let n of node) {
    if (n.time > currentTime) {
      if (grouped.length > 0) {
        yield {events: grouped, time:currentTime};
        grouped = [];
      }
      currentTime = fixFloat(n.time);
    }
    grouped.push(n);
  }
},"groupTime");

var MDuplicateRemover = mGenerator(function*(node) {
  for (let timeGrouped of MGroupTime(node)) {
    //console.log(_.groupBy(timeGrouped, "pitch"));
    for (let n of _.values(_.groupBy(timeGrouped.events, "pitch")))
      yield n[n.length-1]; // last one... could be first too

  }
},"duplicateRemover");

// TODO: temporarily disabled teoria.... make another function something like static property/func??
var MNotePlayer = mGenerator(function*(node) {
    for (let me of MDuplicateRemover(node)) {
      let playMethod = function(baconTime) {
        var noteOnTime = me.time.valueOf();
        var noteOffTime = me.time.valueOf() + me.duration;
        //console.log("noteOnTIme",me.time,baconTime);
        var baconNoteOn = baconTime.skipWhile((t) => t.time < noteOnTime).take(1).map((t) => {
          return function(instrument) {instrument.noteOn(me.pitch.valueOf(), me.velocity.valueOf(), noteOnTime+t.offset)};
        });
        var baconNoteOff = baconTime.skipWhile((t) => t.time < noteOffTime).take(1).map((t) => {
          return function(instrument) {instrument.noteOff(me.pitch.valueOf(), noteOffTime+t.offset)};
        });
        return baconNoteOn.merge(baconNoteOff);
      }
      yield addObjectProp(me, "play", playMethod, false);
    }
},"note");

var MNote = mGenerator(function*(node) {

},"note");





var MAutomatePlay = mGenerator(function*(name,node) {
  for (let v of node) {
    let playMethod = function(baconTime) {
      return baconTime
        .skipWhile((t) => t < v.time+startOffset)
        .takeWhile((t) => v.duration ? t < v.time+startOffset + v.duration : true)
        .throttle(10)
        .map((t) => {
          return function(instrument) {instrument.param(name, v.value(t,v), t.time + t.offset)};
        });
    };
    yield addObjectProp(v, "play",playMethod);
  }
},"automatePlay",2);


var MSetValue = mGenerator(function* (value, child) {
//  console.log("MSetValue", value, child);
  yield* MProperty("value", value, child);
},"setValue", 2);



var MZip = mGenerator(function*(...nodes) {
  var loopedIterators = nodes.map((node) => getIterator(MLoop(node)));
  while (true) {
    var next = loopedIterators.map((i) => i.next().value);
    yield next;
  }
},"zip");



var MLoop = mGenerator(function*(node) {
  // var cached = [];
  //
  // for (let e of node) {
  //   cached.push(e);
  // //  console.log("caching",e);
  // }
  // console.log("cached",cached);
  //
  // while (true) {
  //   yield* getIterator(cached);
  // }
  while (true) {
    //console.log(""+node);
    if (isIterable(node))
      yield* getIterator(node);
    else  {
      // this is an optimization
      //console.warn("using mloop on non-iterable");
      yield node;

    }
  }
},"loop");







var simpleMap = mGenerator(function* (mapFunc, node) {
  for (let n of node) {
    yield mapFunc(n);
  }
},"simpleMap");

var MCombine = mGenerator(function*(combineNode,node) {
    var meMapped = simpleMap((n) => {return {time: n.time, me: n}}, node);
    var otherMapped = simpleMap((n) =>{return {time: n.time, other: n}}, combineNode);
    var merged = MTimeOrderedMerge(meMapped,otherMapped);
    // for (let test of merged)
    //   console.log("mergedSeq", test);
    var previousOther = null;
    var nextOther = null;
    var meWaitingForNextOther = [];
    for  (let m of merged) {
      // console.log("combining",m);
      if (m.hasOwnProperty("me"))
        meWaitingForNextOther.push(m.me);
      if (m.hasOwnProperty("other") && meWaitingForNextOther.length > 0) {
        previousOther = nextOther;
        nextOther = m.other;
        for (let me of meWaitingForNextOther) {
          console.error("using combine but mmapop is not respecting the mapObject property yet");
          yield {previous: previousOther, next: nextOther, me: me, mapObject: me, time: me.time};
        }
        meWaitingForNextOther = [];
      }
    }
    for (let me of meWaitingForNextOther) {
      yield {previous: nextOther, next: null,me: me, mapObject: me,  time: me.time};
    }
},"combine",2);

var MCombineMap = mGenerator(function*(combineFunc,combineNode,node) {
  // here we could add time diffs to parameters of combineFunc
  yield* getIterator(MMapOp((combined) => combineFunc(combined, combined.me), MCombine(combineNode,node)));
},"combineMap",3);


// var MCombine2 = mGenerator(function*(combineFunc, combineNode,node) {
//   var cIterator = getIterator(combineNode);
//   var cNext = [];
//   cNext.push(cIterator.next().value);
//   cNext.push(cIterator.next().value);
//   for (let n of node) {
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
    for (let node of nodes) {
      yield* getIterator(node);
    }
},"compose");



let MLoopFixedLength = mGenerator(function*(loopLength,node) {
  var time=0;
  while (true) {
    for (let n of node) {
      yield addObjectProp(n, "time", time+n.time);
    }
    time+=loopLength;
  }
}, "loopFixedLength",2);

let convertToObject = (externalVal) => Object(externalVal);


var MSimpleMap = mGenerator(function*(mapFunc,node) {
  for (let e of node) {
    // console.log("mapping",e);
    yield mapFunc(e);
    // console.log("after mapping",e);
    //throw "hey";
  }
},"simpleMap");


var MFlattenAndSchedule = mGenerator(function* (node) {
  var scheduled = new SortedMap();
  for (let n of node) {
    //console.log(n);
    if (n.hasOwnProperty("time")) {
      var scheduledNow = _.take(scheduled.entries(), (s) => s[0] < n.time);
      //console.log(scheduledNow);
      for (let scheduledEvents of scheduledNow) {

        for (let scheduledEvent of scheduledEvents[1]) {
          yield scheduledEvent;
        }
        scheduled.delete(scheduledEvents[0]);
      }
    }
    else
      console.error("Flatten and Schedule should work on events with time set");
    // if (!isIterable(n))
    //   n=[n];
    for (let nFlat of n.events) {
  //    console.log(nFlat);
      if (nFlat.hasOwnProperty("time")) {
        if (!scheduled.has(nFlat.time))
          scheduled.set(nFlat.time, []);
        scheduled.get(nFlat.time).push(nFlat);
      }
      else
        console.error("Flatten and Schedule should work on events with time set");
    }
  }

  yield* getIterator(scheduled.values());
},"flattenAndSchedule");



var MMapOp = mGenerator(function*(mapFunc,node) {
  var mapped = MSimpleMap(mapFunc,node);


  var merged = MSimpleMap((e) => {
    var mappedRes = isIterable(e[1]) ? e[1] : [e[1]];
    var orig = e[0];
    //console.log("merging",orig,"mappedRes", mappedRes);
    return {time: orig.time, events: MSimpleMap((m) => addObjectProps(orig,m), mappedRes)};
  }, MZip(node, mapped));

  // for (let z of MTake(5,merged))
  //   console.log("merged",z);

  yield* getIterator(MFlattenAndSchedule(merged));
});


// somehow like sequencer
var MCombineLast = mGenerator(function*(combineFunc, combineNode, node) {
  var meIterator = getIterator(node);
  //var meNext = null;
  var last = meIterator.next().value;
  for (let c of combineNode) {
    var next = meIterator.next();
    if (next.time < c.time) {
      last = next;
      continue;
    }
    yield combineFunc(last,next,combineNode);

    last = next;
  }
});


var MFlatten = mGenerator(function*(node) {
  for (let e of node)
    if (isIterable(e))
      yield* getIterator(MFlatten(e))
    else
      yield e;
},"flatten");


var MSubSequence = mGenerator(function*(subSequence,node) {
    // change yield* to iterating through subSequence
    yield* node;
    yield* subSequence;
},"subSequence");

var MPluck = mGenerator(function*(propertyName, node) { yield* getIterator(MMapOp(e => e[propertyName], node))},"pluck",2);

var MMapWithMemory = mGenerator(function*(initial, mapFunc,node) {
  let current = initial;
  yield* getIterator(MSet(convertToObject(current), MEvent(current)));
  for (let e of node) {
    current = mapFunc(current, e.value);
  //  console.log("current",current);
    yield* getIterator(MSet(convertToObject(current), MEvent(e)));
  }
},"memoryMap",3);


var MFilter = mGenerator(function*(filterFunc,node) {
  for (let e of node) {
    if (filterFunc(e))
      yield e;
  }
},"filter",2);



var MTakeWhile = mGenerator(function*(filterFunc,node) {
  for (let e of node) {
    if (!filterFunc(e))
      break;
    yield e;
  }
},"takeWhile",2);

var MSkipWhile = mGenerator(function*(skipFunc,node) {
  let skipNo=0;
  for (let e of node) {
    if (skipFunc(e)) {
      continue;
    }
    yield e;
  }
},"skipWhile",2);


var MTake = mGenerator(function*(n,node) {
    let count = n;
    //console.log("mtake",node);
    for (let e of node) {
      yield e;
      if (--count <= 0)
        break;
    }
},"take",2);

var MTakeTime = mGenerator(function*(time,node) {
    var timeTaken=0;
    for (let e of node) {
      yield e;
      timeTaken += e.event.duration;
      if (timeTaken>=time)
        break;
    }
},"takeTime",2);

var MRepeat = mGenerator(function*(n, node) { yield* getIterator(MTake(n, MLoop(node)));},"repeat",2);

var MMapTime = mGenerator(function*(mapFunc,node) {
  for (let e of node) {
    yield e.set("time", mapFunc(e.time));
  }
},"mapTime",2);

var MTimeShift = mGenerator((amount,node) => MMapTime((time) => time + amount, node),"timeShift",2);

var MReduce = mGenerator(function*(reduceFunc, startValue,node) {
    let current = startValue;
    for (let e of node) {
      current = reduceFunc(_.clone(current), e);
    }
    yield _.clone(current);
},"reduce", 3);


var MDurationSum = mGenerator(MReduce((sum, timedEvent) => sum + timedEvent.duration, 0),"durationSum");


var MSkip = mGenerator(function*(n,node) {
  let count = n;
  for (let e of node) {
    if (count > 0)
      count--;
    else
      yield e;
  }
}, "skip",2);

var MBranch = mGenerator(function*(condition, branchNode, elseNode, node) {
    for (let e of node) {
      //console.log("branching", condition, e);
      let branchTo = (condition(e) ? branchNode:elseNode);

      console.log(e,branchTo.set);
      yield* getIterator(branchTo.takeWhile((n) => n.time < e.duration).set({time:(n)=>n.time+e.time}));
      //yield* getIterator(branchTo
      //  .takeWhile((n) => n.time < e.duration)
      //  .set((n) => {time: n.time+e.time})
      //);
    }
},"branch",4);



var MCount = mGenerator(function*(start=0,stepSize=1) {
    let c = start;
    while(true) {
      yield c;
      c += stepSize;
    }
},"count");

var MSequenceEndMarker = mGenerator(function* () { yield* getIterator(MEvent({type: "endMarker" }))},"endMarker");

var MPitch = MProperty("pitch");
var MVelocity = MProperty("velocity");
var MTime = MProperty("time");
var MDuration = MProperty("duration");
var MEventCount = MProperty("count", MCount(0,1));

var MDelay = mGenerator(function*(amount,node) {
  if (!isIterable(amount))
    amount = [amount];

  for (let a of amount)
    yield* getIterator(MProperty("time", (n) => n.time + a, node));
},"delay");


// maybe possible to modify event properties to have iterables with time somehow connecting to time of external events
var MExternalProperty = mGenerator(function*(propName, baconProp, initialVal, node) {
  let propVal = initialVal;
  // set up bacon listener
  baconProp.onValue(function(v) { console.log('new param val',propName,v); propVal = v; });

  let res = MProperty(propName, () => propVal, node);

  yield* getIterator(res);
},"externalProperty",3,"externalProp");


var MMetronome = mGenerator(function*(tickDuration,node) { yield* getIterator(MTime( MCount(0, tickDuration), MCompose(node,MSequenceEndMarker())));},"metronome");

var MTimeFromDurations = mGenerator(function*(node)   {
  let durationSumIterator = MMapWithMemory(0, (current, x) => x + current, MPluck("duration", node));
  yield* getIterator(MTime(durationSumIterator, MCompose(node, MSequenceEndMarker())));
},"timeFromDurations");



// var MInsertWhen = MDirectOp(
//   function* (nodeIterator, insertCondition, insertNode) {
//     for (let e of nodeIterator) {
//       if (insertCondition(e))
//         yield* insertNode;
//       yield e;
//     }
//   }
// )


// before insert, could make explicit
//var MInsertOnce = (insertCondition, insertNode, node) => MCompose(MTakeWhile(e => !insertCondition(e),node), insertNode, MSkipWhile(e => !insertCondition(e),node));



var MTimeOrderedMerge = mGenerator(function*(mergeNode,node) {
    let nodeIterator=getIterator(node);
    let nextNode = nodeIterator.next().value;
    for (let mergeEvent of mergeNode) {
      while (nextNode != undefined && nextNode.time < mergeEvent.time) {
        yield nextNode;
        nextNode = nodeIterator.next().value;
      }
      yield mergeEvent;
    }
    if (nextNode != undefined)
      yield nextNode;
    yield* nodeIterator;
}, "merge");



// safe and ordered NoteOnOffSequence generator which doesn't cause StackOverflows. not very functionally elegant;
var MNoteOnOffSequence = mGenerator(function*(node) {
    let iterator = getIterator(node);
    let next = null;
    let toInsert = {};
    while (next = iterator.next().value) {
      let ks = Object.keys(toInsert)
      for (let time of ks) {
        if (time < next.time) {
          yield* toInsert[time];
          delete toInsert[time];
        }
      }
      if (next.type == "note") {
        //console.log(next.set("type", "noteOn"));
        yield addObjectProp(next,"type", "noteOn");
        //console.log("next",next,next.time);
        let noteOffTime = next.time + next.duration-1;

        let noteOff =  MEvent({type:"noteOff", pitch: next.pitch, time: noteOffTime});
        //console.log("inserting noteOff", noteOff)
        toInsert[noteOffTime] = noteOff;
      } else {
        yield next;
      }
    }
},"noteOnOff");

var MSwing = mGenerator(function*(timeGrid, amount, node)  {
  yield* getIterator(MMapOp((e) => {
    // console.log("swing, mapping,",e);
    let diff = (e.time % (timeGrid*2))/timeGrid-1;

    let dist = diff*diff;
    // console.log("swing", {time: fixFloat(e.time + amount * (1-dist) * timeGrid)});
    return {time: fixFloat(e.time + amount * (1-dist) * timeGrid)};
  }
,node))},"swing",3);

var MLog = mGenerator(function*(node){
  for (let e of node) {
    console.log(e);
  }
},"log");

// var MPlay = function(sequencer,node) {
//   // console.log("playing, showing first five notes here",""+node);
//   // for (let e of node.take(5)) {
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
//   for (let e of node.take(4)) {
//     console.log("note",e);
//   }
//   let s = sequencer(node);
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




var MBjorklund = mGenerator(function*(steps, pulses, rotation,node) {
  var pattern = bjorklund(steps,pulses);
  var counter =rotation;
  console.log(pattern,steps,pulses);
  if (pattern.length==0)
    pattern=[1];
  for (let n of node) {
    if (pattern[counter++ % pattern.length])
      yield n;
  }
},"bjorklund",4);

function bjorklund(steps, pulses) {

	steps = Math.round(steps);
	pulses = Math.round(pulses);

	if(pulses > steps || pulses == 0 || steps == 0) {
		return new Array();
	}

	var pattern = [],
	   counts = [],
	   remainders = [],
	   divisor = steps - pulses;
	remainders.push(pulses);
	var level = 0;

	while(true) {
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
			for (var i=0; i < counts[level]; i++) {
				build(level-1);
			}
			if (remainders[level] != 0) {
	        	build(level-2);
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



var makeChainable = function (lib,name,funcToChain) {
  return function(...args) {
    let result = funcToChain(...args);
    _.each(lib,(origFunction, origFunctionName) => {
        result[origFunctionName] = function(...chainedArgs) {
          let res = lib[origFunctionName](...chainedArgs,result);
          return res;
        };
    });
    return result;
  }
}

export var FunctionalMusic = function() {
    var lib = {isMusicFunction:true};

    var addFunction = function(name,func, chaining=true) {
      func.prototype = _.clone(func.prototype);
      func.prototype.toString = () => name;

      lib[name] = chaining ? makeChainable(lib,name,func) : func;
    }

    addFunction("evt",MEvent);
    addFunction("prop", MProperty);

    // addFunction("value", MValue);

    addFunction("count",MCount);
    addFunction("repeat", MRepeat);
    addFunction("compose", MCompose);
    addFunction("loop", MLoop);
    addFunction("take",MTake);
    addFunction("filter",MFilter);
    addFunction("skip",MSkip);
    addFunction("flatten", MFlatten);
    addFunction("map",MMapOp);
    addFunction("mapWithMemory",MMapWithMemory);
    addFunction("branch",MBranch);
    addFunction("takeWhile", MTakeWhile);
    addFunction("skipWhile", MSkipWhile);
    addFunction("loopLength", MLoopFixedLength);

//    addFunction("note",MNoteEvent);


    addFunction("takeTime",MTakeTime);
    addFunction("mapTime",MMapTime);
    addFunction("pitch",MPitch);
    addFunction("velocity",MVelocity);
    addFunction("duration",MDuration);
    addFunction("eventCount",MEventCount);
    addFunction("externalProperty", MExternalProperty);
    addFunction("merge",MTimeOrderedMerge);
    addFunction("delay",MDelay);
    addFunction("time",MTime);

    addFunction("set", MSet);
    addFunction("setValue", MSetValue);


    addFunction("groupByTime", MGroupTime);
    addFunction("subSequence",MSubSequence);


    addFunction("pluck",MPluck);

    addFunction("swing",MSwing);
    addFunction("toNoteOnOff", MNoteOnOffSequence);
    addFunction("metro",MMetronome);
    addFunction("timeFromDurations", MTimeFromDurations);
    addFunction("bjorklund",MBjorklund);

    addFunction("notePlay",MNotePlayer);
    addFunction("automatePlay",MAutomatePlay);
    addFunction("log",MLog, false);

    addFunction("combine",MCombine);
    addFunction("combineMap",MCombineMap);
    //addFunction("play",MPlay,false);

    return lib;
}


let m = FunctionalMusic();



var test1 = m.evt({pitch:12}).loop().metro(10).delay(10).take(2);
var test2 = m.evt({pitch:3, velocity:0.3}).loop().metro(4).take(10);

// for (let m of test1)
//   console.log("test1",m.time, m);
// for (let m of test2)
//   console.log("test2",m.time, m);

var combined = test2.combineMap((combine,me) =>  {
  var nextTime = null;
  var prevTime = null;
  if (combine.previous)
    prevTime = combine.previous.time;
  if (combine.next)
    nextTime = combine.next.time;
  //console.log(me, combine,"prevTime:",prevTime,"nextTime",nextTime);

  return {pitch: nextTime == me.time ? 5: 24}
}, test1);

// var test1 =m.evt({pitch:20, velocity:[30,40], duration:0.5}).metro(0.25).duration([0.3,0.7])
// .swing(0.25,0.1)
// .map((n) => {return {velocity: n.velocity/100}})
// .notePlay();


var simpleMelody = m.evt({pitch:[62,65,70,75], velocity:[0.8,0.6,0.5], duration:[0.2,0.1,0.7,0.2,0.5]}).metro(0.5)
.duration((n) => {
//  console.log("durationmap",n);
  return n.duration*200
})
.duration((n) => {
//  console.log("durationmap",n);
  return n.duration*2
})
.swing(1,0.3)
.notePlay();

for (let e of simpleMelody.take(5)) {
  console.log("event",e);
}

//
// throw "just terminating";



// console.log("getting combined");
// for (let m of combined) {
//
//   console.log("combined",m);
// }
//

//var count = MTime(MCount(0,1),MLoop(MEvent({pitch:[12,13,100]})));
//for (let c of count)
//  console.log(c);
//var automator = m.value([40,50]).set({duration:t.bars(1)}).timeFromDurations().automatePlay("pitchBend");
//for (let a of automator) {console.log(a);}
//return;
//
//
// //console.log("iteratorSymbol",wu.iteratorSymbol);
//
// var val = MValue(40);
// for (let e of val) {
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
// for (let n of tsts) {
//   console.log("tsts",n);
// }
//
// //return;
//
// //var seqNewNew2 = m.note().repeat(10).pitch([3,4,5]).velocity(100).duration([20,10,10]).eventCount().timeFromDurations().filter((e) => e.count % 5 != 0);
