
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


var abletonSender = AbletonSender(8893);
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



var OSCSequencer = TomFRPSequencer(abletonSender, abletonReceiver.time);






var struct = m.evt().repeat(5).set({
  name:["slow","fast","slow","fast","slow"],
  duration:[t.bars(8),t.bars(4),t.bars(8),t.bars(16),t.bars(8)]
}).loop().timeFromDurations();

//var pitchBend = m.value((t,v) => 100).duration(t.bars(4)).loop().automatePlay("pitchBend");

// for (let s of pitchBend) {
//   console.log(s);
// }

var chordProg = "E7 F#7 E7 F#7 Cmaj9 A7 D9 Gmaj9 Cmaj9 F#7 b5 B7".split(" ");
var chordProgMap = (n) => {
  var barNo = Math.floor(n.time / t.bars(1));
  var currentChord = teoria.chord(chordProg[barNo % chordProg.length]);
  var chordNotes = currentChord.notes().map( note => note.key());
  var prevNote = n.pitch;
  var transformedNote = chordNotes[(prevNote-64+(chordNotes.length*1000))%chordNotes.length]+12*Math.floor((prevNote-64)/chordNotes.length);
  return {pitch:transformedNote};
}

//return;
var evtTest3 = m.evt().loop().pitch(60).velocity([100,120,101]).duration(t.beats(1/16)).metro(t.beats(1/2))
.set({pitch:(n) => n.time % t.bars(4) > t.bars(1) ? 63 : 60 })
.set({velocity: (n) => n.velocity*((n.time%t.bars(16))/t.bars(32)+0.5)});

var evtTest = m.evt().loop().pitch(64).velocity([100,120,101]).duration(t.beats(1/16)).metro(t.beats(1/6))
.set({pitch:(n) => n.time % t.bars(4) > t.bars(1) ? 70 : 60 })
.set({velocity: (n) => n.velocity*((n.time%t.bars(16))/t.bars(32)+0.5)})
.set({velocity:[80,0,60,0,50]})
//.swing(t.beats(1/4),0.05);
.notePlay();

var seqTest = m.evt()
.pitch(60)
.duration(t.beats(1/8))
.velocity(100)
.loop().metro(t.beats(1))
.pitch([64,65,66,67,40,42])
.pitch((n) => n.pitch)
.delay(0.25)
.notePlay();



var activeSequencers = {};
var activeSequences = {};
var generatorList = [];


import webServer from "./webServer";


webServer.liveCode.onValue(function(code) {
  console.log("new code",code);
  console.log("stopping activeSequencers",activeSequencers)

    var sequences = null
    var passedTests = false;
    try {
      var compiled = traceur.compile(code.code,{modules:"register", generators:"parse", blockBinding:"parse"});
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
      return;

    console.log("stopping",code.device,activeSequencers);
    if (activeSequences[code.device]) {
      if (activeSequencers[code.device])
        for (let s of activeSequencers[code.device]) {
          console.log("stopping sequencer",s);
          if (s.stop)
            s.stop();
        }
    }
    console.log("stopped");
    activeSequences[code.device] = {};
    for (let k of Object.keys(sequences)) {
      console.log("storing received sequence",k,""+sequences[k]);
      activeSequences [code.device][k] = ""+sequences[k];
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
