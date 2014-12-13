"use strict";
Object.defineProperties(exports, {
  newSequenceCode: {get: function() {
      return newSequenceCode;
    }},
  loadedSequences: {get: function() {
      return loadedSequences;
    }},
  processedSequences: {get: function() {
      return processedSequences;
    }},
  __esModule: {value: true}
});
var $__utils__,
    $__sequenceEvaluator__,
    $__sequenceCodeProcessor__;
var Bacon = require("baconjs");
var Immutable = require("immutable");
var $__0 = ($__utils__ = require("./utils"), $__utils__ && $__utils__.__esModule && $__utils__ || {default: $__utils__}),
    isIterable = $__0.isIterable,
    getIterator = $__0.getIterator,
    clone = $__0.clone;
var evalSequences = ($__sequenceEvaluator__ = require("./sequenceEvaluator"), $__sequenceEvaluator__ && $__sequenceEvaluator__.__esModule && $__sequenceEvaluator__ || {default: $__sequenceEvaluator__}).default;
var _ = require("lodash");
var newSequenceCode = new Bacon.Bus();
var fs = require("fs"),
    mkpath = require("mkpath");
var processCode = ($__sequenceCodeProcessor__ = require("./sequenceCodeProcessor"), $__sequenceCodeProcessor__ && $__sequenceCodeProcessor__.__esModule && $__sequenceCodeProcessor__ || {default: $__sequenceCodeProcessor__}).default;
var processed = newSequenceCode.map(processCode);
processed.onError((function(e) {
  return console.error("Error while processing code", e);
}));
var loadedSequenceStream = new Bacon.Bus();
var evalStreamEntry = function(loadedSequences, newSequence) {
  var newSeqIm = Immutable.fromJS(newSequence);
  console.log("evaluating new Sequence:".underline.bold, newSeqIm.get("device"));
  var allExports = loadedSequences.valueSeq().map((function(v) {
    return v.get("exports");
  })).flatten();
  var unsatisfiedImports = newSeqIm.get("imports").entrySeq().filter((function(i) {
    var $__3 = i,
        importDevice = $__3[0],
        importSeqNames = $__3[1];
    return !loadedSequences.get(importDevice) || !importSeqNames.isSuperset(loadedSequences.get(importDevice).get("exports"));
  }));
  if (unsatisfiedImports.count() > 0) {
    console.log("imports unSatisfied".bold.red, unsatisfiedImports.toJS());
    console.log("existing exports".bold, loadedSequences.entrySeq().map((function(s) {
      return ({
        name: s[0],
        exports: s[1].get("exports").toJS()
      });
    })).toJS());
    return newSeqIm.set("evaluatedError", Immutable.Map({
      type: "importsUnsatisfied",
      msg: "imports unsatisfied",
      imports: unsatisfiedImports
    }));
  }
  var $__3 = evalSequences(newSequence.processedCode, loadedSequences),
      evaluated = $__3[0],
      details = $__3[1],
      error = $__3[2];
  var evaluatedRes = null;
  if (!details) {
    console.error("eval of ", newSequence, "FAILED!!!".bold.red);
    evaluatedRes = Immutable.fromJS(newSequence).set("evaluatedError", error);
  } else
    evaluatedRes = Immutable.fromJS(newSequence).merge({
      evaluated: evaluated,
      evaluatedDetails: details
    });
  return evaluatedRes;
};
var processedAndReEval = new Bacon.Bus();
processedAndReEval.plug(processed.skipErrors());
var markForReEval = function(loadedSequences, device) {
  loadedSequences.entrySeq().forEach((function(s) {
    var $__3 = s,
        seqName = $__3[0],
        seq = $__3[1];
    if (seq.get("imports").get(device)) {
      console.log("marking ".bgMagenta, ("" + seqName).underline, "for reEvaluation");
      processedAndReEval.push(seq.toJS());
      markForReEval(loadedSequences, seq.get("device"));
    }
  }));
};
var evaluated = Bacon.zipAsArray(loadedSequenceStream, processedAndReEval).map((function(s) {
  var res = evalStreamEntry.apply(null, $traceurRuntime.spread(s));
  var loadedSequences = s[0];
  var newSequence = s[1];
  if (!res.get("evaluatedError"))
    markForReEval(loadedSequences, newSequence.device);
  return res;
}));
var evaluatedSequenceStream = evaluated.skipErrors().scan(Immutable.Map(), (function(prev, next) {
  return prev.set(next.get("device"), next);
}));
loadedSequenceStream.plug(evaluatedSequenceStream);
var loadedSequences = evaluatedSequenceStream;
var processedSequences = evaluated.filter((function(n) {
  return n.get("evaluated");
})).flatMap((function(n) {
  var n = n.toJS();
  return Bacon.fromArray(Object.keys(n.evaluated).map((function(seqName) {
    return _.extend(n, {
      sequence: n.evaluated[seqName],
      device: n.device,
      name: seqName
    });
  })));
}));

//# sourceMappingURL=generatorModuleManager.map
