
var Bacon = require("baconjs");
import {BaconSequencer} from "./tomSequencer";
var _ = require("lodash");


import {immutableTom} from "./immutable/nodeProxiedImmutable";

import {abletonReceiver, abletonSender} from "./oscAbleton";

import {processedSequences} from "./generatorModuleManager";

var sequenceSubscribe = abletonReceiver.sequencePlayRequests;


export default function(time, resetMessages, sequenceFeedback) {
  //console.log(sequenceSubscribe);
  // sequenceSubscribe.log("seqSubsribe");

  // TODO: can probably remove these reset requests...
  var resetRequests = new Bacon.Bus();


  var availableSequences = {};

  var playSequencer = (sequencer,inst, name,device) => sequencer.onValue((playFunc) => {
    // console.log("sending seqName",name);
    sequenceFeedback.push(_.extend({seqName: name, device: device }, playFunc.evt))  ;
    playFunc.play(inst);
  });
  var playingSequences = {};

  var Sequencer = BaconSequencer(time);

  var subscribedSequences = [];

  function playOnlySubscribed() {
    console.log("subscribedSequences",subscribedSequences);
    var needToBeStopped = _.without(Object.keys(playingSequences), ..._.pluck(subscribedSequences,"path"));
    for (let seqPath of needToBeStopped) {
      playingSequences[seqPath].stop();
      delete playingSequences[seqPath];
    }
    var needToPlay = _.without(_.pluck(subscribedSequences,"path"),...Object.keys(playingSequences));
    console.log("availableSequences",availableSequences);
    console.log("needToPlay",needToPlay);
    for (let seqPath of needToPlay) {
      if (availableSequences[seqPath])
        instrumentPlayer(availableSequences[seqPath]);
    }
    resetRequests.plug(Bacon.fromArray(needToPlay));
  }

  sequenceSubscribe.onValue((sub) => {
    // console.log(availableSequences[sub.path]);
    //TODO: change this insanity
    console.log("subscribeRequest",sub);
    if (!availableSequences[sub.path] || !availableSequences[sub.path].evaluatedDetails || !availableSequences[sub.path].evaluatedDetails[sub.name]|| !availableSequences[sub.path].evaluatedDetails[sub.name].playable){
      console.warn("tried subscribing to "+sub.name+" but not available or playable", availableSequences[sub.path]);
      return;
    }
    console.log("subscribing",sub.path);//, "subscribed", subscribedSequences);
    if (_.find(subscribedSequences, (s) => s.port == sub.port && s.path == sub.path))
      return;

    _.remove(subscribedSequences, (s) => s.port == sub.port);
    subscribedSequences.push(sub);
    playOnlySubscribed();
  });

  var instrumentPlayer = function(seq) {

    var port = _.find(subscribedSequences,(s) => s.path == seq.device+"/"+seq.name).port;
    console.log("creating instrument for",seq.device+"/"+seq.name,port);
    var seqInst = abletonSender.subscribeInstrument(seq.device+"/"+seq.name,port);
    playingSequences[seq.device+"/"+seq.name] = {stop: playSequencer(Sequencer(seq.sequence,seq.device+"/"+seq.name),seqInst, seq.name,seq.device), sequence: seq.sequence, name:seq.name,path:seq.device+"/"+seq.name,device:seq.device, port: port};
  }

  resetMessages.onValue(() => {
     for (let seqPath of Object.keys(playingSequences)) {
       playingSequences[seqPath].stop();
       console.log("after reset recreating instrumentPlayer for ",seqPath,playingSequences[seqPath]);
       instrumentPlayer(playingSequences[seqPath]);
       //playingSequences[seqName] = {stop: playSequencer(Sequencer(seq.sequence,seq.name),seqInst), sequence: seq.sequence};
     }
  });

  processedSequences.onValue((seq) => {
    if (seq.evaluatedError) {
      console.error("not processing", seq.device,"due to error", seq.evaluatedError);
      return;
    }
    availableSequences[seq.device+"/"+seq.name] = seq;
    console.log("terminating ", seq.device+"/"+seq.name, "in playingSequences",playingSequences);
    if (playingSequences[seq.device+"/"+seq.name]) {
      playingSequences[seq.device+"/"+seq.name].stop();
      instrumentPlayer(seq);
    }
  });

  return {playingSequences: playingSequences, availableSequences: availableSequences, resetRequests:resetRequests}
}
