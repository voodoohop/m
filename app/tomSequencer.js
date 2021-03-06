import {
  wu
}
from "./lib/wu";
import {
  getIterator
}
from "./lib/utils";
import {
  t
}
from "./time";

var Bacon = require("baconjs");

// var Rx = require("Rx");

var eventPlayer = function(evtWithOffset,baconTime) {
  //  console.log("trying to play", evt);
  var evt = evtWithOffset.evt;
  var firstTime = evtWithOffset.firstTime.offset;
  // console.log(evtWithOffset)

  return {
    evt: evt,
    play: function(instrument) {

      var stopFunc = () => {};
      if (evt.type == "noteOn" && !evt.noteDisabled) {
        console.log("playing noteOn", evt);
        instrument.noteOn(evt.pitch.valueOf(), evt.velocity.valueOf(), evt.time + firstTime);
      }
      if (evt.type == "noteOff" && !evt.noteDisabled) {
        instrument.noteOff(evt.pitch.valueOf(), evt.time + firstTime);
      }
      if (evt.type == "automation") {
        instrument.param(evt.name, evt.automationVal, evt.time + firstTime);
      }
      if (evt.type == "continuous") {
        console.log("continuous event", evt, instrument);
        var res = evt.automation(evt, instrument.inputParams, baconTime);
        if (res && res.onValue)
          stopFunc = res.onValue(v => instrument.param(evt.paramName, v, -1));
      }
      return stopFunc;
    }
  };
}

export var BaconSequencer = wu.curryable(function(baconTime, sequence, path) {
  console.log("sequencer", sequence,path);
  if (sequence == null || sequence.error || sequence.evaluatedError)
    return [new Bacon.Error(sequence.error || sequence.evaluatedError || sequence)]


  var seqIterator = null;
  var next = null;
  return baconTime.take(1).flatMap((firstTime) => baconTime.diff(firstTime, (prevDecoded, timeDecoded) => {
      // try {
      // TODO: do backwards time jump here
      var prevTime = prevDecoded.time;
      if (Number.isNaN(prevTime) || !Number.isFinite(prevTime))
        prevTime = 0;
      var time = timeDecoded.time;
      // console.log("tomSequence time",time);
      if (seqIterator == null) {
        console.log("skipping to", prevTime, "for sequence", sequence);
        seqIterator = getIterator(sequence
          .skipWhile((n) => n.type !== "continuous" && n.time < prevTime)
          .toPlayable());

        next = seqIterator.next({time:prevTime,path:path});
        // if (!next)
        //   return;
        //   console.log("Rx",Rx.Observable);
        //   var seqStream = Rx.Observable.from(sequence.skipWhile((n) => n.time < prevTime)
        //   .toPlayable());
        //   console.log("rxStream",seqStream);
        //   var subscription = seqStream.subscribe(
        //     function (x) {
        //       console.log('Next: ' + x);
        //     },
        //     function (err) {
        //       console.log('Error: ' + err);
        //     },
        //     function () {
        //       console.log('Completed');
        //     });
        //
        //   console.log("done skipping");
      }

      // console.log("timeDecoded", timeDecoded);
      var count = 0;
      var eventsNow = [];
      if (next == null || next.done) {
        // console.warn("next is null or done", Object.keys(sequence), sequence.currentNode);
        return [];
      }
      while (next.value.time < prevTime) {
        if (next.value.type === "continuous")
          eventsNow.push({evt: next.value,
            firstTime: {
              offset: 0
            }});
        next = seqIterator.next(prevTime);
        if (next.done)
          break;
        console.warn("time lag:", prevTime - next.value.time + "".bgRed);
        if (count++ > 5) { // low limit for too many events may need to change for other environments!!!
          console.log("event overflow, yielding to bacon", time.toFixed(2));
          return [];
        }
      }
      if (time - prevTime > 1)
        return eventsNow;

      while (!next.done && next.value.time <= time) {
        eventsNow.push({
          evt: next.value,
          firstTime: {
            offset: 0
          } /*firstTime*/
        });
        next = seqIterator.next(prevTime);
        if (count++ > 5)
          return eventsNow;
      }

      // }
      // catch (exception) {
      //   console.error(exception, exception.stack);
      //   return [new Bacon.Error(exception)];
      // }
      //console.log(eventsNow.length);
      return eventsNow;
    })).flatMap((v) => Bacon.fromArray(v))
    .map(evt => eventPlayer(evt,baconTime));
});
