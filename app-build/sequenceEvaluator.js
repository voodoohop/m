"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__wrapSequenceError__,
    $__sequenceEvalSandbox__;
var vm = require("vm");
var _ = require("lodash");
var stackTrace = require("stack-trace");
var wrapError = ($__wrapSequenceError__ = require("./wrapSequenceError"), $__wrapSequenceError__ && $__wrapSequenceError__.__esModule && $__wrapSequenceError__ || {default: $__wrapSequenceError__}).default;
var sandbox = ($__sequenceEvalSandbox__ = require("./sequenceEvalSandbox"), $__sequenceEvalSandbox__ && $__sequenceEvalSandbox__.__esModule && $__sequenceEvalSandbox__ || {default: $__sequenceEvalSandbox__}).default;
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
    var playableSequence = seq.toPlayable().take(sampleSize);
    var testerCode = "result = sequence.toArray();";
    var globalBack = {};
    for (var $__2 = Object.keys(sequenceSandbox)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__3; !($__3 = $__2.next()).done; ) {
      let key = $__3.value;
      {
        globalBack[key] = global[key];
        global[key] = sequenceSandbox[key];
      }
    }
    globalBack.sequence = global.sequence;
    global.sequence = playableSequence;
    var startTime = process.hrtime();
    var testSeqResult = null;
    var timeTaken;
    try {
      console.log("global m before running code", global["m"]);
      testSeqResult = vm.runInThisContext(testerCode, {timeout: 2500});
      timeTaken = process.hrtime() - startTime;
    } catch (e) {
      console.log("exception while trying to generate events", e.stack, e, seq);
      res.playable = false;
      res.evaluatedError = wrapError(e, sequenceContext, seq.name);
    }
    for (var $__4 = Object.keys(globalBack)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__5; !($__5 = $__4.next()).done; ) {
      let key = $__5.value;
      global[key] = globalBack[key];
    }
    if (!res.evaluatedError && testSeqResult && testSeqResult.length > 0) {
      var lastBeatTime = testSeqResult[testSeqResult.length - 1].time;
      console.log("testSeqResult", lastBeatTime, timeTaken);
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
  console.log("now create sequences using regular new Function becasue it seems like garbage collection is fucking with me");
  return [sequences, passedTests];
}
var $__default = evalSequences;
;
