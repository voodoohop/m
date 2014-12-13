"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__sequenceEvalSandbox__;
var vm = require("vm");
var _ = require("lodash");
var sandbox = ($__sequenceEvalSandbox__ = require("./sequenceEvalSandbox"), $__sequenceEvalSandbox__ && $__sequenceEvalSandbox__.__esModule && $__sequenceEvalSandbox__ || {default: $__sequenceEvalSandbox__}).default;
var testIfSeqEmitsNotes = function(sequences, sequenceSandbox) {
  console.log("seq res".bgYellow, sequences);
  return _.mapValues(sequences, (function(seq) {
    var res = {};
    res.isSequenceGenerator = seq.isTom;
    if (!res.isSequenceGenerator)
      return res;
    var playableSequence = seq.toPlayable().take(30).takeWhile((function(n) {
      return n.time < 4;
    }));
    var testerCode = "result = sequence.toArray()";
    console.log("testing playableSequence:".bgYellow, seq, playableSequence);
    try {
      var testSeqResult = vm.runInNewContext(testerCode, {
        traceurRuntime: $traceurRuntime,
        sequence: playableSequence,
        console: sequenceSandbox.console
      }, {timeout: 1000});
      res.playable = true;
      res.eventSample = testSeqResult;
    } catch (e) {
      console.log("exception while trying to generate events", e.stack, e);
      res.playable = false;
    }
    return res;
  }));
};
function evalSequences(code, loadedSequences) {
  var sequenceSandbox = sandbox(loadedSequences);
  var sequences = null;
  var passedTests = false;
  var error = null;
  try {
    var availableGlobals = Object.keys(sequenceSandbox);
    var f = new (Function.prototype.bind.apply(Function, $traceurRuntime.spread([null], availableGlobals, ["return " + code])))();
    var globals = _.values(sequenceSandbox);
    sequences = f.apply(null, $traceurRuntime.spread(globals));
    console.log("testing if sequences emit events", Object.keys(sequences));
    var testedSequences = testIfSeqEmitsNotes(sequences, sequenceSandbox);
    console.log("testedSequences".bgYellow, testedSequences);
    passedTests = testedSequences;
  } catch (e) {
    console.log("exception in live code", e.stack);
    error = ["exception in live code", e.stack];
  }
  if (sequences == null || !passedTests)
    return [null, false, error];
  return [sequences, passedTests];
}
var $__default = evalSequences;
;

//# sourceMappingURL=sequenceEvaluator.map
