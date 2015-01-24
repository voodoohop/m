var Bacon = require("baconjs");
import {
  BaconSequencer
}
from "./tomSequencer";
var _ = require("lodash");


import {
  immutableTom
}
from "./immutable/nodeProxiedImmutable";

import {
  abletonReceiver, abletonSender
}
from "./oscAbleton";

import {
  processedSequences
}
from "./generatorModuleManager";

var sequenceSubscribe = abletonReceiver.sequencePlayRequests;


export default function(time, resetMessages, sequenceFeedback) {
  //console.log(sequenceSubscribe);
  // sequenceSubscribe.log("seqSubsribe");

  // TODO: can probably remove these reset requests...
  var resetRequests = new Bacon.Bus();

  var availableSequences = {};

  var playSequencer = (sequencer, inst, name, device) => sequencer.onValue((playFunc) => {
    // console.log("sending seqName",name);
    sequenceFeedback.push(_.extend({
      seqName: name,
      device: device
    }, playFunc.evt));
    playFunc.play(inst);
  });
  var playingSequences = {};

  var Sequencer = BaconSequencer(time);

  var subscribedSequences = [];



  var baconSubscribedSequences = new Bacon.Bus();

  function playOnlySubscribed() {
    console.log("subscribedSequences", subscribedSequences);
    console.log("playingSequences", Object.keys(playingSequences));
    // var needToBeStopped = _.without(Object.keys(playingSequences).map(k => k.split(":")[0]), ..._.pluck(subscribedSequences, "path"));
    var needToBeStopped = _.without(Object.keys(playingSequences), ...subscribedSequences.map(s => s.path+":"+s.port));
    console.log("need to stop:", needToBeStopped);
    for (let seqPath of needToBeStopped) {
      // Object.keys(playingSequences).filter(k=> k.split(":")[0] === seqPath).forEach(stopSeqPath=> {
        console.log("stopping", seqPath);
        playingSequences[seqPath].stop();
        delete playingSequences[seqPath];
      // })
    }
    // console.log("for needToPlay taking",       _.zip(_.pluck(subscribedSequences, "path"), _.pluck(subscribedSequences, "port")).map(n => n[0]+":"+n[1]),
    // "without",
    // Object.keys(playingSequences).map(k => k +":"+ playingSequences[k].port));
    var needToPlay = _.without(
      _.zip(_.pluck(subscribedSequences, "path"), _.pluck(subscribedSequences, "port")).map(n => n[0]+":_"+n[1]),
      ...Object.keys(playingSequences)
    );
    needToPlay = needToPlay.map(n => n.split(":")[0]);
    console.log("availableSequences", availableSequences);
    console.log("needToPlay", needToPlay);
    for (let seqPath of needToPlay) {
      if (availableSequences[seqPath])
        instrumentPlayer(availableSequences[seqPath]);
    }
    resetRequests.plug(Bacon.fromArray(needToPlay));
  }

  sequenceSubscribe.onValue((sub) => {
    // console.log(availableSequences[sub.path]);
    //TODO: change this insanity

    console.log("subscribeRequest", sub);
    if (!availableSequences[sub.path] || !availableSequences[sub.path].evaluatedDetails || !availableSequences[sub.path].evaluatedDetails[sub.name] || !availableSequences[sub.path].evaluatedDetails[sub.name].playable) {
      console.warn("tried subscribing to " + sub.name + " but not available or playable", availableSequences[sub.path]);
      return;
    }
    console.log("subscribing", sub.path); //, "subscribed", subscribedSequences);
    if (_.find(subscribedSequences, (s) => s.port == sub.port && s.path == sub.path))
      return;

    _.remove(subscribedSequences, (s) => s.port == sub.port);
    subscribedSequences.push(sub);
    // TODO: should change subscribedSequences to a bacon thing
    playOnlySubscribed();
  });

  var instrumentPlayer = function(seq) {

    // var port = _.find(subscribedSequences, (s) => s.path == seq.device + "/" + seq.name).port;
    var playSeqs;
    if (seq.port)
      playSeqs=[seq];
    else
      playSeqs = subscribedSequences.filter(s => s.path === seq.device + "/" + seq.name)

    playSeqs.forEach(s => {
      var port = s.port;
      console.log("creating instrument for", seq.device + "/" + seq.name, port);

      var seqInst = abletonSender.subscribeInstrument(seq.device + "/" + seq.name, port);
      var key=seq.device + "/" + seq.name+":"+port;
      if (playingSequences[key])
        playingSequences[key].stop();
      playingSequences[key] = {
        stop: playSequencer(Sequencer(seq.sequence, seq.device + "/" + seq.name), seqInst, seq.name, seq.device),
        sequence: seq.sequence,
        name: seq.name,
        path: seq.device + "/" + seq.name,
        device: seq.device,
        port: port
      }
    }
    );
  }

  resetMessages.onValue(() => {
    for (let seqPath of Object.keys(playingSequences)) {
      playingSequences[seqPath].stop();
      console.log("after reset recreating instrumentPlayer for ", seqPath, playingSequences[seqPath]);
      instrumentPlayer(playingSequences[seqPath]);
      //playingSequences[seqName] = {stop: playSequencer(Sequencer(seq.sequence,seq.name),seqInst), sequence: seq.sequence};
    }
  });

  processedSequences.onValue((seq) => {
    if (seq.evaluatedError) {
      console.error("not processing", seq.device, "due to error", seq.evaluatedError);
      return;
    }
    availableSequences[seq.device + "/" + seq.name] = seq;
    console.log("terminating ", seq.device + "/" + seq.name, "in playingSequences", playingSequences);

    var path = seq.device + "/" + seq.name;
    Object.keys(playingSequences).forEach(n => {
      var path2 = n.split(":")[0];
      if (path2 === path)
        playingSequences[n].stop();
    });
    instrumentPlayer(seq);
  });

  return {
    playingSequences: playingSequences,
    availableSequences: availableSequences,
    resetRequests: resetRequests
  }
}
