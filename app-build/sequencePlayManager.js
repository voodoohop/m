"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__tomSequencer__,
    $__oscAbleton__;
var Bacon = require("baconjs");
var BaconSequencer = ($__tomSequencer__ = require("./tomSequencer"), $__tomSequencer__ && $__tomSequencer__.__esModule && $__tomSequencer__ || {default: $__tomSequencer__}).BaconSequencer;
var _ = require("lodash");
var $__1 = ($__oscAbleton__ = require("./oscAbleton"), $__oscAbleton__ && $__oscAbleton__.__esModule && $__oscAbleton__ || {default: $__oscAbleton__}),
    abletonReceiver = $__1.abletonReceiver,
    abletonSender = $__1.abletonSender;
var sequenceSubscribe = abletonReceiver.sequencePlayRequests;
var $__default = function(time, resetMessages, sequenceFeedback) {
  var newSequenceBus = new Bacon.Bus();
  var resetRequests = new Bacon.Bus();
  var availableSequences = {};
  var playSequencer = (function(sequencer, inst, name, device) {
    return sequencer.onValue((function(playFunc) {
      sequenceFeedback.push(_.extend({
        seqName: name,
        device: device
      }, playFunc.evt));
      playFunc.play(inst);
    }));
  });
  var playingSequences = {};
  var Sequencer = BaconSequencer(time);
  var subscribedSequences = [];
  function playOnlySubscribed() {
    var $__6,
        $__7;
    console.log("subscribedSequences", subscribedSequences);
    var needToBeStopped = ($__6 = _).without.apply($__6, $traceurRuntime.spread([Object.keys(playingSequences)], _.pluck(subscribedSequences, "sequenceName")));
    for (var $__2 = needToBeStopped[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__3; !($__3 = $__2.next()).done; ) {
      let seqName = $__3.value;
      {
        playingSequences[seqName].stop();
        delete playingSequences[seqName];
      }
    }
    var needToPlay = ($__7 = _).without.apply($__7, $traceurRuntime.spread([_.pluck(subscribedSequences, "sequenceName")], Object.keys(playingSequences)));
    console.log("availableSequences", availableSequences);
    console.log("needToPlay", needToPlay);
    for (var $__4 = needToPlay[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__5; !($__5 = $__4.next()).done; ) {
      let seqName = $__5.value;
      {
        if (availableSequences[seqName])
          instrumentPlayer(availableSequences[seqName]);
      }
    }
    resetRequests.push(Math.random());
  }
  sequenceSubscribe.onValue((function(sub) {
    if (!availableSequences[sub.sequenceName]) {
      return;
    }
    console.log("subscribing", sub.sequenceName);
    if (_.find(subscribedSequences, (function(s) {
      return s.port == sub.port && s.sequenceName == sub.sequenceName;
    })))
      return;
    _.remove(subscribedSequences, (function(s) {
      return s.port == sub.port;
    }));
    subscribedSequences.push(sub);
    playOnlySubscribed();
  }));
  var instrumentPlayer = function(seq) {
    var port = _.find(subscribedSequences, (function(s) {
      return s.sequenceName == seq.name;
    })).port;
    console.log("creating instrument for", seq.name, port);
    var seqInst = abletonSender.subscribeInstrument(seq.name, port);
    playingSequences[seq.name] = {
      stop: playSequencer(Sequencer(seq.sequence, seq.name), seqInst, seq.name, seq.device),
      sequence: seq.sequence,
      name: seq.name,
      port: port
    };
  };
  resetMessages.onValue((function() {
    for (var $__2 = Object.keys(playingSequences)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__3; !($__3 = $__2.next()).done; ) {
      let seqName = $__3.value;
      {
        playingSequences[seqName].stop();
        console.log("after reset recreating instrumentPlayer for ", seqName, playingSequences[seqName]);
        instrumentPlayer(playingSequences[seqName]);
      }
    }
  }));
  newSequenceBus.onValue((function(seq) {
    availableSequences[seq.name] = seq;
    if (playingSequences[seq.name]) {
      playingSequences[seq.name].stop();
      instrumentPlayer(seq);
    }
  }));
  return {
    playingSequences: playingSequences,
    availableSequences: availableSequences,
    newSequence: newSequenceBus,
    resetRequests: resetRequests
  };
};
