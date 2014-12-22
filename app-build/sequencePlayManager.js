"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__tomSequencer__,
    $__immutable_47_nodeProxiedImmutable__,
    $__oscAbleton__,
    $__generatorModuleManager__;
var Bacon = require("baconjs");
var BaconSequencer = ($__tomSequencer__ = require("./tomSequencer"), $__tomSequencer__ && $__tomSequencer__.__esModule && $__tomSequencer__ || {default: $__tomSequencer__}).BaconSequencer;
var _ = require("lodash");
var immutableTom = ($__immutable_47_nodeProxiedImmutable__ = require("./immutable/nodeProxiedImmutable"), $__immutable_47_nodeProxiedImmutable__ && $__immutable_47_nodeProxiedImmutable__.__esModule && $__immutable_47_nodeProxiedImmutable__ || {default: $__immutable_47_nodeProxiedImmutable__}).immutableTom;
var $__2 = ($__oscAbleton__ = require("./oscAbleton"), $__oscAbleton__ && $__oscAbleton__.__esModule && $__oscAbleton__ || {default: $__oscAbleton__}),
    abletonReceiver = $__2.abletonReceiver,
    abletonSender = $__2.abletonSender;
var processedSequences = ($__generatorModuleManager__ = require("./generatorModuleManager"), $__generatorModuleManager__ && $__generatorModuleManager__.__esModule && $__generatorModuleManager__ || {default: $__generatorModuleManager__}).processedSequences;
var sequenceSubscribe = abletonReceiver.sequencePlayRequests;
var $__default = function(time, resetMessages, sequenceFeedback) {
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
    var $__8,
        $__9;
    console.log("subscribedSequences", subscribedSequences);
    var needToBeStopped = ($__8 = _).without.apply($__8, $traceurRuntime.spread([Object.keys(playingSequences)], _.pluck(subscribedSequences, "path")));
    for (var $__4 = needToBeStopped[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__5; !($__5 = $__4.next()).done; ) {
      let seqPath = $__5.value;
      {
        playingSequences[seqPath].stop();
        delete playingSequences[seqPath];
      }
    }
    var needToPlay = ($__9 = _).without.apply($__9, $traceurRuntime.spread([_.pluck(subscribedSequences, "path")], Object.keys(playingSequences)));
    console.log("availableSequences", availableSequences);
    console.log("needToPlay", needToPlay);
    for (var $__6 = needToPlay[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__7; !($__7 = $__6.next()).done; ) {
      let seqPath = $__7.value;
      {
        if (availableSequences[seqPath])
          instrumentPlayer(availableSequences[seqPath]);
      }
    }
    resetRequests.plug(Bacon.fromArray(needToPlay));
  }
  sequenceSubscribe.onValue((function(sub) {
    console.log("subscribeRequest", sub);
    if (!availableSequences[sub.path] || !availableSequences[sub.path].evaluatedDetails || !availableSequences[sub.path].evaluatedDetails[sub.name] || !availableSequences[sub.path].evaluatedDetails[sub.name].playable) {
      console.warn("tried subscribing to " + sub.name + " but not available or playable", availableSequences[sub.path]);
      return;
    }
    console.log("subscribing", sub.path);
    if (_.find(subscribedSequences, (function(s) {
      return s.port == sub.port && s.path == sub.path;
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
      return s.path == seq.device + "/" + seq.name;
    })).port;
    console.log("creating instrument for", seq.device + "/" + seq.name, port);
    var seqInst = abletonSender.subscribeInstrument(seq.device + "/" + seq.name, port);
    playingSequences[seq.device + "/" + seq.name] = {
      stop: playSequencer(Sequencer(seq.sequence, seq.device + "/" + seq.name), seqInst, seq.name, seq.device),
      sequence: seq.sequence,
      name: seq.name,
      path: seq.device + "/" + seq.name,
      device: seq.device,
      port: port
    };
  };
  resetMessages.onValue((function() {
    for (var $__4 = Object.keys(playingSequences)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__5; !($__5 = $__4.next()).done; ) {
      let seqPath = $__5.value;
      {
        playingSequences[seqPath].stop();
        console.log("after reset recreating instrumentPlayer for ", seqPath, playingSequences[seqPath]);
        instrumentPlayer(playingSequences[seqPath]);
      }
    }
  }));
  processedSequences.onValue((function(seq) {
    if (seq.evaluatedError) {
      console.error("not processing", seq.device, "due to error", seq.evaluatedError);
      return;
    }
    availableSequences[seq.device + "/" + seq.name] = seq;
    console.log("terminating ", seq.device + "/" + seq.name, "in playingSequences", playingSequences);
    if (playingSequences[seq.device + "/" + seq.name]) {
      playingSequences[seq.device + "/" + seq.name].stop();
      instrumentPlayer(seq);
    }
  }));
  return {
    playingSequences: playingSequences,
    availableSequences: availableSequences,
    resetRequests: resetRequests
  };
};
