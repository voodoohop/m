"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__tomSequencer__;
var Bacon = require("baconjs");
var BaconSequencer = ($__tomSequencer__ = require("./tomSequencer"), $__tomSequencer__ && $__tomSequencer__.__esModule && $__tomSequencer__ || {default: $__tomSequencer__}).BaconSequencer;
var _ = require("lodash");
var $__default = function(sequenceSubscribe, abletonSender, time, resetMessages, sequenceFeedback) {
  sequenceSubscribe.log("seqSubsribe");
  var newSequenceBus = new Bacon.Bus();
  var resetRequests = new Bacon.Bus();
  var availableSequences = {};
  var playSequencer = (function(sequencer, inst, name) {
    return sequencer.onValue((function(playFunc) {
      sequenceFeedback.push(_.extend({seqName: name}, playFunc.evt));
      playFunc.play(inst);
    }));
  });
  var playingSequences = {};
  var Sequencer = BaconSequencer(time);
  var subscribedSequences = [];
  function playOnlySubscribed() {
    var $__5,
        $__6;
    console.log("subscribedSequences", subscribedSequences);
    var needToBeStopped = ($__5 = _).without.apply($__5, $traceurRuntime.spread([Object.keys(playingSequences)], _.pluck(subscribedSequences, "sequenceName")));
    for (var $__1 = needToBeStopped[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__2; !($__2 = $__1.next()).done; ) {
      let seqName = $__2.value;
      {
        playingSequences[seqName].stop();
        delete playingSequences[seqName];
      }
    }
    var needToPlay = ($__6 = _).without.apply($__6, $traceurRuntime.spread([_.pluck(subscribedSequences, "sequenceName")], Object.keys(playingSequences)));
    console.log("availableSequences", availableSequences);
    console.log("needToPlay", needToPlay);
    for (var $__3 = needToPlay[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__4; !($__4 = $__3.next()).done; ) {
      let seqName = $__4.value;
      {
        if (availableSequences[seqName])
          instrumentPlayer(availableSequences[seqName]);
      }
    }
    resetRequests.push(Math.random());
  }
  sequenceSubscribe.onValue((function(sub) {
    if (!availableSequences[sub.sequenceName]) {
      console.warn("tried subscribing to " + sub.sequenceName + " but not available");
      return;
    }
    console.log("subscribing", sub, "subscribed", subscribedSequences);
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
      stop: playSequencer(Sequencer(seq.sequence, seq.name), seqInst, seq.name),
      sequence: seq.sequence,
      name: seq.name,
      port: port
    };
  };
  resetMessages.onValue((function() {
    for (var $__1 = Object.keys(playingSequences)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__2; !($__2 = $__1.next()).done; ) {
      let seqName = $__2.value;
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
