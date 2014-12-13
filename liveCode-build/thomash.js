

import {transChordsLonger as chords} from "abletonClip_transChordsLonger";


var chordsGroup = chords.groupByTime().durationsFromTime();

console.log(chordsGroup.toArray());

var pitchMap=wu.curryable(function(pitches,node) {
  return node.pitch(n => n.pitch+pitches[Math.floor(n.time/4%pitches.length)]);
});

var tPitchMap=pitchMap([2,0,3,4,-12,-5,12,12]);
//var tPitchMap=pitchMap([0]);

export var marimba2=tPitchMap(m.evt({pitch:50,duration:0.2,color:"red",velocity:[0.9]})
.metro(1).delay(0.5)
//.bjorklund(8,6,0)
.automate("param1", n => (n.time+n.evt.time) % 4 /4)
.automate("pitchBend", n => (n.time+n.evt.time) % 64 /64));
// ;

export var arpedChords = chordsGroup.gen(function*(chordsGrouped) {
  for (let c of chordsGroup) {
    console.log("chordsGroup",c);
    var rate = 0.25;
    var gate=0.99;
    var counter=0;
    for (let time=c.time; time<c.duration+c.time;time+=rate) {

      var e = c.events[counter++ % c.events.length];
      console.log("chordsGroup",{pitch:e.pitch, velocity:0.8, duration:gate*rate, time:time});
      yield {pitch:e.pitch, velocity:0.8, duration:gate*rate, time:time};
    }
  };
});

export var arpedChords2 = chordsGroup.gen(function*(chordsGrouped) {
  for (let c of chordsGroup) {
    console.log("chordsGroup",c);
    var rate = 1;

    var gate=0.99;
    var counter=0;
    for (let time=c.time; time<c.duration+c.time;time+=rate) {

      var e = c.events[c.events.length-1];
      console.log("chordsGroup",{pitch:e.pitch, velocity:0.8, duration:gate*rate, time:time});
      yield {pitch:e.pitch-24, velocity:0.6, duration:gate*rate, time:time};
    }
  };
}).delay(0.5);



export var marimba3=marimba2;

export var marimba5=marimba2;
