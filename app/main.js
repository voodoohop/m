//require('source-map-support').install();
// require('traceur/bin/traceur-runtime');

// require('stack-displayname');
//var traceur = require("traceur");
//
// console.log("traceur",traceur);
//
// return;

// require('nodetime').profile({
//     accountKey: 'f6554c48283af492abfcd07d5ad45f584e1fa3e5',
//     appName: 'GenMusic'
//   });

// var console = require('better-console');


// throw "bye";


import "./patchConsoleLog";

var teoria = require("teoria");

import {m} from "./functionalMonads";

import {t} from "./time";

import {wu} from "./wu";


import {abletonReceiver, abletonSender} from "./oscAbleton";

import {isIterable,getIterator,clone} from "./utils";

import * as moduleManager from "./generatorModuleManager";

var _ = require("lodash");



var Bacon = require("baconjs");



// console.log('hello'.green);


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




// var seqTest2 = m.evt({name:"baconTest",duration:10}).loop().metro(60);
// BaconSequencer(abletonReceiver.time,seqTest2).log("seqTest");

var traceur = require("traceur");


var timeResetRequest = new Bacon.Bus();

var lastCodeResetNo = -1;


var decodedTime = abletonReceiver.time.diff(0,(a,b) => b-a).skip(1).zip(abletonReceiver.time.skip(1),(timeDiff,time) => {return {timeDiff,time}})
  .map((time) => time.timeDiff < -8 ? _.extend({reset:true},time) : time)
  .combine(timeResetRequest.debounceImmediate(500).toProperty(),
    function(time, codeReset) {
      if (lastCodeResetNo != codeReset) {
        console.log("RESET",time,codeReset);
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
var timeThatAccountsForTransportJumps2 = decodedTime.map((t) => {
  // return {time: t.time-t.firstTime, offset: t.firstTime}
  return {time: t.time, offset: 0}

  });


var timeThatAccountsForTransportJumps = timeThatAccountsForTransportJumps2;

var resetMessages = decodedTime.map((t) => t.reset).filter((t) => t).debounce(50);


timeThatAccountsForTransportJumps.throttle(1000).log("timeWithOffset");

resetMessages.log("RESET");

//timeThatAccountsForTransportJumps.log("time");

//var OSCSequencer = TomFRPSequencer(timeThatAccountsForTransportJumps);

// decodedTime.log("decodedTime");

setTimeout(() => timeResetRequest.push("first time resseeet"), 2000);

import webServer from "./webConnection";


import SequencePlayManager from "./sequencePlayManager";

var sequencePlayManager = SequencePlayManager(timeThatAccountsForTransportJumps.toEventStream(),resetMessages, webServer.sequenceFeedback);


timeThatAccountsForTransportJumps.throttle(1000).onValue(() => console.log("playing Sequences".bgMagenta.white,
 Object.keys(sequencePlayManager.playingSequences).map(seqPath => seqPath+":"+sequencePlayManager.playingSequences[seqPath].port)));

import {baconStorer, onCodeLoaded, storedSequences} from "./codeStore";




// console.log(new TWEEN.Tween({a:2}));
// throw "hey";

var Easer = require('functional-easing').Easer;









//timeThatAccountsForTransportJumps.toEventStream().skipDuplicates().log("beat");
webServer.beatFeedback(timeThatAccountsForTransportJumps.toEventStream().map((t) => Math.floor(t.time)).skipDuplicates());



var newClipSequences = abletonReceiver.clipNotes.map(function(v) {
  var notes = _.sortBy(v.notes, (n) => n.time);
  var seq=m.data(notes.map((n) => {
    return {
      pitch: n.pitch,
      duration: n.duration,
      velocity:n.velocity/127,
      time: n.time,
      color: "yellow"
    }
  }
)).loopLength(v.loopEnd-v.loopStart);
  //console.log("clipSeq",seq.pitch);
  console.log("created clip seq from clipNotes",{device:"abletonClip", name: v.name});

  var code = "export var "+v.name+" = "+seq.toString()+";"
  return {device:"abletonClip_"+v.name, code: code};
});

moduleManager.newSequenceCode.plug(newClipSequences);

moduleManager.newSequenceCode.plug(webServer.liveCode);

setTimeout(function() {
  console.log("CODE LOADED",storedSequences);
  for (var seq of storedSequences) {
    moduleManager.newSequenceCode.push({device: seq.device, code: seq.code});
  }
  // moduleManager.loadedSequences.onValue(v =>console.log("after load:",v.toJS()));
}, 100);

// var clipAndCodeSequences = new Bacon.Bus();

// clipAndCodeSequences.plug(compiledSequencesFromWeb);
// clipAndCodeSequences.plug(newClipSequences);



// var resetNo=0;
// clipAndCodeSequences.onValue(() => timeResetRequest.push(resetNo++));

var Immutable = require("immutable");

// moduleManager.processedSequences.log("thomashkickshouldbe".bold.bgYellow);
var generatorList = moduleManager.processedSequences
  .scan({},(prev,next) => {
    if (next.evaluatedError) {
      console.error("ERROR",next.evaluatedError);
    }

    prev[next.device+"/"+next.name] = {
      evaluatedError: next.evaluatedError,
      device:next.device,
      name: next.name,
      sourceCode: next.code,
      sequenceAsString: next.sequence && next.sequence.toString(),
      eventSample: next.evaluated ? next.evaluatedDetails[next.name].eventSample : [],
      evaluatedDetails: next.evaluated ? next.evaluatedDetails[next.name] : null
    };
    console.log("generated", next.device+"/"+next.name);
    return prev;
  })
  .map(_.values)
  .debounce(50);

baconStorer.plug(moduleManager.processedSequences);

generatorList.onValue((v) => {
  console.log("sending genList to ableton",v.map(v => v.device+"/"+v.name));
  // webServer.generatorUpdate(v);
  abletonSender.generatorUpdate(v);
});


moduleManager.evaluated.onValue(v => webServer.individualGeneratorUpdate(v));

// timeResetRequest.plug(moduleManager.processedSequences);
