

import {NiceHummingChords as HummingChordsCorrect} from "abletonClip_NiceHummingChords";
// import {HummingChordsCorrect} from "abletonClip_HummingChordsCorrect";


const chords = HummingChordsCorrect.groupByTime();

log(chords.take(1).toArray());

var easeFunc = easer().using("in-expo");

function getPB(pbRange, rootNote, note) {
    const n = note %12;
    const rn = rootNote%12;
    const ns = [n-12, n, n+12];
    var pb = ns.map(n => ({pb: n-rn, dist: Math.abs(n-rn)}));
    var minPB = _.min(pb, o => o.dist);
    // log(minPB);
    
    return minPB.pb/pbRange/2+0.5;
}

log(getPB(6, 60, 67));

const rootNote=50;


var easeFunc = easer().using("in-expo");

function pitchBendMelody(pbRange, rootNote, melody) {
    return melody.prop("pb", n => getPB(pbRange, rootNote, n.pitch)).withNext()
    .automate("pitchBend", n => {
      var t = easeFunc(n.time / n.duration);
    //   t = t*t;
      var pbMe = n.target.pb;
      var pbNext = n.target.next.pb;
      var pb = pbMe*(1-t) + ( t) * pbNext;
      return pb;
    })
    .pitch(rootNote);
}



export var pbMelody2 = pitchBendMelody(6, rootNote, chords.simpleMap(n => n[1])).delay(-1);
export var pbMelody3 = pitchBendMelody(6, rootNote, chords.simpleMap(n => n[2])).delay(1);


// log(pbMelody1.take(5).toArray());


export var hummingBended = HummingChordsCorrect;

var bassRootNote = rootNote;

var bassMelody = pitchBendMelody(6, bassRootNote, chords.simpleMap(n => n[1]));


var bassBase = m().note().metro(1/2).duration(0.3)
.velocity([0.4,0.9,0.7])
 .bjorklund(16,9,1)
// .bjorklund(4,1,0)
.automate("param1", n => (n.target.time%32)/32)
.automate("param2", n => (n.target.time%24)/24)
// .swing(1/8,0.1)
.delay(1)

;

export var bassLine = bassMelody.delay(1).pitch(bassRootNote).automationOnly().merge(bassBase);


export var pbMelody1 = pitchBendMelody(6, rootNote, chords.simpleMap(n => n[0]))
    .delay(1)
    .merge(bassBase.set({noteDisabled:true, bassNote: true}).delay(1.5))
    .automate("param1",n => n.target.bassNote ? 1 : 0 );


export var chordsTest = HummingChordsCorrect;

