
import {wu} from "./wu";
import {getIterator} from "./utils";
import {t} from "./time";

var Bacon = require("baconjs");

var eventPlayer = function(baconTime, evt) {
  var combinedPlayers = Bacon.never();
//  console.log("trying to play", evt);
  if (evt.instrumentPlayers) {
    for (let methodName of Object.keys(evt.instrumentPlayers)) {
        // console.log("adding player", methodName);
        combinedPlayers = combinedPlayers.merge(evt.instrumentPlayers[methodName](baconTime));
    }
  }
    // console.log("checking",methodName,"for player");
  return combinedPlayers;
}

export var BaconSequencer = wu.curryable(function(baconTime, sequence) {
  //console.log("sequencer",baconTime);
  var seqIterator = getIterator(sequence);
  var next = seqIterator.next();
  return baconTime.take(1).flatMap((firstTime) => baconTime.diff(firstTime,(prevDecoded,timeDecoded) => {
    var prevTime = prevDecoded.time;
    var time = timeDecoded.time;
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
      eventsNow.push(next.value);
      next = seqIterator.next();
      if (count++ > 5)
        return eventsNow;
    }
    if (eventsNow.length > 10) {
      console.log("time",prevTime,time);
      console.log("eventsnow",eventsNow.length, eventsNow);
    }
    //console.log(eventsNow.length);
    return eventsNow;
  })).flatMap((v) => Bacon.fromArray(v))
  .flatMap((evt) => eventPlayer(baconTime, evt));
});
