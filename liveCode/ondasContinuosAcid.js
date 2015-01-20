

import {OndasGroove} from "abletonClip_OndasGroove";
import {chords as OndasChords} from "OndasChordsVariety";
import {getPitches,extendScaleToFullRange, scaleToPitch, pitchToScale} from "scaleTools";

import {growToBreak1,songUnitEaser} from "overallAutomator";



// m().addGen(function* arpeggiator(noteSelector,templateSequence, node) {

//      //log(""+m(node).groupByTime().map(n => m(templateSequence).pitch(nTemplate => nTemplate.pitch+n[0].pitch).delay(n[0].time)) );
//     templateSequence = m(templateSequence);


//         var applyTemplate= (note) =>  {
//             var takeCount=0;


//             return templateSequence
//                 // .take(8)
//                  .takeWhile(nt => {
//                      log(nt.time, " ", note.duration," ",takeCount++);
//                     return  nt.time < note.duration

//                  })
//                  .time(n => n.time+note.time)
//                  .pitch(nTemplate => nTemplate.pitch+note.pitch)
//                 // .toArray();
//         }

//     yield* m().getIterator(m(node).groupByTime().map(n => {


//         // log("got here");

//         var selectedNotes = noteSelector(n);

//         // log("got here too", selectedNotes);

//         // if (!selectedNotes.length)
//         //     selectedNotes=[selectedNotes];
//                 // log("got here too", selectedNotes);
//         var res = applyTemplate(selectedNotes);// R.chain(n => applyTemplate(n),selectedNotes)

//         // log(res.toArray());

//         return res;
//     })
//     );

//     // for (let n of node) {
//     //     // if (n.length)
//     //     for (let nTemplate of templateSequence) {
//     //         yield

//     //     }

//     //     // for (let time=n.time)
//     // }
// });

function noteSelect(n) {
  return n[n.length-1];
}



function dist(n1, n2) {
  var dist2 = Math.abs(n1.time - n2.time);
  if (dist2 > 1)
    log("dist shouldn't be greater than 1", dist2, n1, n2);
    return dist2;
  }


  var ondasScale = extendScaleToFullRange(getPitches(OndasChords));

  var template= m().evt({pitch:[0,-3,-5,0,-2,0],duration:[0.4,0.2,0.1],velocity:[0.9,1,0.5,0.3]}).metro(0.25);

  var ondasGrooveAcidNoAuto = OndasChords.pitch(pitchToScale(ondasScale)).arpeggiator(noteSelect,template).pitch(scaleToPitch(ondasScale))
  .bjorklund(12,//7

    n => {
        return n.time%64 >48 ? 5:7;
    }

    ,0).pitch(n =>n.pitch-12);

    export var ondasGrooveAcidNoAuto = ondasGrooveAcidNoAuto.combine(OndasGroove)
    .automate("param1", n => {
        return Math.sin((n.time+n.target.time))/2+0.5;
        if (!n.target.previous || !n.target.next)
            return 0.5;

        var dist1 = Math.abs(n.target.next.time - (n.time+n.target.time));
        var dist2= Math.abs(n.target.previous.time - (n.time+n.target.time));
        log(dist1);
        var shortestDist = 1-Math.min(dist1,1);
        return shortestDist;
    });
    ;

    export var ondasGrooveAcid = ondasGrooveAcidNoAuto
    .bjorklund(16,7,0)
    .automate("param2", n => {
      if (!n.target.previous || !n.target.next)
        return 0.5;

        var dist1 = Math.abs(n.target.next.time - (n.time+n.target.time));
        var dist2= Math.abs(n.target.previous.time - (n.time+n.target.time));
        log(dist1);
        var shortestDist = 1-Math.min(dist2,1);
        return shortestDist;
      })
      .combine(OndasGroove).simpleMap(n => {

        //   return note;
        if (!n.previous || !n.next) {

          //   log("no previous");
          return n;
        }

        log(n.time-n.previous.time," ",n.next.time-n.time);

        var closestOther = R.minBy(other => dist(other, n), [n.previous, n.next]);
        // log("yeah");

        var closestDist = dist(closestOther, n);
        // if (closestDist>0.2)
        //   log("distance",dist(n.previous,n),"\n",
        //   dist(n.previous,n), "\n",
        //   dist(closestOther,n));

        // if (closestDist > 0.3)
        //   return n;

        log(n.next.time, ":", n.previous.time);



        var grooveAmount=0;

        // log("closesOtherIs", n, closestOther);
        return n.set({
          time: n.time + (closestOther.time-n.time)*grooveAmount,
          color: "orange"
        }); // n.set({time:closestOther.time});
      }).automate("param3",growToBreak1)
      .automate("param4", songUnitEaser)
      ;
      ;
