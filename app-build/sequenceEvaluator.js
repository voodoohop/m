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
var microtime = require("microtime");
var stackTrace = require("stack-trace");
var wrapError = ($__wrapSequenceError__ = require("./wrapSequenceError"), $__wrapSequenceError__ && $__wrapSequenceError__.__esModule && $__wrapSequenceError__ || {default: $__wrapSequenceError__}).default;
var sandbox = ($__sequenceEvalSandbox__ = require("./sequenceEvalSandbox"), $__sequenceEvalSandbox__ && $__sequenceEvalSandbox__.__esModule && $__sequenceEvalSandbox__ || {default: $__sequenceEvalSandbox__}).default;
var testIfSeqEmitsNotes = function(sequences, sequenceSandbox, sequenceContext) {
  return _.mapValues(sequences, (function(seq) {
    var res = {};
    res.isSequenceGenerator = seq.isTom;
    if (!res.isSequenceGenerator)
      return res;
    var sampleSize = 500;
    var playableSequence = seq.toPlayable().take(500);
    var testerCode = "result = sequence.toArray();";
    var globalBack = {};
    for (var $__2 = Object.keys(sequenceSandbox)[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
        $__3; !($__3 = $__2.next()).done; ) {
      let key = $__3.value;
      {
        globalBack[$traceurRuntime.toProperty(key)] = global[$traceurRuntime.toProperty(key)];
        global[$traceurRuntime.toProperty(key)] = sequenceSandbox[$traceurRuntime.toProperty(key)];
      }
    }
    globalBack.sequence = global.sequence;
    global.sequence = playableSequence;
    var startTime = microtime.nowDouble();
    var testSeqResult = null;
    var timeTaken;
    try {
      testSeqResult = vm.runInThisContext(testerCode, {timeout: 3000});
      timeTaken = microtime.nowDouble() - startTime;
    } catch (e) {
      console.log("exception while trying to generate events", e.stack, e, seq);
      res.playable = false;
      res.evaluatedError = wrapError(e, sequenceContext, seq.name);
    }
    for (var $__4 = Object.keys(globalBack)[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
        $__5; !($__5 = $__4.next()).done; ) {
      let key = $__5.value;
      global[$traceurRuntime.toProperty(key)] = globalBack[$traceurRuntime.toProperty(key)];
    }
    if (!res.evaluatedError && testSeqResult && testSeqResult.length > 0) {
      var lastBeatTime = testSeqResult[$traceurRuntime.toProperty(testSeqResult.length - 1)].time;
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
  var sequenceSandbox = sandbox(loadedSequences);
  var sequences = null;
  var passedTests = false;
  var error = null;
  var globalBack = {};
  for (var $__2 = Object.keys(sequenceSandbox)[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
      $__3; !($__3 = $__2.next()).done; ) {
    let key = $__3.value;
    {
      globalBack[$traceurRuntime.toProperty(key)] = global[$traceurRuntime.toProperty(key)];
      global[$traceurRuntime.toProperty(key)] = sequenceSandbox[$traceurRuntime.toProperty(key)];
    }
  }
  try {
    sequences = vm.runInThisContext(code, {timeout: 500});
  } catch (e) {
    console.log("exception in live code", e.stack);
    error = wrapError(e, seqContext);
  }
  for (var $__4 = Object.keys(globalBack)[$traceurRuntime.toProperty($traceurRuntime.toProperty(Symbol.iterator))](),
      $__5; !($__5 = $__4.next()).done; ) {
    let key = $__5.value;
    global[$traceurRuntime.toProperty(key)] = globalBack[$traceurRuntime.toProperty(key)];
  }
  console.log("testing if sequences emit events", Object.keys(sequences));
  var testedSequences = testIfSeqEmitsNotes(sequences, sequenceSandbox, seqContext);
  console.log("testedSequences".bgYellow, testedSequences);
  passedTests = testedSequences;
  if (sequences == null || !passedTests)
    return [null, false, error];
  return [sequences, passedTests];
}
var $__default = evalSequences;
;
