

import {pitchBendPlayer,pitchBendPlayer2} from "pitchBender";

import {raouniChords as chords} from "abletonClip_raouniChords";

log("hey");


// log(raouniChords);

//chords = chords.simpleMap(n => n.set({time: n.time*4, duration: n.duration*4}));

export var res = chords;

export var bender = m().evt({pitch: 60, velocity: 0.9,color:"lightblue"}).metro(1).durationsFromTime();
export var bender2 = m().evt({pitch: 60, velocity: 0.9,color:"lightblue"}).metro(0.5).durationsFromTime();


log("pb1");
//  log(noteNo,"hey");
//  noteNo=noteNo+0;
var noteNo=0;
export var extractedNotes=m().evt({pitch:[60,62,65,58], velocity:0.7}).metro(1).durationsFromTime().time(0);



// chords.groupByTime().simpleMap(n => {
//      log(n.length);
//      return n[noteNo%n.length];
//  }
//  ).pitch(n => n.pitch+12);
export var pb1 = pitchBendPlayer(extractedNotes, bender)//.pitch(60);

// export var pb2 = bender2.automate("pitchBend", pitchBendPlayer2);

log("hellohello");

log(pb1.take(10).toArray());

log("hellohello2");