
var Bacon = require("baconjs");
import {BaconSequencer} from "./tomSequencer";
var _ = require("lodash");

import {abletonReceiver, abletonSender} from "./oscAbleton";
var sequenceSubscribe = abletonReceiver.sequencePlayRequests;
export default function(time, resetMessages, sequenceFeedback) {
  //console.log(sequenceSubscribe);
  // sequenceSubscribe.log("seqSubsribe");

  var newSequenceBus = new Bacon.Bus();

  var resetRequests = new Bacon.Bus();


  var availableSequences = {};

  var playSequencer = (sequencer,inst, name) => sequencer.onValue((playFunc) => {
    // console.log("sending seqName",name);
    sequenceFeedback.push(_.extend({seqName: name}, playFunc.evt))  ;
    playFunc.play(inst);
  });
  var playingSequences = {};

  var Sequencer = BaconSequencer(time);

  var subscribedSequences = [];

  function playOnlySubscribed() {
    console.log("subscribedSequences",subscribedSequences);
    var needToBeStopped = _.without(Object.keys(playingSequences), ..._.pluck(subscribedSequences,"sequenceName"));
    for (let seqName of needToBeStopped) {
      playingSequences[seqName].stop();
      delete playingSequences[seqName];
    }
    var needToPlay = _.without(_.pluck(subscribedSequences,"sequenceName"),...Object.keys(playingSequences));
    console.log("availableSequences",availableSequences);
    console.log("needToPlay",needToPlay);
    for (let seqName of needToPlay) {
      if (availableSequences[seqName])
        instrumentPlayer(availableSequences[seqName]);
    }
    resetRequests.push(Math.random());
  }

  sequenceSubscribe.onValue((sub) => {
    if (!availableSequences[sub.sequenceName]){
      // console.warn("tried subscribing to "+sub.sequenceName+" but not available");
      return;
    }
    console.log("subscribing",sub.sequenceName);//, "subscribed", subscribedSequences);
    if (_.find(subscribedSequences, (s) => s.port == sub.port && s.sequenceName == sub.sequenceName))
      return;

    _.remove(subscribedSequences, (s) => s.port == sub.port);
    subscribedSequences.push(sub);
    playOnlySubscribed();
  });

  var instrumentPlayer = function(seq) {

    var port = _.find(subscribedSequences,(s) => s.sequenceName == seq.name).port;
    console.log("creating instrument for",seq.name,port);
    var seqInst = abletonSender.subscribeInstrument(seq.name,port);
    playingSequences[seq.name] = {stop: playSequencer(Sequencer(seq.sequence,seq.name),seqInst, seq.name), sequence: seq.sequence, name:seq.name, port: port};
  }

  resetMessages.onValue(() => {
     for (let seqName of Object.keys(playingSequences)) {
       playingSequences[seqName].stop();
       console.log("after reset recreating instrumentPlayer for ",seqName,playingSequences[seqName]);
       instrumentPlayer(playingSequences[seqName]);
       //playingSequences[seqName] = {stop: playSequencer(Sequencer(seq.sequence,seq.name),seqInst), sequence: seq.sequence};
     }
  });

  newSequenceBus.onValue((seq) => {
    availableSequences[seq.name] = seq;
    if (playingSequences[seq.name]) {
      playingSequences[seq.name].stop();
      instrumentPlayer(seq);
    }
  });

  return {playingSequences: playingSequences, availableSequences: availableSequences, newSequence: newSequenceBus, resetRequests:resetRequests}
}
