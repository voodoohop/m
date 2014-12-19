
import {CarimboNaRoca} from "abletonClip_CarimboNaRoca";
import {rhythmBased2} from "carimbonarocaRhytmBased";



var lowerNotes = CarimboNaRoca.groupByTime().simpleMap(n => {
  //   console.log(n.events[0]);
  return n.events[0];
}).pitch(n => n.pitch);




export var lowerPitchBend2 = rhythmBased2
.combine(lowerNotes.withNext())
.automate("pitchBend", n => {
  console.log(n.evt.other);





  var myPitch = n.evt.other.previous.pitch;
  var nextPitch = n.evt.other.next.pitch;
  var propn = n.time/n.duration;
  //   console.log(myPitch,nextPitch,(nextPitch-myPitch)/6/2*n.time+0.5)
  var easingFunc = easer().using("in-bounce");
  //   console.log(n.time);
  return (nextPitch-myPitch)/12*easingFunc(n.time/n.duration)+0.5;
}).merge(lowerNotes).filter(n => n.duration <1 );


// import {CarimboRhythm} from "abletonClip_CarimboRhythm";

export var rhythmBased_abstraction=rhythmBased2.duration(0.1).takeWhile(n => n.time < 1).loopLength(2).delay(3)
.combine(CarimboNaRoca).pitch(n => {
  // console.log("nnnn",n);
  if (!n.other.previous)
    return n.other.next.pitch;
    return n.other.previous.pitch+24
  });
  
