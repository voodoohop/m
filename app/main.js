
//var traceur = require("traceur");
//
// console.log("traceur",traceur);
//
// return;

var teoria = require("teoria");

import {FunctionalMusic} from "./functionalMonads";

import {t} from "./time";

import {TomFRPSequencer, BaconSequencer} from "./tomSequencer";

import {AbletonReceiver, AbletonSender} from "./oscAbleton";

import {isIterable,getIterator,clone} from "./utils";

var _ = require("lodash");

var Bacon = require("baconjs");



var abletonSender = AbletonSender(8901  );
var abletonReceiver = AbletonReceiver(8895);


var m = FunctionalMusic();



// var seqTest2 = m.evt({name:"baconTest",duration:10}).loop().metro(60);
// BaconSequencer(abletonReceiver.time,seqTest2).log("seqTest");

var traceur = require("traceur");




var decodedTime = abletonReceiver.time.diff(0,(a,b) => b-a).skip(1).zip(abletonReceiver.time.skip(1),(timeDiff,time) => {return {timeDiff,time}})
  .map((time) => time.timeDiff < -2 ? _.extend({reset:true},time) : time)
  .scan({},(prev,time) => {
    var newTime = _.clone(time);
    if (prev.firstTime > 0 && !time.reset)
      newTime.firstTime = prev.firstTime;
    else
      newTime.firstTime = time.time-time.time % t.bars(4);
    return newTime;
  });


var timeThatAccountsForTransportJumps = decodedTime.map((t) => t.time-t.firstTime);

var resetMessages = decodedTime.map((t) => t.reset).filter((t) => t).debounce(50);

resetMessages.log("RESET");

//timeThatAccountsForTransportJumps.log("time");

//var OSCSequencer = TomFRPSequencer(timeThatAccountsForTransportJumps);

var Sequencer = BaconSequencer(timeThatAccountsForTransportJumps.toEventStream());


var seqLoader = {
  get: (m) => _.mapValues(playingSequences, (p) => p.sequence)
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
  var seq=m.evt().repeat(notes.length)
    .time(notes.map((n) => n.time))
    .pitch(notes.map((n) => n.pitch))
    .duration(notes.map((n) => n.duration))
    .velocity(notes.map((n) => n.velocity/127)).loopLength(v.loopEnd-v.loopStart).notePlay();
  //console.log("clipSeq",seq.pitch);
  //console.log("created clip seq from clipNotes",{device:"abletonClip", name: v.name, sequence: seq});
  return {device:"abletonClip", name: v.name, sequence: seq};
});



var playSequencer = (sequencer,inst) => sequencer.onValue((playFunc) => playFunc(inst));

var playingSequences = {};

var instrumentPlayer = function(seq) {
  if (playingSequences[seq.name])
    playingSequences[seq.name].stop();
  console.log("creating instrument for",seq.name);
  var seqInst = abletonSender.instrument(seq.name);

  playingSequences[seq.name] = {stop: playSequencer(Sequencer(seq.sequence,seq.name),seqInst), sequence: seq.sequence};
  resetMessages.onValue(() => {
     playingSequences[seq.name].stop();
     playingSequences[seq.name] = {stop: playSequencer(Sequencer(seq.sequence,seq.name),seqInst), sequence: seq.sequence};
  });
}


//var withSequencers = compiledSequences.map((s) => _.extend({sequencer: Sequencer(s.sequence,s.name)},s));

var clipAndCodeSequences = compiledSequences.merge(clipSequences)

clipAndCodeSequences.onValue(instrumentPlayer);

var Immutable = require("immutable");

var generatorList = clipAndCodeSequences.scan(new Immutable.Set(),(prev,next) =>  prev.add(next.name)).debounce(300);

generatorList.onValue((v) => {
  webServer.generatorUpdate(v.toArray());
  abletonSender.generatorUpdate(v.toArray());
});
