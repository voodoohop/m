"use strict";
Object.defineProperties(exports, {
  newPlayingClip: {get: function() {
      return newPlayingClip;
    }},
  getSequence: {get: function() {
      return getSequence;
    }},
  __esModule: {value: true}
});
var $__oscAbleton__,
    $__functionalMonads__,
    $__lib_47_logger__;
var $__0 = ($__oscAbleton__ = require("./oscAbleton"), $__oscAbleton__ && $__oscAbleton__.__esModule && $__oscAbleton__ || {default: $__oscAbleton__}),
    abletonReceiver = $__0.abletonReceiver,
    time = $__0.time;
var m = ($__functionalMonads__ = require("./functionalMonads"), $__functionalMonads__ && $__functionalMonads__.__esModule && $__functionalMonads__ || {default: $__functionalMonads__}).m;
var log = ($__lib_47_logger__ = require("./lib/logger"), $__lib_47_logger__ && $__lib_47_logger__.__esModule && $__lib_47_logger__ || {default: $__lib_47_logger__}).default;
var devicesWantingClip = {};
var livePlayingClips = {};
var subscribeRequests = {};
abletonReceiver.sequencePlayRequests.skipDuplicates((function(a, b) {
  return "" + a.port + "_" + a.device == "" + b.port + "_" + b.device;
})).onValue((function(sub) {
  subscribeRequests[sub.port] = sub.device;
}));
var ableTime = 0;
abletonReceiver.time.onValue((function(v) {
  return ableTime = v;
}));
var _ = require("lodash");
function createHotSwappableSequence(object, fieldName) {
  log.info("creating hot swappable sequence");
  var seq = m().evt({
    pitch: 60,
    duration: 0.1,
    velocity: 0.1
  }).metro(4);
  log.info("created hot swappable sequence: " + seq);
  var swapper = {};
  return {
    swapper: swapper,
    currentSequence: seq.hotSwapper(swapper, "swapSequence")
  };
}
var newPlayingClip = abletonReceiver.playingClipNotes.map(function(v) {
  log.info("received new playing clip at time", ableTime, v);
  var notes = _.sortBy(v.clip.notes, (function(n) {
    return n.time;
  }));
  var seq = m().data(notes.map((function(n) {
    return {
      pitch: n.pitch,
      duration: n.duration - 0.01,
      velocity: n.velocity / 127,
      time: n.time,
      color: "yellow"
    };
  }))).loopLength(v.clip.loopEnd - v.clip.loopStart).setMetaData({port: v.port});
  return {
    port: v.port,
    sequence: seq,
    name: v.clip.name
  };
});
newPlayingClip.onValue(function(v) {
  log.info("new playing sequence", v);
  log.info("updating livePlayingCLips which should trigger a hotSwap", livePlayingClips);
  if (livePlayingClips[v.port])
    livePlayingClips[v.port].swapper.swapSequence = v.sequence;
  else {
    var swapper = {};
    livePlayingClips[v.port] = {
      swapper: swapper,
      currentSequence: v.sequence.hotSwapper(swapper, "swapSequence")
    };
  }
  log.info("playing in live", livePlayingClips);
});
function getSequence(device) {
  log.info("got request for playing sequence from device", device);
  log.info("looking for subscribed sequence", _.pairs(subscribeRequests), device);
  var subscription = _.find(_.pairs(subscribeRequests), (function(sub) {
    log.info(sub, sub[1] === device, livePlayingClips[sub[0]]);
    return sub[1] === device && livePlayingClips[sub[0]];
  }));
  log.info("result", subscription);
  if (subscription) {
    console.log("found subscription ", subscription);
    return livePlayingClips[subscription[0]].currentSequence;
  }
  var wanting = _.find(_.pairs(subscribeRequests), (function(sub) {
    return sub[1] === device;
  }));
  if (wanting) {
    log.info("couldn't find subscription, creating hot swappable sequence for ", wanting);
    livePlayingClips[wanting[0]] = createHotSwappableSequence(livePlayingClips, wanting[0]);
    return livePlayingClips[wanting[0]].currentSequence;
  }
  log.info("returning dummy because there was nothing to be found");
  return m().evt({
    pitch: 60,
    duration: 0.1,
    velocity: 0.9
  }).metro(3);
}
