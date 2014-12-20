
import {CarimboNaRoca} from "abletonClip_CarimboNaRoca";
import {rhythmBased2} from "carimbonarocaRhytmBased";



// var lowerNotes = CarimboNaRoca.groupByTime().simpleMap(n => {
//   //   console.log(n.events[0]);
//   return n.events[0];
// }).pitch(n => n.pitch);




export var lowerPitchBend2 = rhythmBased2
// .combine(lowerNotes.withNext())
.automate("oara", n => {
//   console.log(n.evt.other);
  return Math.sin(n.time+n.evt.time*8)/2+0.5;
}).time(n => n.time/5)
// .merge(lowerNotes).filter(n => n.duration <1 );


// import {CarimboRhythm} from "abletonClip_CarimboRhythm";

export var rhythmBased_abstraction=rhythmBased2.duration(1).pitch(30).loopLength(8).time(n => n.time*4);
// .combine(CarimboNaRoca).pitch(n => {
//   // console.log("nnnn",n);
//   if (!n.other.previous)
//     return n.other.next.pitch;
//     return n.other.previous.pitch+24
//   });
  
