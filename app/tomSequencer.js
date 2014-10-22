
import {wu} from "./wu";
import {getIterator} from "./utils";

export var TomFRPSequencer = wu.curryable(function(instrument,baconTime, sequence) {
  //var latency=2;
  console.log("CREATED SEQ");
  var seq = {};
  var seqIterator = getIterator(sequence);
  var evt = seqIterator.next().value;
//  var me = Math.random();
  console.log("firstEvent:",evt);
  console.log("waiting for first time event");
  //var Worker = require('webworker-threads').Worker;
  // baconTime.take(1).onValue(function (firstTime) { setTimeout(()=> {
  //   while ((evt = seqIterator.next().value).time < firstTime) {
  //     console.log("skipping events until", firstTime, evt.time);
  //   }
  // },5000)}
  // );
  var stopLastEvent = null;
  let processEvent = function(currentTime) {

    if (evt != undefined && evt.time < currentTime) {
      if (currentTime - evt.time < 100) {
        console.log("playing",evt);
        if (evt.play)
          stopLastEvent = evt.play(baconTime, instrument);
        // if (evt.type === "noteOn") {
        //   console.log("noteOn",evt.pitch,currentTime);
        //   instrument.noteOn(evt.pitch,evt.velocity, evt.time);
        // }
        // if (evt.type === "noteOff"){
        //   console.log("noteOff",evt.pitch,currentTime);
        //   instrument.noteOff(evt.pitch, evt.time);
        // }
        // if (evt.type === "value") {
        //   console.log("automateEvent",evt);
        // }
      }
      else {console.log("remaining time until first event",currentTime,evt.time,currentTime - evt.time);}

      let nextEvent = seqIterator.next().value;
      if (nextEvent == undefined) {
        console.log("sequence ENDED");
        return;
      }
      //   while (evt.type == "continuous" && nextEvent.time > currentTime) {
      //     currentTime = yield null;
      //
      //     //currentTime = currentTime + latency;
      //     instrument.param(evt.name, evt.value_func(currentTime-evt.time));
      //   }
      evt = nextEvent;

    }
  }
  let baconStopper = baconTime.onValue(function(t) {
//    console.log("received time",t);
//    currentTime = t;
//    console.log("processing", t,me);
    setTimeout(() => processEvent(t),0);
  });
//  baconTime.onValue(() => console.log("val"));
  seq.stop = function() {
    if (stopLastEvent)
      stopLastEvent();
    baconStopper();
  }
  return seq;
});


//console.log("TomFRPSequencer",TomFRPSequencer);

//var frpSeq = TomFRPSequencer(testSeq,oscNotePlayer());



//var oscPlayer = oscNotePlayer();


// var play = function(name,seq) {
//   sequencers = sequencers.set(name,TomFRPSequencer(seq,oscPlayer));
// }
//
// var stop=function(name) {
//   sequencers = sequencers.unset(name);
// }

//play("testContinuous",);
//play("testEll2", branched2);
//play("test4",s3);
//play("test", s.map((s) => s.set({pitch: s.pitch+24, time:s.time+t.beats(1.5), velocity: 127-s.velocity})));


// var s2=m.evt({type:"note", pitch: 64, duration: t.beats(1)})
// .repeat(10)
// .metro( t.beats(1/4.0) );
// for (let note of s2()) {
//   console.log("onoffseqwithend",note);
// }


// var runSequencers =  (time) => {
//   //console.log(sequencers.toArray());
//   for (let seqName of ImmutableObject.keys(sequencers)) {
//     let frpSeq = sequencers[seqName];
//     frpSeq.timeEvent.next(time);
//   }
// };





//setInterval(() => sendTest(),5000);
//return;returning

//export default {TomFRPSequencer};
