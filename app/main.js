
var teoria = require("teoria");

import {FunctionalMusic} from "./functionalMonads";

import {t} from "./time";

import {TomFRPSequencer} from "./tomSequencer";

import {AbletonReceiver, AbletonSender} from "./oscAbleton";

import {isIterable} from "./utils";


//import {OSCNotePlayer} from "./tomOSCInstrument";


var abletonSender = AbletonSender(8892);
var abletonReceiver = AbletonReceiver(8895);



var m = FunctionalMusic();


//import {liveCodeRun} from "./liveCodeRunner";



var OSCSequencer = TomFRPSequencer(abletonSender, abletonReceiver.time);






var struct = m.evt().repeat(5).set({
  name:["slow","fast","slow","fast","slow"],
  duration:[t.bars(8),t.bars(4),t.bars(8),t.bars(16),t.bars(8)]
}).loop().timeFromDurations();

//for (let s of struct) {
//  console.log(s);
//}


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
//.notePlay();

var evtTest2 = struct.branch((s) => s.name=="fast", evtTest,evtTest3).map(chordProgMap).notePlay();

//console.log("evtTest",evtTest3);

//for (let e of evtTest) {
//    console.log("evtTest",e);
//}


//liveCodeRun("./liveCoding", OSCSequencer);



//OSCSequencer(evtTest2);


var activeSequencers = [];

var activeSequences = {};

abletonReceiver.codeChange.onValue(function(code) {

  console.log("got code",code);

  console.log("stopping activeSequencers",activeSequencers)
  for (let s of activeSequencers) {
    s.stop();
  }

  var f = new Function("m","t","params", "teoria",code);
  let sequences = f(m, t , abletonReceiver.param, teoria);
  sequences = [sequences];
  console.log("got new sequences",""+sequences);
  activeSequencers = sequences.map((s) => OSCSequencer(s));
  console.log("activeSequencers",activeSequencers.length);
});
