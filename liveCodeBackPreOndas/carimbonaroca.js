
import {CarimboNaRoca} from "abletonClip_CarimboNaRoca";
import {rhythmBased2} from "carimbonarocaRhytmBased";



export var lowerNotes = CarimboNaRoca
.groupByTime().simpleMap(n => {
    log("mapping note",n);
    var meNote = n[0];
    log("returning", meNote);
    return meNote; //m().data([res.set({pitch:res.pitch+12,velocity:0.5}),res.set({pitch:res.pitch, time:res.time+0.5})]).take(2);
  })
  .map(n => {
    log("mapping using",m);
    log("mapping note",n);
    return m([n]).repeat(32);
  })
  .pitch(n =>  n.pitch)
  .duration(0.2)
  .delay(m().count(0,0.25).take(32)).bjorklund(16,13,2)
  .automate("pitchBend",n => Math.sin(n.target.time*Math.PI*2/4)/2+0.5);


  //.map(n => m().data(n)).duration(0.2).metro(0.5);
// .map(n => {
// // console.log(n);
// return
// }
// )



export var rhythmic = rhythmBased2.delay(-1).takeWhile(n => n.time <2).loopLength(2);

// m().evt({velocity:[0.9,0.5,0.6], color:"yellow", duration:[0.4,0.2], pitch:60})
// .metro(0.25).pitch([62,50,62])



// .delay(0.2);
//.pitch(n => n.pitch);
// .groupByTime().simpleMap(n => {
// //   consoale.log("nlength",n.length);
//   return n[0];
// }).pitch(n => n.pitch);

// .groupByTime().simpleMap(n => {
//   console.log(n.length);
//   return n[n.length-1];
// }).pitch(n => n.pitch);


// export var lowerPitchBend2 = lowerNotes
// // .combine(lowerNotes.withNext())
// .automate("param1", n => {
// //   console.log(n.(evt.other);
//   return Math.sin((n.time+n.target.time)*12)/2+0.5;
// })
// .automate("param2", n => {
// //   console.log(n.evt.other);
//   return Math.sin((n.time+n.target.time)*2)/2+0.5;
// })
// .merge(lowerNotes).filter(n => n.duration <1 );

// import {CarimboRhythm} from "abletonClip_CarimboRhythm";

// export var rhythmBased_abstraction=rhythmBased2.duration(0.1).pitch(50);//.loopLength(8)
// .combine(CarimboNaRoca).pitch(n => {
//   // console.log("nnnn",n);
//   if (!n.other.previous)
//     return n.other.next.pitch;
//     return n.other.previous.pitch+24
//   });
