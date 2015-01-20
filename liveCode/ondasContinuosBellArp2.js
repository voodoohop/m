
import {chords as OndasChords} from "OndasChordsVariety";
import { OndasGroove } from "abletonClip_OndasGroove";
import {ondasContinuousBass} from "ondasContinuosAcidBase";
import {songUnitEaser} from "overallAutomator";

var metro = 1/4;

var noteSelector= (notes, n) => {
    // log(notes[0].pitch,n.time);
    var arpedNoteNo = Math.floor(n.time/metro);
    // log(arpedNoteNo);
    return notes[arpedNoteNo%2];
}

var template = m().evt({pitch:0,duration:0.15, velocity:0.8}).metro(metro);

function dist(n1, n2) {
  var dist2 = Math.abs(n1.time - n2.time);
  if (dist2 > 1)
    log("dist shouldn't be greater than 1", dist2, n1, n2);
  return dist2;
}

var intermediateArped=m(OndasChords).arpeggiator2(noteSelector,template).combine(ondasContinuousBass.delay(16)).filter(n => {
    if (!n.previous)
        return true;
    if (n.previous.duration<0.1)
        return true;
    var distance = Math.abs(n.previous.time - n.time);
    if (distance>1)
        return false;
    return distance >0.25;
}) ;



export var arped=intermediateArped
//   .bjorklund(16,9,0)
.merge(m(intermediateArped).pitch(n => n.pitch-12).delay(0.25).duration(n=> (n.time % 64) / 64 *n.duration)  
//
)
.bjorklund(16,7,0)

// .pitch(n => n.pitch)
 .combine(OndasGroove).simpleMap(n => {

    //   return note;
    if (!n.previous || !n.next) {


      return n;
    }
    var closestOther = R.minBy(other => dist(other, n), [n.previous, n.next]);
    var closestDist = dist(closestOther, n);
    if (closestDist>0.1)
        return n;
    return n.set({
      time: closestOther.time,
      color: "orange"
     }); // n.set({time:closestOther.time});
  })
  .set({count:m().count(0,1)})
.automate("param1",songUnitEaser)
.automate("param2", n => {
    return n.target.count%2;
})
;


  ;
