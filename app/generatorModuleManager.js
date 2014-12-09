// var console = require('better-console');

var Bacon = require("baconjs");

var Immutable = require("immutable");

var depGraph = require('es-dependency-graph');

var traceur = require("traceur");

import {isIterable,getIterator,clone} from "./utils";

var teoria = require("teoria");

import {m} from "./functionalMonads";

import {t} from "./time";

import {wu} from "./wu";

import {abletonReceiver, abletonSender} from "./oscAbleton";


var Easer = require('functional-easing').Easer;

var _ = require("lodash");

import webServer from "./webConnection";

// console.log("WS2",webServer);

export var newSequenceCode = new Bacon.Bus();

export var loadedSequences = Immutable.Map();

export var processedSequences = new Bacon.Bus();

// TODO: deep checking of exported symbols
function checkDepsAndEval(seqs, evalFunction) {
  var reRun = false;
  var newlyEvaluated = [];
    var unSatisfiedDevices = seqs.filter(v => !v.get("satisfiedDeps"));
    var satisfiedDevices = seqs.filter(v => v.get("satisfiedDeps"));
    var existingDevices = satisfiedDevices.keySeq();
    for (let entry of unSatisfiedDevices) {
      var device = entry[0];
      // console.log("checking unsatisfied",device);
      var seqCode = entry[1];
      // console.log(existingDevices,seqCode.get("imports").keySeq(),existingDevices.isSuperset(seqCode.get("imports").keySeq()))
      if (existingDevices.isSuperset(seqCode.get("imports").keySeq())) {
        // console.log("evaluating", seqCode);
        var [evaluated, success] = evalSequences(seqCode.get("processedCode"));
        seqs = seqs.setIn([device,"evaluatedSequences"], evaluated);
        seqs = seqs.setIn([device,"satisfiedDeps"],success);
        newlyEvaluated.push(device);
        reRun=success;
      }
      //console.log("checkDeps", seqCode);
    }

  return [newlyEvaluated, seqs, reRun];
}


var fs = require("fs"),
    mkpath = require("mkpath");

newSequenceCode.onValue((seqCode) => {
  console.log("received seq to eval",seqCode);

  // var compiled = traceur.compile(seqCode.code,{modules:"inline", generators:"parse", blockBinding:"parse"});
  //
  // fs.writeFileSync(processedPath,compiled);
  try {
  var dependencies = depGraph(seqCode.code,{
    includeBindings: true
  });
  } catch(exception) {
    console.error("dependency exception",exception);
    return;
  }

  var compiled = traceur.compile(seqCode.code,{modules:"register", generators:"parse", blockBinding:"parse"});

  var newDev = Immutable.Map({code:seqCode.code, processedCode: compiled});
  newDev = newDev.merge(dependencies);
  console.log("newDevSeq",newDev.toJS());
  var [evaluated,success] = evalSequences(newDev.get("processedCode"));
  if (!success) {
    console.error("eval of ",seqCode.device,"FAILED!!!");
    return;
  }
  newDev = newDev.set("evaluatedSequences",evaluated);
  newDev = newDev.set("satisfiedDeps",true);

  console.log("newDev after eval",newDev.toJS());

  // if (loadedSequences.get(seqCode.device) && ""+newDev.toJS().evaluatedSequences == ""+loadedSequences.get(seqCode.device).toJS().evaluatedSequences) {
  //   console.log("is Equal:"+newDev.toJS().evaluatedSequences);
  //   console.log("NO CHANGE DETECTED IN "+seqCode.device+" ignoring".bgRed);
  // }

  loadedSequences = loadedSequences.set(seqCode.device,newDev);


  var newSequences = loadedSequences.map((s,sName) => {
    // console.log("lsmap",s);
    if (s.get("imports").keySeq().contains(seqCode.device)) {
      console.log("devalitaing",sName,"because ",seqCode.device," was compiled");
      return s.set("evaluatedSequences",null).set("satisfiedDeps",false);
    }
    else
      return s;
  })


  var reRun=false;
  do {
    var updated = null;
    [updated, newSequences,reRun] = checkDepsAndEval(newSequences);
    updated.unshift(seqCode.device);
    console.log("evaluated sequences",updated);
    for (var device of updated) {
      var seqs = newSequences.get(device).get("evaluatedSequences");
      for (var seqName of Object.keys(seqs)) {
        console.log("passing on evaluated",seqName);
        processedSequences.push({device:device, name: seqName, sequence:seqs[seqName], code: newSequences.get(device).get("code")});
      }
    }
    loadedSequences = newSequences;
  }
  while(reRun);
  return loadedSequences = newSequences;
});




var seqLoader = {
  get: (m) => {
    console.log("seqLoader: requesting sequences from",m);
    //var importableSequences = _.mapValues(sequencePlayManager.availableSequences, (p) => p.sequence);
    console.log("seqLoader: sending evaluated",loadedSequences.getIn([m,"evaluatedSequence"]));
    return loadedSequences.getIn([m,"evaluatedSequences"]);
  }
}


var evalSequences = function(code) {
  var sequences = null
  var passedTests = false;
  try {
    // console.log("sequencesForLoading", sequencePlayManager.availableSequences);
    var f = new Function("m","t","params", "wu", "teoria","_","System","clone","easer","console", "return "+code);
    console.log("compiled",code);
    var remoteLog = function(...m) {
      console.log("logging",m);
      try {
        webServer.remoteLogger.push(""+m)
      } catch (e) {
        console.error("error sending log",e);
      }
    };
    sequences = f(m, t, abletonReceiver.param, wu, teoria,_, seqLoader,  clone, () => new Easer(),{log: remoteLog, warn: remoteLog, error: remoteLog});
    console.log("testing if sequence emits events");
    for (let k of Object.keys(sequences)) {
      if (sequences[k].isTom)
        console.log("first 5 event of sequence",sequences[k].take(5).toArray());
      else
        console.log("wasn't a sequence generator:",k);
    }
    passedTests = true;
  } catch(e) {
    console.log("exception in live code",e.stack);
  }

  if (sequences == null || !passedTests)
    return [null, false];
  return [sequences,true];
};


//
//
// newSequenceCode.push({device:"ableton1", code:"export var test=1; import {needed} from 'ableton2'; console.log('success',needed);"});
// newSequenceCode.push({device:"ableton2", code:"export var needed='yes';"});
// newSequenceCode.push({device:"ableton3", code:"export var needing=1; import {needed} from 'ableton4';"});

// console.log("afterwards:",loadedSequences.toJS());

// throw "bye";
