"use strict";
Object.defineProperties(exports, {
  newSequenceCode: {get: function() {
      return newSequenceCode;
    }},
  evaluated: {get: function() {
      return evaluated;
    }},
  loadedSequences: {get: function() {
      return loadedSequences;
    }},
  processedSequences: {get: function() {
      return processedSequences;
    }},
  __esModule: {value: true}
});
var $__lib_47_utils__,
    $__sequenceEvaluator__,
    $__sequenceCodeProcessor__;
var Bacon = require("baconjs");
var Immutable = require("immutable");
var $__0 = ($__lib_47_utils__ = require("./lib/utils"), $__lib_47_utils__ && $__lib_47_utils__.__esModule && $__lib_47_utils__ || {default: $__lib_47_utils__}),
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
  console.log("evaluating new Sequence:".underline, newSequence);
  var newSeqIm = Immutable.fromJS(newSequence);
  if (newSeqIm.get("error"))
    return newSeqIm;
  var allExports = loadedSequences.valueSeq().map((function(v) {
    return v.get("exports");
  })).flatten();
  var unsatisfiedImports = newSeqIm.get("imports").entrySeq().filter((function(i) {
    var $__3 = i,
        importDevice = $__3[0],
        importSeqNames = $__3[1];
    return !loadedSequences.get(importDevice) || !importSeqNames.isSubset(loadedSequences.get(importDevice).get("exports"));
  }));
  if (unsatisfiedImports.count() > 0) {
    console.log("imports unSatisfied".red, unsatisfiedImports.toJS());
    console.log("existing exports".bold, loadedSequences.entrySeq().map((function(s) {
      return ({
        name: s[0],
        exports: s[1].get("exports") && s[1].get("exports").toJS()
      });
    })).toJS());
    return newSeqIm.set("evaluatedError", Immutable.Map({
      type: "importsUnsatisfied",
      msg: "imports unsatisfied",
      imports: unsatisfiedImports
    }));
  }
  var $__3 = evalSequences(newSequence, loadedSequences),
      evaluated = $__3[0],
      details = $__3[1],
      error = $__3[2];
  var evaluatedRes = null;
  if (!details) {
    console.error("eval of ", newSequence, "FAILED!!!".red);
    evaluatedRes = Immutable.fromJS(newSequence).set("evaluatedError", error);
  } else
    evaluatedRes = Immutable.fromJS(newSequence).merge({
      evaluated: evaluated,
      evaluatedDetails: details,
      evaluatedError: error,
      error: error
    });
  return evaluatedRes;
};
var processedAndReEval = new Bacon.Bus();
processedAndReEval.plug(processed);
var markForReEval = function(loadedSequences, device) {
  loadedSequences.entrySeq().forEach((function(s) {
    var $__3 = s,
        seqName = $__3[0],
        seq = $__3[1];
    if (!seq) {
      console.error("seq is null at wrong place", seqName, seq);
      throw (new TypeError("seq is null," + seqName));
    }
    if (seq.get("imports") && seq.get("imports").get(device)) {
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
  markForReEval(loadedSequences, newSequence.device);
  return res;
}));
var stackTrace = require('stack-trace');
var evaluatedSequenceStream = evaluated.scan(Immutable.Map(), (function(prev, next) {
  return prev.set(next.get("device"), next);
}));
loadedSequenceStream.plug(evaluatedSequenceStream);
var loadedSequences = evaluatedSequenceStream;
var processedSequences_noStack = evaluated.flatMap((function(n) {
  if (!n.toJS)
    console.log("nnn", n);
  var n = n.toJS();
  if (!n.exports)
    return Bacon.never();
  return Bacon.fromArray(n.exports.map((function(seqName) {
    return _.extend({
      sequence: n.evaluated ? n.evaluated[seqName] : null,
      device: n.device,
      name: seqName
    }, n);
  })));
}));
var processedSequences = processedSequences_noStack.map((function(s) {
  var error = s.error || s.evaluatedError;
  if (error && error instanceof Error) {
    console.log("generating stacktrace for error", error);
    s.error = error;
    s.error.stackTrace = stackTrace.parse(error);
  }
  return s;
}));
