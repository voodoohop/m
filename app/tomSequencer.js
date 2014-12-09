
import {wu} from "./wu";
import {getIterator} from "./utils";
import {t} from "./time";

var Bacon = require("baconjs");

var eventPlayer = function(evtWithOffset) {
//  console.log("trying to play", evt);
  var evt = evtWithOffset.evt;
  var firstTime = evtWithOffset.firstTime.offset;
  // console.log(evtWithOffset)
  return {evt: evt, play: function(instrument) {
   if (evt.type=="noteOn") {
    instrument.noteOn(evt.pitch.valueOf(), evt.velocity.valueOf(), evt.time+firstTime);
   }
   if (evt.type=="noteOff") {
     instrument.noteOff(evt.pitch.valueOf(), evt.time+firstTime);
    }
    if (evt.type=="automation") {
      instrument.param(evt.name, evt.automationVal, evt.time+firstTime);
    }
  }};
}

export var BaconSequencer = wu.curryable(function(baconTime, sequence) {
  //console.log("sequencer",baconTime);
  var seqIterator = null;
  var next=null;
  return baconTime.take(1).flatMap((firstTime) => baconTime.diff(firstTime,(prevDecoded,timeDecoded) => {

    // TODO: do backwards time jump here
    var prevTime = prevDecoded.time;
    var time = timeDecoded.time;

    if (seqIterator == null) {
      seqIterator = getIterator(sequence
        .skipWhile((n) => n.time < prevTime)
        .toPlayable());
      next = seqIterator.next();
    }

    // console.log("timeDecoded", timeDecoded);
    var count=0;
    while (next.value.time < prevTime) {
      next = seqIterator.next();
      if (count++ > 5) { // low limit for too many events may need to change for other environments!!!
         console.log("event overflow, yielding to bacon",time.toFixed(2));
         return [];
      }
    }
    if (time-prevTime > 1)
      return [];
    var eventsNow = [];
    while (next.value.time <= time) {
      eventsNow.push({evt: next.value, firstTime:firstTime});
      next = seqIterator.next();
      if (count++ > 5)
        return eventsNow;
    }

    //console.log(eventsNow.length);
    return eventsNow;
  })).flatMap((v) => Bacon.fromArray(v))
  .map(eventPlayer);
});
