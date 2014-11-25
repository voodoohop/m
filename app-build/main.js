"use strict";
var $__functionalMonads__,
    $__time__,
    $__oscAbleton__,
    $__utils__,
    $__webServer__,
    $__sequencePlayManager__;
var teoria = require("teoria");
var FunctionalMusic = ($__functionalMonads__ = require("./functionalMonads"), $__functionalMonads__ && $__functionalMonads__.__esModule && $__functionalMonads__ || {default: $__functionalMonads__}).FunctionalMusic;
var t = ($__time__ = require("./time"), $__time__ && $__time__.__esModule && $__time__ || {default: $__time__}).t;
var $__2 = ($__oscAbleton__ = require("./oscAbleton"), $__oscAbleton__ && $__oscAbleton__.__esModule && $__oscAbleton__ || {default: $__oscAbleton__}),
    AbletonReceiver = $__2.AbletonReceiver,
    AbletonSender = $__2.AbletonSender;
var $__3 = ($__utils__ = require("./utils"), $__utils__ && $__utils__.__esModule && $__utils__ || {default: $__utils__}),
    isIterable = $__3.isIterable,
    getIterator = $__3.getIterator,
    clone = $__3.clone;
var _ = require("lodash");
var Bacon = require("baconjs");
var m = FunctionalMusic();
var abletonSender = AbletonSender(8915);
var abletonReceiver = AbletonReceiver(8895);
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
var webServer = ($__webServer__ = require("./webServer"), $__webServer__ && $__webServer__.__esModule && $__webServer__ || {default: $__webServer__}).default;
var SequencePlayManager = ($__sequencePlayManager__ = require("./sequencePlayManager"), $__sequencePlayManager__ && $__sequencePlayManager__.__esModule && $__sequencePlayManager__ || {default: $__sequencePlayManager__}).default;
var sequencePlayManager = SequencePlayManager(abletonReceiver.sequencePlayRequests, abletonSender, timeThatAccountsForTransportJumps.toEventStream(), resetMessages, webServer.sequenceFeedback);
liveCodeReset.plug(sequencePlayManager.resetRequests);
var seqLoader = {get: (function(m) {
    return _.mapValues(sequencePlayManager.availableSequences, (function(p) {
      return p.sequence;
    }));
  })};
var Easer = require('functional-easing').Easer;
var compileSequences = function(code) {
  var sequences = null;
  var passedTests = false;
  try {
    var compiled = traceur.compile(code, {
      modules: "register",
      generators: "parse",
      blockBinding: "parse"
    });
    console.log("sequencesForLoading", seqLoader.get("bla"));
    var f = new Function("m", "t", "params", "teoria", "_", "System", "clone", "easer", "console", "return " + compiled);
    console.log("compiled", compiled);
    var remoteLog = function() {
      for (var m = [],
          $__8 = 0; $__8 < arguments.length; $__8++)
        m[$__8] = arguments[$__8];
      try {
        webServer.remoteLogger.push("" + m);
      } catch (e) {
        console.error("error sending log", e);
      }
    };
    sequences = f(m, t, abletonReceiver.param, teoria, _, seqLoader, clone, (function() {
      return new Easer();
    }), {
      log: remoteLog,
      warn: remoteLog,
      error: remoteLog
    });
    console.log("testing if sequence emits events");
    for (var $__6 = Object.keys(sequences)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__7; !($__7 = $__6.next()).done; ) {
      let k = $__7.value;
      {
        console.log("first 5 event of sequence", sequences[k].take(5).toArray());
      }
    }
    passedTests = true;
  } catch (e) {
    console.log("exception in live code", e.stack);
  }
  if (sequences == null || !passedTests)
    return false;
  return sequences;
};
webServer.beatFeedback(timeThatAccountsForTransportJumps.toEventStream().map((function(t) {
  return Math.floor(t.time);
})).skipDuplicates());
var compiledSequences = webServer.liveCode.flatMap(function(code) {
  let sequences = compileSequences(code.code);
  if (!sequences)
    return Bacon.never();
  var sequencesArray = _.pairs(sequences).map((function(s) {
    return {
      device: code.device,
      name: s[0],
      sequence: s[1]
    };
  }));
  return Bacon.fromArray(sequencesArray);
});
var clipSequences = abletonReceiver.clipNotes.map(function(v) {
  var notes = _.sortBy(v.notes, (function(n) {
    return n.time;
  }));
  var seq = m.data(notes.map((function(n) {
    return {
      pitch: n.pitch,
      duration: n.duration,
      velocity: n.velocity / 127,
      time: n.time
    };
  }))).loopLength(v.loopEnd - v.loopStart);
  return {
    device: "abletonClip",
    name: v.name,
    sequence: seq
  };
});
var clipAndCodeSequences = compiledSequences.merge(clipSequences);
sequencePlayManager.newSequence.plug(clipAndCodeSequences);
var resetNo = 0;
clipAndCodeSequences.onValue((function() {
  return liveCodeReset.push(resetNo++);
}));
var Immutable = require("immutable");
var generatorList = clipAndCodeSequences.scan(new Immutable.Set(), (function(prev, next) {
  return prev.add(next.name);
})).debounce(300);
generatorList.onValue((function(v) {
  webServer.generatorUpdate(v.toArray());
  abletonSender.generatorUpdate(v.toArray());
}));