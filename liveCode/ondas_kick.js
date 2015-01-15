import {
  OndasGroove
}
from "abletonClip_OndasGroove";
log("here we are!");

export var OndasGrooveTest = m().evt({
  pitch: 60,
  duration: 0.1,
  velocity: 0.9
}).metro(0.5);

import {
  OndasAcidExport as acidExport
}
from "abletonClip_OndasAcidExport";


function dist(n1, n2) {
  var dist2 = Math.abs(n1.time - n2.time);
  if (dist2 > 1)
    log("dist shouldn't be greater than 1", dist2, n1, n2);
  return dist2;
}

export var ondasGrooveCompare = OndasGroove.combine(acidExport).simpleMap(note => {


  if (!note.previous || !note.next) {

    log("no previous");
    return note;
  }
  log("hey3", note.next);



  // log(dist(note.next, note));
  return note;
  // var closestOther = R.minBy(other => dist(other, n),[n.previous,n.next]);
  // return n;

  // var closestOther = R.minBy(other => dist(other, n),[n.previous,n.next]);
  // log("yeah");

  // var closestDist = dist(closestOther,n);
  // // if (closestDist>0.2)
  // //   log("distance",dist(n.previous,n),"\n",
  // //   dist(n.previous,n), "\n",
  // //   dist(closestOther,n));

  // if (closestDist > 0.3)
  //   return n;

  //   // log(n.next.time, ":",n.previous.time);

  //   return n.set({velocity:0.99,color:"blue", duration:0.1});// n.set({time:closestOther.time});
});






// log(ondasGrooveCompare.take(100).toArray().map(n=>n.time));


export var ondasKick = m().evt({
    pitch: 60,
    duration: 0.1,
    velocity: 0.9
  }).metro(1)


  .combine(OndasGroove).simpleMap(n => {

    //   return note;
    if (!n.previous || !n.next) {


      return n;
    }
    var closestOther = R.minBy(other => dist(other, n), [n.previous, n.next]);
    var closestDist = dist(closestOther, n);
    return n.set({
      time: closestOther.time,
      color: "orange",
      velocity: 0.9,
      duration: 0.1
    }); // n.set({time:closestOther.time});
  });


import {growToBreak1,songUnitEaser4} from "overallAutomator";


  export var ondasClap = m().evt({
    pitch: 60,
    duration: 0.1,
    velocity: 0.9
  }).metro(2).delay(1).map(n => n.time % 16 <12 ? [n]:[n,n.set({time:n.time+0.25, velocity:0.5})])


  .combine(OndasGroove).simpleMap(n => {

    //   return note;
    if (!n.previous || !n.next) {


      return n;
    }
    var closestOther = R.minBy(other => dist(other, n), [n.previous, n.next]);
    var closestDist = dist(closestOther, n);
    return n.set({
      time: closestOther.time,
      color: "orange",
    //   velocity: 0.9,
      duration: 0.1
    }); // n.set({time:closestOther.time});
  }).automate("param3",growToBreak1)
.automate("param4", songUnitEaser4);










// log(OndasGroove.merge(m().evt({
//     pitch: 60,
//     duration: 0.1,
//     velocity: 0.9
//   }).metro(1)).take(50).toArray());
