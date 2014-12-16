"use strict";
var $__patchConsoleLog__,
    $__functionalMonads__,
    $__time__,
    $__wu__,
    $__oscAbleton__,
    $__utils__,
    $__generatorModuleManager__,
    $__webConnection__,
    $__sequencePlayManager__,
    $__codeStore__;
require('traceur/bin/traceur-runtime');
require('stack-displayname');
($__patchConsoleLog__ = require("./patchConsoleLog"), $__patchConsoleLog__ && $__patchConsoleLog__.__esModule && $__patchConsoleLog__ || {default: $__patchConsoleLog__});
var teoria = require("teoria");
var m = ($__functionalMonads__ = require("./functionalMonads"), $__functionalMonads__ && $__functionalMonads__.__esModule && $__functionalMonads__ || {default: $__functionalMonads__}).m;
var t = ($__time__ = require("./time"), $__time__ && $__time__.__esModule && $__time__ || {default: $__time__}).t;
var wu = ($__wu__ = require("./wu"), $__wu__ && $__wu__.__esModule && $__wu__ || {default: $__wu__}).wu;
var $__3 = ($__oscAbleton__ = require("./oscAbleton"), $__oscAbleton__ && $__oscAbleton__.__esModule && $__oscAbleton__ || {default: $__oscAbleton__}),
    abletonReceiver = $__3.abletonReceiver,
    abletonSender = $__3.abletonSender;
var $__4 = ($__utils__ = require("./utils"), $__utils__ && $__utils__.__esModule && $__utils__ || {default: $__utils__}),
    isIterable = $__4.isIterable,
    getIterator = $__4.getIterator,
    clone = $__4.clone;
var moduleManager = ($__generatorModuleManager__ = require("./generatorModuleManager"), $__generatorModuleManager__ && $__generatorModuleManager__.__esModule && $__generatorModuleManager__ || {default: $__generatorModuleManager__});
var _ = require("lodash");
var Bacon = require("baconjs");
var traceur = require("traceur");
var liveCodeReset = new Bacon.Bus();
var lastCodeResetNo = -1;
var decodedTime = abletonReceiver.time.diff(0, (function(a, b) {
  return b - a;
})).skip(1).zip(abletonReceiver.time.skip(1), (function(timeDiff, time) {
  return {
    timeDiff: timeDiff,
    time: time
  };
})).map((function(time) {
  return time.timeDiff < -8 ? _.extend({reset: true}, time) : time;
})).combine(liveCodeReset.debounceImmediate(500).toProperty(), function(time, codeReset) {
  if (lastCodeResetNo != codeReset) {
    console.log("RESET", time, codeReset);
    lastCodeResetNo = codeReset;
    return _.extend({reset: true}, time);
  }
  return time;
}).scan({}, (function(prev, time) {
  var newTime = _.clone(time);
  if (prev.firstTime > 0 && !time.reset)
    newTime.firstTime = prev.firstTime;
  else
    newTime.firstTime = time.time - time.time % t.bars(4);
  return newTime;
}));
var timeThatAccountsForTransportJumps2 = decodedTime.map((function(t) {
  return {
    time: t.time - t.firstTime,
    offset: t.firstTime
  };
}));
var timeThatAccountsForTransportJumps = timeThatAccountsForTransportJumps2;
var resetMessages = decodedTime.map((function(t) {
  return t.reset;
})).filter((function(t) {
  return t;
})).debounce(50);
timeThatAccountsForTransportJumps.throttle(1000).log("timeWithOffset");
resetMessages.log("RESET");
var webServer = ($__webConnection__ = require("./webConnection"), $__webConnection__ && $__webConnection__.__esModule && $__webConnection__ || {default: $__webConnection__}).default;
var SequencePlayManager = ($__sequencePlayManager__ = require("./sequencePlayManager"), $__sequencePlayManager__ && $__sequencePlayManager__.__esModule && $__sequencePlayManager__ || {default: $__sequencePlayManager__}).default;
var sequencePlayManager = SequencePlayManager(timeThatAccountsForTransportJumps.toEventStream(), resetMessages, webServer.sequenceFeedback);
liveCodeReset.plug(sequencePlayManager.resetRequests);
var $__7 = ($__codeStore__ = require("./codeStore"), $__codeStore__ && $__codeStore__.__esModule && $__codeStore__ || {default: $__codeStore__}),
    baconStorer = $__7.baconStorer,
    onCodeLoaded = $__7.onCodeLoaded,
    storedSequences = $__7.storedSequences;
var Easer = require('functional-easing').Easer;
webServer.beatFeedback(timeThatAccountsForTransportJumps.toEventStream().map((function(t) {
  return Math.floor(t.time);
})).skipDuplicates());
var newClipSequences = abletonReceiver.clipNotes.map(function(v) {
  var notes = _.sortBy(v.notes, (function(n) {
    return n.time;
  }));
  var seq = m.data(notes.map((function(n) {
    return {
      pitch: n.pitch,
      duration: n.duration,
      velocity: n.velocity / 127,
      time: n.time,
      color: "yellow"
    };
  }))).loopLength(v.loopEnd - v.loopStart);
  console.log("created clip seq from clipNotes", {
    device: "abletonClip",
    name: v.name
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
  for (var $__8 = storedSequences[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__9; !($__9 = $__8.next()).done; ) {
    var seq = $__9.value;
    {
      moduleManager.newSequenceCode.push({
        device: seq.device,
        code: seq.code
      });
    }
  }
}, 100);
sequencePlayManager.newSequence.plug(moduleManager.processedSequences);
var Immutable = require("immutable");
var generatorList = moduleManager.processedSequences.scan({}, (function(prev, next) {
  console.log("generating first 500 samples of sequence", next);
  prev[next.device + "/" + next.name] = {
    device: next.device,
    name: next.name,
    sourceCode: next.code,
    sequenceAsString: next.sequence && next.sequence.toString(),
    eventSample: next.evaluated ? next.evaluatedDetails[next.name].eventSample : [],
    evaluatedError: next.evaluatedError,
    evaluatedDetails: next.evaluated ? next.evaluatedDetails[next.name] : null
  };
  console.log("generated", next.device + "/" + next.name);
  return prev;
})).map(_.values).debounce(50);
baconStorer.plug(moduleManager.processedSequences);
generatorList.onValue((function(v) {
  console.log("sending genList to ableton", v.map((function(v) {
    return v.device + "/" + v.name;
  })));
  abletonSender.generatorUpdate(v);
}));
moduleManager.evaluated.onValue((function(v) {
  return webServer.individualGeneratorUpdate(v);
}));
