
// import {ClipMadZach} from "./externalSeq";

// console.log("ClipMadZach",ClipMadZach.pitch);

// export var madMapped = ClipMadZach.pitch((n) => n.pitch-18).velocity([30,60,40,50,50])
// //.duration(Math.random()*(0.4))
// .notePlay();

import {Yegros_Transformed} from "./externalSeq";


var seqTest = m.evt()
.pitch(60)
.duration((0.1))
.loop().metro((1/3))
.delay((0.5))
.velocity([40,70,90,50,53])
.pitch([64,65,66,67,60,59])
.swing((0.25),0.07)
.notePlay();

var chordProg = "E7 F#7 E7 F#7 Cmaj9 A7 D9 Gmaj9 Cmaj9 F#7 b5 B7".split(" ");
var chordProgMap = (n) => {
  var barNo = Math.floor(n.time / t.bars(1));
  var currentChord = teoria.chord(chordProg[barNo % chordProg.length]);
  var chordNotes = currentChord.notes().map( note => note.key());
  var prevNote = n.pitch;
  var transformedNote = chordNotes[(prevNote-64+(chordNotes.length*1000))%chordNotes.length]+12*Math.floor((prevNote-64)/chordNotes.length);
  return {pitch:transformedNote};
};

var seq3=m.evt().pitch(64)
.duration((1/16))
.loop().velocity([50,80,60,1]).pitch([64]).metro((1/4)).notePlay();

//export var externalProp = m.externalProperty("rhythmModifier", params("1"),0);

var bass=m.evt().repeat(4)
.set({
    time:[(0.333),(0.5), (1.5),(2.5),(3.5)],
    pitch: 52,
    velocity: [80,50,80,40],
    duration:[(1/8),(1/8),(1/8),(1/12)]
})
.loopLength((4)).notePlay();

// var pitchBend = m.value((time,v) => Math.sin(2*Math.PI*time/(0.25))*0+64)
// .duration(t.bars(2)).loop()
// .timeFromDurations()
// .automatePlay("pitchBend");

//  var param1 = m.value((time,v) => 1-Math.abs((time%(1))/(0.5)-1))
// .duration(t.bars(2)).loop()
// .timeFromDurations()
// .automatePlay("param1");

export var kick=m.evt({pitch:60,duration:(1/4), velocity:100}).loop().metro((1)).notePlay();

//export var snare=m.evt({pitch:60, duration:(1/8), velocity:100, time:(2)}).loopLength((2)).notePlay();

//export var hats=m.evt({pitch:60,duration:(1/8)}).loop().pitch([60,63,62]).velocity([20,70,90,50,60,90]).metro((1)).delay((0.5)).swing((0.25),0.1).notePlay();

export var shaker=m.evt({pitch:60,duration:(1/12)}).loop().pitch([40,41,39,41,43,39,40,39]).velocity([70,20,50,4,60,40,50,30])
.metro((1/4))
.swing((0.25),0.1)
.velocity((v) => v.time % t.bars(4) > (0.3) ? v.velocity : 0)
.velocity((v) => v.time % t.bars(8) < t.bars(7.5) ? v.velocity : 10)
.velocity((v) => _.contains([0,1,2,4,5,7],Math.floor((v.time % (2))/(0.25))) ? v.velocity : 0)
.delay((1/2))
.notePlay();

export var shaker2=m.evt({ duration:(0.1)}).loop().metro((0.25)).bjorklund(4,3,3).pitch([37,37,38]).velocity([0.5,0.7,0.6,0.5,0.6]).swing(0.25,0.1).notePlay();

var pattern1 = m.evt({pitch: 60, duration: 0.1, velocity: 0.7 }).loop().metro(1);

var pattern2 = m.evt({pitch:58, duration: 0.1, velocity:0.3}).loop().metro(1/3);

export var patternMerged = pattern1.merge(pattern2).notePlay();

export var yegrosMapped = Yegros_Transformed
    .filter((n) => n.duration > 0.3 && n.pitch<59)
    //.pitch((n) => n.pitch+12)
    .duration(0.3)
    .time((n) => n.time - (n.time % 2)).delay(0)
    .map((n) =>
        m.evt(n).delay(1.5).pitch((n) => n.pitch).velocity(0.40)
        .compose(m.evt(n).delay(0.75).duration(0.1)
        .compose(m.evt(n).delay(0.5).velocity(0.3).duration(0.05)
        .compose(m.evt(n).delay(0.25)
        .compose(m.evt(n).duration(0.05)
        .compose(m.evt(n).duration(0.1).delay(1)
        .compose(m.evt(n).duration(0.1).velocity(0.3).delay(1.7)))
        )))))
    .swing(0.25,0.1)
    //.duration(2)
    //.delay(0.5)
    //.mapTime((time) => [time, time+0.5])
    .notePlay();
