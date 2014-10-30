

// TODO: add sanity checks and user understandable errors in every method

import {wu} from "./wu";

import {prettyToString,toStringObject,addFuncProp, clone, addObjectProp, isIterable, getIterator} from "./utils";

var _ = require("underscore");


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




var mGenerator = function(generatorProducer, name, curryArgCount = 0, toStringOverride=null) {
//  let name = "unnamed";
  var genProducer = function(...args) {
    let res = Object.create(null);
    res.isTom = true;
    res.name = name;
    res[wu.iteratorSymbol] = () => generatorProducer(...args);
    if (toStringOverride)
      res.toString = () => toStringOverride;
    else
      prettyToString(name,args,res);
    return res;
  };
  //console.log("constructed node",generatorProducer,name);
  return curryArgCount > 0 ? wu.curryable(genProducer, curryArgCount) : genProducer;
}

var addPropLooping = function*(propName, tomValue, children) {
  //var loopedVal = loopValue(tomValue);
  var iterator = getIterator(tomValue);
  for (let e of children) {
//    console.log("nextvallooping",iteratorNextValLooping);
  // TODO: strange that destructuring assignment throwing error
    let res= iteratorNextValLooping(tomValue, iterator);
//    console.log("res",res);
    iterator = res[1];
    let nextVal=res[0];
//    console.log(res, "nextvallooping2");
    if (typeof nextVal == "object" && nextVal.type === "value")
        nextVal = nextVal.value;
    yield addObjectProp(e, propName, nextVal);
  }
}


var MProperty = mGenerator(function* (name,tomValue, children) {
  //console.log("mprop", name, ""+tomValue,isIterable(tomValu);
  if (tomValue == undefined)
    throw new TypeError("MProperty: tomValue undefined, child:"+children+" name:"+name);
  if (name == undefined)
    throw new TypeError("MProperty: name undefined, child:"+children+" value:"+tomValue);

  if (isIterable(tomValue)) {
    yield* addPropLooping(name,tomValue,children);
  } else {
    for (let e of children) {
      //console.log(name, typeof tomValue, tomValue);
      if (typeof tomValue === "function" && tomValue.length <=1) {
        yield addFuncProp(e, name, () => tomValue(e));
      }
      else
        yield addObjectProp(e,name,tomValue);
    }
  }
},"property", 3);


var MValue = mGenerator(function* (value) {
  if (isIterable(value)) {
    for (let v of value) {
//      console.log("creating new MEvent for value",v);
      yield* getIterator(MEvent({type:"value", value: value}));
    }
  }
  else {
//    console.log("creating new MEvent for value",value);
    yield* getIterator(MEvent({type:"value", value: value || 0}));
  }
},"value");


// TODO: temporarily disabled teoria.... make another function something like static property/func??
var MNotePlayer = mGenerator(function*(node) {

  for (let me of node) {
    let playMethod = function(baconTime, baconInstrument) {
      var noteOnTime = me.time;
      var noteOffTime = me.time + me.duration;
      console.log("noteOnTIme",me.time);
      var timeOfNoteOn = baconTime.skipWhile((t) => t < noteOnTime).take(1)
      console.log("registered note off listener to ",noteOffTime)
      var timeOfNoteOff = baconTime.skipWhile((t) => t < noteOffTime).take(1);
      //console.log("me time:",me.time,"duration",me.duration)
      //console.log("waiting for noteOn");
      timeOfNoteOn.onValue(function(currentTime) {
        console.log("got to time of noteOn", me.time, currentTime)
        instrument.noteOn(seqName, me.pitch, me.velocity, me.time);
      });
      //console.log("waiting for noteOff")
      timeOfNoteOff.onValue(function(currentTime) {
        console.log("got to time of noteOff");
        instrument.noteOff(seqName,me.pitch, currentTime);
      });

    }
    yield addObjectProp(me, "play",playMethod);
  }

//  yield* MEventProperties(initial,MEvent({type:"note", play:playMethod}));
  //,teoria: (n) => teoria.note.fromKey(n.pitch)
},"note");


var MAutomatePlay = mGenerator(function*(name,node) {
  for (let v of node) {
    let playMethod = function(seqName, baconTime, instrument) {
    //  console.log(me.value);
      //console.log("VAAALUE",v.duration,v.duration ? t < v.time + v.duration : true);
      var stop = baconTime.skipWhile((t) => t < v.time).takeWhile((t) => v.duration ? t < v.time + v.duration : true)
      .throttle(10).onValue((t) => instrument.param(seqName,name, v.value(t,v),t))
    //  throw new Exception("aaaaa");
      return stop;
    };
    yield addObjectProp(v, "play",playMethod);
  }
},"automatePlay",2);

