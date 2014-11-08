
//var traceur = require("traceur");
//
// console.log("traceur",traceur);
//
// return;

// require('nodetime').profile({
//     accountKey: 'f6554c48283af492abfcd07d5ad45f584e1fa3e5',
//     appName: 'GenMusic'
//   });

var teoria = require("teoria");

import {FunctionalMusic} from "./functionalMonads";

import {t} from "./time";



import {AbletonReceiver, AbletonSender} from "./oscAbleton";

import {isIterable,getIterator,clone} from "./utils";

var _ = require("lodash");

var Bacon = require("baconjs");



var m = FunctionalMusic();




//
// var kick=m.evt({pitch:60,duration:(1/4), velocity:100}).loop().metro((1)).notePlay();
//
// var shaker=m.evt().set({pitch:60,duration:(1/12)}).loop()
// .pitch([40,41,39,41,43,39,40,39]).velocity([70,20,50,4,60,40,50,30])
// //.repeat(8)
//
//  .metro((1/4))
// //.map((n)=> n)
//  .swing((0.25),0.1)
//  // .velocity((v) => v.time % t.bars(4) > (0.3) ? v.velocity : 0)
//  // .velocity((v) => v.time % t.bars(8) < t.bars(7.5) ? v.velocity : 10)
//  // .velocity((v) => _.contains([0,1,2,4,5,7],Math.floor((v.time % (2))/(0.25))) ? v.velocity : 0)
// // .delay((1/2))
//
// .notePlay();
//
// var shaker2=m.evt({ duration:(0.1)}).loop().metro((0.25)).bjorklund(4,3,3).pitch([37,37,38]).velocity([0.5,0.7,0.6,0.5,0.6]).swing(0.25,0.1)
// .combineMap((k,me) => {
//
//     return (k.next.time == me.time) ? {velocity: 0.3, time: (n) => n.time-0.05} : me;
// },
// kick)
// .notePlay();
//
// console.time();
// for (let e of shaker.take(10000))
// //  console.log(e);
// ;
// //for (let e of shaker2.take(2000));
//
// console.timeEnd();
//
// return;

var abletonSender = AbletonSender(8919);
var abletonReceiver = AbletonReceiver(8895);


// var seqTest2 = m.evt({name:"baconTest",duration:10}).loop().metro(60);
// BaconSequencer(abletonReceiver.time,seqTest2).log("seqTest");

var traceur = require("traceur");


var liveCodeReset = new Bacon.Bus();

var lastCodeResetNo = -1;


var decodedTime = abletonReceiver.time.diff(0,(a,b) => b-a).skip(1).zip(abletonReceiver.time.skip(1),(timeDiff,time) => {return {timeDiff,time}})
  .map((time) => time.timeDiff < -8 ? _.extend({reset:true},time) : time)
  .combine(liveCodeReset.debounceImmediate(500).toProperty(),
    function(time, codeReset) {
      //console.log(time,codeReset);
      if (lastCodeResetNo != codeReset) {
        lastCodeResetNo = codeReset;
        return _.extend({reset:true},time);
      }
      return time;
    }
  )
  .scan({},(prev,time) => {
    var newTime = _.clone(time);
    if (prev.firstTime > 0 && !time.reset)
      newTime.firstTime = prev.firstTime;
    else
      newTime.firstTime = time.time-time.time % t.bars(4);
    return newTime;
  });




// TODO: could move all this time stuff to sequencePlayManager or another module
// TODO: timeThatAccountsForTransportJumps should be a stream of functions that can convert time to global ableton time automatically
// TODO: make every stream have its own starttime
var timeThatAccountsForTransportJumps2 = decodedTime.map((t) => {return {time: t.time-t.firstTime, offset: t.firstTime}});




var timeThatAccountsForTransportJumps = timeThatAccountsForTransportJumps2;

var resetMessages = decodedTime.map((t) => t.reset).filter((t) => t).debounce(50);


timeThatAccountsForTransportJumps.throttle(1000).log("timeWithOffset");

resetMessages.log("RESET");

//timeThatAccountsForTransportJumps.log("time");

//var OSCSequencer = TomFRPSequencer(timeThatAccountsForTransportJumps);

//decodedTime.log("decodedTime");





import SequencePlayManager from "./sequencePlayManager";
var sequencePlayManager = SequencePlayManager(abletonReceiver.sequencePlayRequests, abletonSender, timeThatAccountsForTransportJumps.toEventStream(),resetMessages);


var seqLoader = {
  get: (m) => _.mapValues(sequencePlayManager.playingSequences, (p) => p.sequence)
}


var compileSequences = function(code) {
  var sequences = null
  var passedTests = false;
  try {
    var compiled = traceur.compile(code,{modules:"register", generators:"parse", blockBinding:"parse"});
    var f = new Function("m","t","params", "teoria","_","System","clone","return "+compiled);
    console.log("compiled",compiled);
    sequences = f(m, t , abletonReceiver.param, teoria,_, seqLoader, clone);
    console.log("testing if sequence emits events");
    for (let k of Object.keys(sequences)) {
      console.log("first event of sequence",k,getIterator(sequences[k]).next());
    }
    passedTests = true;
  } catch(e) {
    console.log("exception in live code",e.stack);
  }

  //sequences = [sequences];
  //console.log("got new sequences",""+sequences);

  if (sequences == null || !passedTests)
    return false;
  return sequences;
};



import webServer from "./webServer";

webServer.beatFeedback(timeThatAccountsForTransportJumps.map((t) => Math.floor(t)).skipDuplicates());

var compiledSequences = webServer.liveCode.flatMap(function(code) {
  let sequences = compileSequences(code.code);
  if (!sequences)
    return Bacon.never();
  var sequencesArray = _.pairs(sequences).map((s) => {return {device:code.device, name:s[0], sequence:s[1]}});
  //console.log("seqArray",sequencesArray);
  return Bacon.fromArray(sequencesArray);
});


var clipSequences = abletonReceiver.clipNotes.map(function(v) {
  var notes = _.sortBy(v.notes, (n) => n.time);
  var seq=m.evt(notes.map((n) => {
    return {
      pitch: n.pitch,
      duration: n.duration,
      velocity:n.velocity/127,
      time: n.time
    }
  }
)).loopLength(v.loopEnd-v.loopStart).notePlay();
  //console.log("clipSeq",seq.pitch);
  //console.log("created clip seq from clipNotes",{device:"abletonClip", name: v.name, sequence: seq});
  return {device:"abletonClip", name: v.name, sequence: seq};
});



//var withSequencers = compiledSequences.map((s) => _.extend({sequencer: Sequencer(s.sequence,s.name)},s));



var clipAndCodeSequences = compiledSequences.merge(clipSequences)

sequencePlayManager.newSequence.plug(clipAndCodeSequences);

var resetNo=0;
clipAndCodeSequences.onValue(() => liveCodeReset.push(resetNo++));

var Immutable = require("immutable");

var generatorList = clipAndCodeSequences.scan(new Immutable.Set(),(prev,next) =>  prev.add(next.name)).debounce(300);

generatorList.onValue((v) => {
  webServer.generatorUpdate(v.toArray());
  abletonSender.generatorUpdate(v.toArray());
});
