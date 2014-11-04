
import {wu} from "./wu";
import {getIterator} from "./utils";
import {t} from "./time";

var Bacon = require("baconjs");

export var BaconSequencer = wu.curryable(function(baconTime, sequence) {
  //console.log("sequencer",baconTime);
  var seqIterator = getIterator(sequence);
  var next = seqIterator.next();
  return baconTime.take(1).flatMap((firstTime) => baconTime.diff(firstTime,(prevTime,time) => {
    var count=0;
    while (next.value.time < prevTime) {
      next = seqIterator.next();
      if (count++ > 50)
        return [];
    }
    if (time-prevTime > 1)
      return [];
    var eventsNow = [];
    while (next.value.time <= time) {
      eventsNow.push(next.value);
      next = seqIterator.next();
      if (count++ > 50)
        return eventsNow;
    }
    if (eventsNow.length > 10) {
      console.log("time",prevTime,time);
      console.log("eventsnow",eventsNow.length, eventsNow);
    }
    return eventsNow;
  })).flatMap((v) => Bacon.fromArray(v))
  .flatMap((evt) => evt.play(baconTime));
});
