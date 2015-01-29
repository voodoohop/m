"use strict";
var $__patchConsoleLog__,
    $__functionalMonads__,
    $__time__,
    $__lib_47_wu__,
    $__oscAbleton__,
    $__lib_47_utils__,
    $__generatorModuleManager__,
    $__lib_47_logger__,
    $__livePlayingClips__,
    $__syncedTime__,
    $__webConnection__,
    $__sequencePlayManager__,
    $__codeStore__;
($__patchConsoleLog__ = require("./patchConsoleLog"), $__patchConsoleLog__ && $__patchConsoleLog__.__esModule && $__patchConsoleLog__ || {default: $__patchConsoleLog__});
var teoria = require("teoria");
var m = ($__functionalMonads__ = require("./functionalMonads"), $__functionalMonads__ && $__functionalMonads__.__esModule && $__functionalMonads__ || {default: $__functionalMonads__}).m;
var t = ($__time__ = require("./time"), $__time__ && $__time__.__esModule && $__time__ || {default: $__time__}).t;
var wu = ($__lib_47_wu__ = require("./lib/wu"), $__lib_47_wu__ && $__lib_47_wu__.__esModule && $__lib_47_wu__ || {default: $__lib_47_wu__}).wu;
var $__3 = ($__oscAbleton__ = require("./oscAbleton"), $__oscAbleton__ && $__oscAbleton__.__esModule && $__oscAbleton__ || {default: $__oscAbleton__}),
    abletonReceiver = $__3.abletonReceiver,
    abletonSender = $__3.abletonSender;
var $__4 = ($__lib_47_utils__ = require("./lib/utils"), $__lib_47_utils__ && $__lib_47_utils__.__esModule && $__lib_47_utils__ || {default: $__lib_47_utils__}),
    isIterable = $__4.isIterable,
    getIterator = $__4.getIterator,
    clone = $__4.clone;
var moduleManager = ($__generatorModuleManager__ = require("./generatorModuleManager"), $__generatorModuleManager__ && $__generatorModuleManager__.__esModule && $__generatorModuleManager__ || {default: $__generatorModuleManager__});
var _ = require("lodash");
var log = ($__lib_47_logger__ = require("./lib/logger"), $__lib_47_logger__ && $__lib_47_logger__.__esModule && $__lib_47_logger__ || {default: $__lib_47_logger__}).default;
var Bacon = require("baconjs");
var liveClips = ($__livePlayingClips__ = require("./livePlayingClips"), $__livePlayingClips__ && $__livePlayingClips__.__esModule && $__livePlayingClips__ || {default: $__livePlayingClips__});
log.info("bunyasaan");
var $__6 = ($__syncedTime__ = require("./syncedTime"), $__syncedTime__ && $__syncedTime__.__esModule && $__syncedTime__ || {default: $__syncedTime__}),
    timeThatAccountsForTransportJumps = $__6.time,
    resetMessages = $__6.resetMessages;
timeThatAccountsForTransportJumps.throttle(1000).log("timeWithOffset");
resetMessages.log("RESET");
var webServer = ($__webConnection__ = require("./webConnection"), $__webConnection__ && $__webConnection__.__esModule && $__webConnection__ || {default: $__webConnection__}).default;
var SequencePlayManager = ($__sequencePlayManager__ = require("./sequencePlayManager"), $__sequencePlayManager__ && $__sequencePlayManager__.__esModule && $__sequencePlayManager__ || {default: $__sequencePlayManager__}).default;
var sequencePlayManager = SequencePlayManager(timeThatAccountsForTransportJumps.toEventStream(), resetMessages, webServer.sequenceFeedback);
timeThatAccountsForTransportJumps.throttle(1000).onValue((function() {
  return console.log("playing Sequences".bgMagenta.white, Object.keys(sequencePlayManager.playingSequences).map((function(seqPath) {
    return seqPath;
  })));
}));
var $__9 = ($__codeStore__ = require("./codeStore"), $__codeStore__ && $__codeStore__.__esModule && $__codeStore__ || {default: $__codeStore__}),
    baconStorer = $__9.baconStorer,
    onCodeLoaded = $__9.onCodeLoaded,
    storedSequences = $__9.storedSequences;
webServer.beatFeedback(timeThatAccountsForTransportJumps.toEventStream().map((function(t) {
  return Math.floor(t.time);
})).skipDuplicates());
var newClipSequences = abletonReceiver.clipNotes.map(function(v) {
  console.log("new clip sequence received from ableton", v);
  var notes = _.sortBy(v.notes, (function(n) {
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
  }))).loopLength(v.loopEnd - v.loopStart);
  console.log("created clip seq from clipNotes", {
    device: "abletonClip",
    name: v.name,
    sequence: seq
  });
  var code = "export var " + v.name + " = " + seq.toString() + ";";
  return {
    device: "abletonClip_" + v.name,
    code: code
  };
});
moduleManager.newSequenceCode.plug(newClipSequences);
moduleManager.newSequenceCode.plug(webServer.liveCode);
setTimeout(function() {
  console.log("CODE LOADED", storedSequences);
  moduleManager.newSequenceCode.push(_.find(storedSequences, (function(s) {
    return s.device === "userExtensions";
  })));
  for (var $__10 = storedSequences[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__11; !($__11 = $__10.next()).done; ) {
    var seq = $__11.value;
    {
      if (seq.device !== "userExtensions")
        moduleManager.newSequenceCode.push({
          device: seq.device,
          code: seq.code
        });
    }
  }
}, 100);
var Immutable = require("immutable");
var generatorList = moduleManager.processedSequences.scan({}, (function(prev, next) {
  if (next.evaluatedError) {
    console.error("ERROR", next.evaluatedError);
  }
  prev[next.device + "/" + next.name] = {
    evaluatedError: next.evaluatedError,
    device: next.device,
    name: next.name,
    sourceCode: next.code,
    sequenceAsString: next.sequence && next.sequence.toString(),
    eventSample: next.evaluated ? next.evaluatedDetails[next.name].eventSample : [],
    evaluatedDetails: next.evaluated ? next.evaluatedDetails[next.name] : null
  };
  console.log("generated", next.device + "/" + next.name);
  return prev;
})).map(_.values).debounce(50);
baconStorer.plug(moduleManager.processedSequences);
generatorList.map((function(gl) {
  return gl.filter((function(g) {
    return g.evaluatedDetails && g.evaluatedDetails.playable;
  }));
})).onValue((function(v) {
  console.log("sending genList to ableton", v.map((function(v) {
    return v.device + "/" + v.name;
  })));
  abletonSender.generatorUpdate(v);
}));
moduleManager.evaluated.onValue((function(v) {
  return webServer.individualGeneratorUpdate(v);
}));
