
import {CarimboNaRoca2 as CarimboNaRoca} from "ableton";
import {rhythmBased2} from "carimbonarocaRhytmBased";



var lowerNotes = CarimboNaRoca.groupByTime().simpleMap(n => {
  //   console.log(n.events[0]);
  return n.events[0];
}).pitch(n => n.pitch);

export var higherNotes = CarimboNaRoca.groupByTime().simpleMap(n => {
  //   console.log(n.events[0]);
  return n.events[n.events.length-1];
}).pitch(n => n.pitch);


export var lowerPitchBend2 = lowerNotes
// .combine(lowerNotes.withNext())
.automate("param1", n => {
//   console.log(n.(evt.other);
  return Math.sin((n.time+n.evt.time)*12)/2+0.5;
})
.automate("param2", n => {
//   console.log(n.evt.other);
  return Math.sin((n.time+n.evt.time)*2)/2+0.5;
})
// .merge(lowerNotes).filter(n => n.duration <1 );


// import {CarimboRhythm} from "abletonClip_CarimboRhythm";

export var rhythmBased_abstraction=rhythmBased2.duration(0.1).pitch(50);//.loopLength(8)
// .combine(CarimboNaRoca).pitch(n => {
//   // console.log("nnnn",n);
//   if (!n.other.previous)
//     return n.other.next.pitch;
//     return n.other.previous.pitch+24
//   });
  
