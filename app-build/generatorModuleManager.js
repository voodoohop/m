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
    $__functionalMonads__,
    $__time__,
    $__wu__,
    $__oscAbleton__,
    $__webConnection__;
var Bacon = require("baconjs");
var Immutable = require("immutable");
var depGraph = require('es-dependency-graph');
var traceur = require("traceur");
var $__0 = ($__utils__ = require("./utils"), $__utils__ && $__utils__.__esModule && $__utils__ || {default: $__utils__}),
    isIterable = $__0.isIterable,
    getIterator = $__0.getIterator,
    clone = $__0.clone;
var teoria = require("teoria");
var m = ($__functionalMonads__ = require("./functionalMonads"), $__functionalMonads__ && $__functionalMonads__.__esModule && $__functionalMonads__ || {default: $__functionalMonads__}).m;
var t = ($__time__ = require("./time"), $__time__ && $__time__.__esModule && $__time__ || {default: $__time__}).t;
var wu = ($__wu__ = require("./wu"), $__wu__ && $__wu__.__esModule && $__wu__ || {default: $__wu__}).wu;
var $__4 = ($__oscAbleton__ = require("./oscAbleton"), $__oscAbleton__ && $__oscAbleton__.__esModule && $__oscAbleton__ || {default: $__oscAbleton__}),
    abletonReceiver = $__4.abletonReceiver,
    abletonSender = $__4.abletonSender;
var Easer = require('functional-easing').Easer;
var _ = require("lodash");
var webServer = ($__webConnection__ = require("./webConnection"), $__webConnection__ && $__webConnection__.__esModule && $__webConnection__ || {default: $__webConnection__}).default;
var newSequenceCode = new Bacon.Bus();
var loadedSequences = Immutable.Map();
var processedSequences = new Bacon.Bus();
function checkDepsAndEval(seqs, evalFunction) {
  var reRun = false;
  var newlyEvaluated = [];
  var unSatisfiedDevices = seqs.filter((function(v) {
    return !v.get("satisfiedDeps");
  }));
  var satisfiedDevices = seqs.filter((function(v) {
    return v.get("satisfiedDeps");
  }));
  var existingDevices = satisfiedDevices.keySeq();
  for (var $__6 = unSatisfiedDevices[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__7; !($__7 = $__6.next()).done; ) {
    let entry = $__7.value;
    {
      var device = entry[0];
      var seqCode = entry[1];
      if (existingDevices.isSuperset(seqCode.get("imports").keySeq())) {
        var $__11 = evalSequences(seqCode.get("processedCode")),
            evaluated = $__11[0],
            success = $__11[1];
        seqs = seqs.setIn([device, "evaluatedSequences"], evaluated);
        seqs = seqs.setIn([device, "satisfiedDeps"], success);
        newlyEvaluated.push(device);
        reRun = success;
      }
    }
  }
  return [newlyEvaluated, seqs, reRun];
}
var fs = require("fs"),
    mkpath = require("mkpath");
newSequenceCode.onValue((function(seqCode) {
  var $__12;
  console.log("received seq to eval", seqCode);
  try {
    var dependencies = depGraph(seqCode.code, {includeBindings: true});
  } catch (exception) {
    console.error("dependency exception", exception);
    return;
  }
  var compiled = traceur.compile(seqCode.code, {
    modules: "register",
    generators: "parse",
    blockBinding: "parse"
  });
  var newDev = Immutable.Map({
    code: seqCode.code,
    processedCode: compiled
  });
  newDev = newDev.merge(dependencies);
  console.log("newDevSeq", newDev.toJS());
  var $__11 = evalSequences(newDev.get("processedCode")),
      evaluated = $__11[0],
      success = $__11[1];
  if (!success) {
    console.error("eval of ", seqCode.device, "FAILED!!!");
    return;
  }
  newDev = newDev.set("evaluatedSequences", evaluated);
  newDev = newDev.set("satisfiedDeps", true);
  console.log("newDev after eval", newDev.toJS());
  loadedSequences = loadedSequences.set(seqCode.device, newDev);
  var newSequences = loadedSequences.map((function(s, sName) {
    if (s.get("imports").keySeq().contains(seqCode.device)) {
      console.log("devalitaing", sName, "because ", seqCode.device, " was compiled");
      return s.set("evaluatedSequences", null).set("satisfiedDeps", false);
    } else
      return s;
  }));
  var reRun = false;
  do {
    var updated = null;
    ($__12 = checkDepsAndEval(newSequences), updated = $__12[0], newSequences = $__12[1], reRun = $__12[2], $__12);
    updated.unshift(seqCode.device);
    console.log("evaluated sequences", updated);
    for (var $__8 = updated[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__9; !($__9 = $__8.next()).done; ) {
      var device = $__9.value;
      {
        var seqs = newSequences.get(device).get("evaluatedSequences");
        for (var $__6 = Object.keys(seqs)[$traceurRuntime.toProperty(Symbol.iterator)](),
            $__7; !($__7 = $__6.next()).done; ) {
          var seqName = $__7.value;
          {
            console.log("passing on evaluated", seqName);
            processedSequences.push({
              device: device,
              name: seqName,
              sequence: seqs[seqName],
              code: newSequences.get(device).get("code")
            });
          }
        }
      }
    }
    loadedSequences = newSequences;
  } while (reRun);
  return loadedSequences = newSequences;
}));
var seqLoader = {get: (function(m) {
    console.log("seqLoader: requesting sequences from", m);
    console.log("seqLoader: sending evaluated", loadedSequences.getIn([m, "evaluatedSequence"]));
    return loadedSequences.getIn([m, "evaluatedSequences"]);
  })};
var evalSequences = function(code) {
  var sequences = null;
  var passedTests = false;
  try {
    var f = new Function("m", "t", "params", "wu", "teoria", "_", "System", "clone", "easer", "console", "return " + code);
    console.log("compiled", code);
    var remoteLog = function() {
      for (var m = [],
          $__10 = 0; $__10 < arguments.length; $__10++)
        m[$__10] = arguments[$__10];
      console.log("logging", m);
      try {
        webServer.remoteLogger.push("" + m);
      } catch (e) {
        console.error("error sending log", e);
      }
    };
    sequences = f(m, t, abletonReceiver.param, wu, teoria, _, seqLoader, clone, (function() {
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
        if (sequences[k].isTom)
          console.log("first 5 event of sequence", sequences[k].take(5).toArray());
        else
          console.log("wasn't a sequence generator:", k);
      }
    }
    passedTests = true;
  } catch (e) {
    console.log("exception in live code", e.stack);
  }
  if (sequences == null || !passedTests)
    return [null, false];
  return [sequences, true];
};