var MSetValue = mGenerator(function* (value, child) {
//  console.log("MSetValue", value, child);
  yield* MProperty("value", value, child);
},"setValue", 2);

var MEvent = mGenerator(function*(props=false) {
  if (props)
    yield* getIterator(MEventProperties(props,MEvent()));
  else
    yield Object.freeze({});
},"evt");



// not iterating over values so we can pass in functions?
var MEventProperties = mGenerator(function*(props,node) {
    var imProps = clone(props);
    var keys = Object.keys(imProps);
    if (keys.length == 0) {
      yield* getIterator(node);
    }
    else {
      var key = keys[0];
      var val = imProps[key];
      delete imProps[key];
      yield* getIterator(MEventProperties(imProps, MProperty(key, val, node)));
    }
},"set",2);



var MCompose = mGenerator(function*(...nodes) {
    for (let node of nodes) {
      yield* getIterator(node);
    }
},"compose");

var MLoop = mGenerator(function*(node) {
  while (true) {
    //console.log(""+node);
    yield* getIterator(node);
  }
},"loop");


let MLoopFixedLength = mGenerator(function*(loopLength,node) {
  var time=0;
  while (true) {
    for (let n of node) {
      yield addObjectProp(n, "time", time+n.time);
    }
    time+=loopLength;
  }
}, "loopFixedLength",2);

let convertToObject = function(externalVal) {
  if (typeof externalVal != "object")
    return {value: externalVal, type:"value"};
  else
    return externalVal;
}

var MMapOp = mGenerator(function*(mapFunc,node) {

  //console.log("mapnode",node[wu.iteratorSymbol]());
  for (let e of node) {
//    console.log("convertToObject",convertToObject(mapFunc(e)));
    let mapped = mapFunc(e);
    if (!isIterable(mapped))
      mapped = [mapped];
    for (let res of mapped)
      yield* getIterator(MEventProperties(convertToObject(res),MEvent(e)));
  }

},"map",2);



var MFlatten = mGenerator(function*(node) {
  for (let e of node)
    if (isIterable(e))
      yield* MFlatten(e)
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
  yield* getIterator(MEventProperties(convertToObject(current), MEvent(current)));
  for (let e of node) {
    current = mapFunc(current, e.value);
  //  console.log("current",current);
    yield* getIterator(MEventProperties(convertToObject(current), MEvent(e)));
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
  yield* getIterator(MProperty("time", (n) => n.time+amount, node));
},"delay");


// maybe possible to modify event properties to have iterables with time somehow connecting to time of external events
var MExternalProperty = mGenerator(function*(propName, baconProp, initialVal, node) {
  let propVal = initialVal;
  // set up bacon listener
  baconProp.onValue(function(v) { console.log('new param val',propName,v); propVal = v; });

  let res = MProperty(propName, () => propVal, node);

  yield* res;
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
      while (nextNode && nextNode.time < mergeEvent.time) {
        yield nextNode;
        nextNode = nodeIterator.next().value;
      }
      yield mergeEvent;
    }
    yield*nodeIterator;
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
    //console.log("swing, mapping,",e);
    let diff = (e.time % (timeGrid*2))/timeGrid-1;

    let dist = diff*diff;
    //console.log(diff,dist,amount * (dist) * timeGrid);
    return {time: e.time + amount * (1-dist) * timeGrid};
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

    addFunction("value", MValue);

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

    addFunction("set", MEventProperties);
    addFunction("setValue", MSetValue);



    addFunction("subSequence",MSubSequence);


    addFunction("pluck",MPluck);

    addFunction("swing",MSwing);
    addFunction("toNoteOnOff", MNoteOnOffSequence);
    addFunction("metro",MMetronome);
    addFunction("timeFromDurations", MTimeFromDurations);

    addFunction("notePlay",MNotePlayer);
    addFunction("automatePlay",MAutomatePlay, false);
    addFunction("log",MLog, false);
    //addFunction("play",MPlay,false);

    return lib;
}


let m = FunctionalMusic();



var count = MTime(MCount(0,1),MLoop(MEvent({pitch:[12,13,100]})));
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
