"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__wrapSequenceError__,
    $__sequenceEvalSandbox__,
    $__lib_47_hrtimer__;
var vm = require("vm");
var _ = require("lodash");
var stackTrace = require("stack-trace");
var wrapError = ($__wrapSequenceError__ = require("./wrapSequenceError"), $__wrapSequenceError__ && $__wrapSequenceError__.__esModule && $__wrapSequenceError__ || {default: $__wrapSequenceError__}).default;
var sandbox = ($__sequenceEvalSandbox__ = require("./sequenceEvalSandbox"), $__sequenceEvalSandbox__ && $__sequenceEvalSandbox__.__esModule && $__sequenceEvalSandbox__ || {default: $__sequenceEvalSandbox__}).default;
var hrTimer = ($__lib_47_hrtimer__ = require("./lib/hrtimer"), $__lib_47_hrtimer__ && $__lib_47_hrtimer__.__esModule && $__lib_47_hrtimer__ || {default: $__lib_47_hrtimer__}).default;
function getSequenceGenerator(code, loadedSequences, seqContext) {
  var sequenceSandbox = sandbox(loadedSequences, seqContext, false);
  var availableGlobals = _.keys(sequenceSandbox);
  var f = new (Function.prototype.bind.apply(Function, $traceurRuntime.spread([null], availableGlobals, ["return " + code])))();
  console.log("evaluating code:\n" + "return " + code);
  var globals = availableGlobals.map((function(k) {
    return sequenceSandbox[k];
  }));
  console.log("running sequences on", availableGlobals, globals);
  return (function() {
    return f.apply(null, $traceurRuntime.spread(globals));
  });
}
var testIfSeqEmitsNotes = function(sequences, sequenceSandbox, sequenceContext) {
  console.log("seq res".bgYellow, sequences, sequenceContext);
  return _.mapValues(sequences, (function(seq) {
    var res = {playable: false};
    if (!seq) {
      res.error = new Error("seq is falsy");
      return res;
    }
    res.isSequenceGenerator = seq.isTom;
    if (!res.isSequenceGenerator)
      return res;
    var sampleSize = 100;
    var playableSequence = seq.toPlayable().take(sampleSize).takeWhile((function(n) {
      return n.time < 16;
    }));
    var testerCode = "result = sequence.toArray();";
    var globalBack = {};
    for (var $__3 = Object.keys(sequenceSandbox)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__4; !($__4 = $__3.next()).done; ) {
      let key = $__4.value;
      {
        globalBack[key] = global[key];
        global[key] = sequenceSandbox[key];
      }
    }
    globalBack.sequence = global.sequence;
    global.sequence = playableSequence;
    var startTime = hrTimer();
    var testSeqResult = null;
    var timeTaken;
    try {
      console.log("global m before running code", global["m"]);
      testSeqResult = vm.runInThisContext(testerCode, {timeout: 2500});
      timeTaken = hrTimer(startTime);
    } catch (e) {
      console.log("exception while trying to generate events", e.stack, e, seq);
      res.playable = false;
      res.evaluatedError = wrapError(e, sequenceContext, seq.name);
    }
    for (var $__5 = Object.keys(globalBack)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__6; !($__6 = $__5.next()).done; ) {
      let key = $__6.value;
      global[key] = globalBack[key];
    }
    if (!res.evaluatedError && testSeqResult && testSeqResult.length >= 0) {
      var lastBeatTime = 0;
      if (testSeqResult.length > 0)
        lastBeatTime = testSeqResult[testSeqResult.length - 1].time;
      console.log("testSeqResult", lastBeatTime, timeTaken, testSeqResult);
      res.playable = true;
      res.eventSample = testSeqResult;
      res.timeTaken = timeTaken;
      res.timePerEvent = timeTaken / sampleSize;
      res.beatsPerTime = lastBeatTime / timeTaken;
    }
    return res;
  }));
};
function evalSequences(seqContext, loadedSequences) {
  var code = seqContext.processedCode;
  var seqGen = getSequenceGenerator(code, loadedSequences, seqContext);
  var sequenceSandbox = sandbox(loadedSequences, seqContext, console.log);
  var sequences = null;
  var passedTests = false;
  var error = null;
  try {
    console.log("running seqGen");
    global.seqGen = seqGen;
    sequences = vm.runInThisContext("seqGen();", {timeout: 500});
  } catch (e) {
    console.log("exception in live code", e.stack);
    error = wrapError(e, seqContext);
  }
  if (error === null) {
    console.log("testing if sequences emit events", Object.keys(sequences));
    var testedSequences = testIfSeqEmitsNotes(sequences, sequenceSandbox, seqContext);
    console.log("testedSequences".bgYellow, testedSequences);
    passedTests = testedSequences;
  }
  if (passedTests && error === null)
    sequences = seqGen();
  if (sequences == null || !passedTests)
    return [null, false, error];
  return [sequences, passedTests];
}
var $__default = evalSequences;
;
