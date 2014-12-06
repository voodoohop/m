"use strict";
var $__functionalMonads__,
    $__time__,
    $__oscAbleton__,
    $__utils__,
    $__webConnection__,
    $__sequencePlayManager__,
    $__codeStore__;
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
var webServer = ($__webConnection__ = require("./webConnection"), $__webConnection__ && $__webConnection__.__esModule && $__webConnection__ || {default: $__webConnection__}).default;
var SequencePlayManager = ($__sequencePlayManager__ = require("./sequencePlayManager"), $__sequencePlayManager__ && $__sequencePlayManager__.__esModule && $__sequencePlayManager__ || {default: $__sequencePlayManager__}).default;
var sequencePlayManager = SequencePlayManager(abletonReceiver.sequencePlayRequests, abletonSender, timeThatAccountsForTransportJumps.toEventStream(), resetMessages, webServer.sequenceFeedback);
liveCodeReset.plug(sequencePlayManager.resetRequests);
var $__6 = ($__codeStore__ = require("./codeStore"), $__codeStore__ && $__codeStore__.__esModule && $__codeStore__ || {default: $__codeStore__}),
    baconStore = $__6.baconStore,
    codeStore = $__6.codeStore,
    onCodeLoaded = $__6.onCodeLoaded;
var clipSequences;
onCodeLoaded(function() {
  codeStore.get("abletonClip", function(err, doc) {
    clipSequences = compileSequences(doc);
    console.log("loaded previous clip sequences", clipSequences);
  });
});
var seqLoader = {get: (function(m) {
    console.log("requestes sequences from", m);
    var importableSequences = _.defaults({}, clipSequences, _.mapValues(sequencePlayManager.availableSequences, (function(p) {
      return p.sequence;
    })));
    console.log("importableSequences", importableSequences);
    return importableSequences;
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
          $__9 = 0; $__9 < arguments.length; $__9++)
        m[$__9] = arguments[$__9];
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
    for (var $__7 = Object.keys(sequences)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__8; !($__8 = $__7.next()).done; ) {
      let k = $__8.value;
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
  console.log("created clip seq from clipNotes", {
    device: "abletonClip",
    name: v.name,
    sequence: seq
  });
  return {
    device: "abletonClip",
    name: v.name,
    sequence: seq
  };
});
baconStore.plug(clipSequences);
var clipAndCodeSequences = compiledSequences.merge(clipSequences);
sequencePlayManager.newSequence.plug(clipAndCodeSequences);
var resetNo = 0;
clipAndCodeSequences.onValue((function() {
  return liveCodeReset.push(resetNo++);
}));
var Immutable = require("immutable");
var generatorList = clipAndCodeSequences.scan({}, (function(prev, next) {
  console.log("generating first 500 samples of sequence", next);
  prev[next.name] = {
    name: next.name,
    sequenceAsString: next.sequence.toString(),
    eventSample: next.sequence.toPlayable().take(500).takeWhile((function(n) {
      return n.time < 16;
    })).toArray()
  };
  console.log("generated");
  return prev;
})).map(_.values).debounce(300);
generatorList.onValue((function(v) {
  webServer.generatorUpdate(v);
  abletonSender.generatorUpdate(v);
}));
