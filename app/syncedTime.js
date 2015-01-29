
var Bacon = require("baconjs");

import {abletonReceiver} from "./oscAbleton";


var _ = require("lodash");

export var timeResetRequest = new Bacon.Bus();

import {t} from "./time";

var lastCodeResetNo = -1;

// abletonReceiver.time.log("abletonReceivertime");

export var decodedTime = abletonReceiver.time.diff(0,(a,b) => b-a).skip(1).zip(abletonReceiver.time.skip(1),(timeDiff,time) => {return {timeDiff,time}})
.map((time) => time.timeDiff < -8 ? _.extend({reset:true},time) : time)
.combine(timeResetRequest.debounceImmediate(500).toProperty(),
function(time, codeReset) {
  if (lastCodeResetNo != codeReset) {
    console.log("RESET",time,codeReset);
    lastCodeResetNo = codeReset;
    return _.extend({reset:true},time);
  }
  return time;
}
)
.scan({},(prev,time) => {
  var newTime = _.clone(time);
  if (prev.firstTime > 0 && !time.reset)
    newTime.firstTime = prev.firstTime;
    else
      newTime.firstTime = time.time-time.time % t.bars(4);
      return newTime;
    });
// decodedTime.log("decoedTime");



    // TODO: could move all this time stuff to sequencePlayManager or another module
    // TODO: timeThatAccountsForTransportJumps should be a stream of functions that can convert time to global ableton time automatically
    // TODO: make every stream have its own starttime
    var timeThatAccountsForTransportJumps2 = decodedTime.map((t) => {
      // return {time: t.time-t.firstTime, offset: t.firstTime}
      return {time: t.time, offset: 0}

    });


    export var time = timeThatAccountsForTransportJumps2;
    // time.log("processedTime");
    export var resetMessages = decodedTime.map((t) => t.reset).filter((t) => t).debounce(50);



    // kick off need this for some reason
    setTimeout(() => timeResetRequest.push("first time resseeet"), 2000);
