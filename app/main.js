
//var traceur = require("traceur");
//
// console.log("traceur",traceur);
//
// return;

var teoria = require("teoria");

import {FunctionalMusic} from "./functionalMonads";

import {t} from "./time";

import {TomFRPSequencer} from "./tomSequencer";

import {AbletonReceiver, AbletonSender} from "./oscAbleton";

import {isIterable,getIterator} from "./utils";

var _ = require("underscore");



//import {OSCNotePlayer} from "./tomOSCInstrument";


var abletonSender = AbletonSender(8900);
var abletonReceiver = AbletonReceiver(8895);




var m = FunctionalMusic();

var traceur = require("traceur");
var compiled = traceur.compile("export var x= 5; export var y=m.evt().pitch(12).repeat(100).velocity([100,110]);",{modules:"register", generators:"parse", blockBinding:"parse"});

//console.log(exports);
console.log(compiled, typeof compiled);

var f = new Function("m","t","params", "teoria","return "+compiled);


var runLiveCode = function(m,t,teoria,code) {
  return eval(code);
}

var testNotes = f(m,t,null,teoria).y;

//for (let t of testNotes)
//  console.log(t);

//compiled();

//eval('import {liveCodeRun} from "./liveCodeRunner";')


//import {liveCodeRun} from "./liveCodeRunner";
var firstTime = 0;
abletonReceiver.time.onValue((time) => {
  if (firstTime == 0)
    firstTime = time - time % t.bars(16);
});
var lastTime=0;
abletonReceiver.time.onValue((v) => {
  if (v-lastTime < -1000) {
    console.log("reset",v,lastTime);
    firstTime = 0;
    lastTime = 0;
  } else
    lastTime = v;
}
)
abletonReceiver.codeChange.onValue(function() { firstTime = 0;});



var timeThatAccountsForTransportJumps = abletonReceiver.time.map((t) => t-firstTime)

var OSCSequencer = TomFRPSequencer(abletonSender, timeThatAccountsForTransportJumps);






var struct = m.evt().repeat(5).set({
  name:["slow","fast","slow","fast","slow"],
  duration:[t.bars(8),t.bars(4),t.bars(8),t.bars(16),t.bars(8)]
}).loop().timeFromDurations();

//var pitchBend = m.value((t,v) => 100).duration(t.bars(4)).loop().automatePlay("pitchBend");

// for (let s of pitchBend) {
//   console.log(s);
// }


var compileSequences(function(code) {
  var sequences = null
  var passedTests = false;
  try {
    var compiled = traceur.compile(code,{modules:"register", generators:"parse", blockBinding:"parse"});
    var f = new Function("m","t","params", "teoria","return "+compiled);
    sequences = f(m, t , abletonReceiver.param, teoria);
    console.log("testing if sequence emits events");
    for (let k of Object.keys(sequences)) {
      console.log("first event of sequence",k,getIterator(sequences[k]).next());
    }
    passedTests = true;
  } catch(e) {
    console.log("exception in live code",e);
  }

  //sequences = [sequences];
  //console.log("got new sequences",""+sequences);

  if (sequences == null || !passedTests)
    return false;
  return sequences;
});



var playing = {};
var generatorList = [];


import webServer from "./webServer";


var compiledSequences = webServer.liveCode.flatMap(function(code) {
  let sequences = compileSequences(code.code);
  if (!sequences)
    return Bacon.never();
  return {device: code.device, sequences: sequences};
});


var stopSequencers = function(sequencers) {
  for (let s of sequencers)
    if (s.sequencer && s.sequencer.stop)
      s.sequencer.stop();
}

compiledSequences.onValue(function(newSequences) {

  console.log("stopping sequencers of device", newSequences.device);
    if (playing[code.device]) {

    }


    playing[code.device] = Object.keys(sequences);

    for (let k of Object.keys(sequences)) {
      console.log("storing received sequence",k,""+sequences[k]);
      playing[code.device][k] = ""+sequences[k];
    }

    ///activeSequences[code.device] = sequences;
    //console.log(webServer.generatorUpdate);
    generatorList = [];
    for (let dev of Object.keys(activeSequences))
      for (let seq of Object.keys(activeSequences[dev]))
        generatorList.push({name:seq});
    console.log("sending gen list", generatorList);
    if (generatorList.length > 0) {
      webServer.generatorUpdate(generatorList);
      abletonSender.generatorUpdate(generatorList);
    }
    activeSequencers[code.device] = Object.keys(sequences).map((k) => OSCSequencer(sequences[k],k));
    console.log("activeSequencers",activeSequencers[code.device].length);

});


abletonReceiver.clipNotes.onValue(function(v) {
  console.log(v);
  if (!activeSequences["abletonClip"])
    activeSequences["abletonClip"] = {};
  var notes = _.sortBy(v.notes, (n) => n.time);
  var seq=m.evt().repeat(notes.length)
    .time(notes.map((n) => t.beats(n.time)))
    .pitch(notes.map((n) => n.pitch))
    .duration(notes.map((n) => t.beats(n.duration)))
    .velocity(notes.map((n) => n.velocity)).loopLength(t.beats(v.loopEnd-v.loopStart)).notePlay();

  activeSequences["abletonClip"][v.name] = ""+seq;
  generatorList = [];
  for (let dev of Object.keys(activeSequences))
    for (let seq of Object.keys(activeSequences[dev]))
      generatorList.push({name:seq});
  if (generatorList.length > 0) {
    webServer.generatorUpdate(generatorList);
    abletonSender.generatorUpdate(generatorList);
  }
  activeSequencers["abletonClip"] = [OSCSequencer(seq,v.name)];

//  for (let n of seq)
//    console.log(n);
});
