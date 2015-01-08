var vm = require("vm");

var _ = require("lodash");

var microtime = require("microtime");
var stackTrace = require("stack-trace");

import wrapError from "./wrapSequenceError";

import sandbox from "./sequenceEvalSandbox";
// var wait=require('wait.for-es6')

function getSequenceGenerator(code, loadedSequences,seqContext) {

  var sequenceSandbox = sandbox(loadedSequences, seqContext, false);

  var availableGlobals = _.keys(sequenceSandbox);
  var f = new Function(...availableGlobals, "return "+ code);
  console.log("evaluating code:\n"+"return "+ code);
  var globals = availableGlobals.map(k => sequenceSandbox[k]);
  console.log("running sequences on", availableGlobals, globals);
  return () => f(...globals);
}

var testIfSeqEmitsNotes = function(sequences, sequenceSandbox, sequenceContext) {


  // var resSequences = vm.runInNewContext(code, sequenceSandbox, {timeout: '1000'});


  console.log("seq res".bgYellow, sequences,sequenceContext);

  // console.log("tester:",testerCode);
  return _.mapValues(sequences, seq => {
    // var seq = sequences[seqName];

    var res = {
      playable: false
    }

    if (!seq) {
      res.error = new Error("seq is falsy");
      return res;
    }

    res.isSequenceGenerator = seq.isTom;

    if (!res.isSequenceGenerator)
      return res;
    var sampleSize = 200;
    var playableSequence = seq.toPlayable().take(sampleSize);
    var testerCode = "result = sequence.toArray();";
    // console.log("testing playableSequence:".bgYellow,seq, playableSequence);

    var globalBack = {};
    for (let key of Object.keys(sequenceSandbox)) {
      globalBack[key] = global[key];
      global[key] = sequenceSandbox[key];
    }
    globalBack.sequence = global.sequence;
    global.sequence = playableSequence;

    var startTime = microtime.nowDouble();
    var testSeqResult = null;
    var timeTaken;
    try {
      console.log("global m before running code", global["m"]);
      testSeqResult = vm.runInThisContext(testerCode, {
        timeout: 5000
      });
      timeTaken = microtime.nowDouble() - startTime;

    } catch (e) {
      console.log("exception while trying to generate events", e.stack, e, seq);
      res.playable = false;
      res.evaluatedError = wrapError(e, sequenceContext, seq.name); //{msg:"msg.runTimeError"+e, stack:e.stack, exception: e};
      // res.stackTrace = stackTrace.parse(e);
    }

    for (let key of Object.keys(globalBack))
      global[key] = globalBack[key];

    // global = globalBackup;
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
    //console.log("test result:",testSeqResult);
  });
}


export default function evalSequences(seqContext, loadedSequences) {

  var code = seqContext.processedCode;
  // console.log("creating sandbox");

  var seqGen = getSequenceGenerator(code, loadedSequences, seqContext);

  var sequenceSandbox = sandbox(loadedSequences, seqContext, console.log);
  // console.log("created sandbox");

  var sequences = null
  var passedTests = false;
  var error = null;



    // console.log("sequencesForLoading", sequencePlayManager.availableSequences);
    // var availableGlobals = Object.keys(sequenceSandbox);
    // var f = new Function(...availableGlobals, code);
    // console.log("running code",code);
    // var globalBackup = global;
    // var globalBack = {};
    // for (let key of Object.keys(sequenceSandbox)) {
    //   globalBack[key] = global[key];
    //   global[key] = sequenceSandbox[key];
    // }
    try {
      // console.log("global m before running code", global["m"]);
      console.log("running seqGen");
      global.seqGen = seqGen;
    sequences = vm.runInThisContext("seqGen();", {
      timeout: 5000
    });
  } catch (e) {
    console.log("exception in live code", e.stack);
    error = wrapError(e, seqContext);
  }
  // for (let key of Object.keys(globalBack))
  //   global[key] = globalBack[key];

    // global = globalBackup;
    // console.log(testSeqResult);
    // process.exit(1);
    // var globals = _.values(sequenceSandbox);
    // sequences = f(...globals);
  if (error === null) {
    console.log("testing if sequences emit events", Object.keys(sequences));

    var testedSequences = testIfSeqEmitsNotes(sequences, sequenceSandbox, seqContext);
    console.log("testedSequences".bgYellow, testedSequences);

    passedTests = testedSequences;

  }

  if (passedTests && error===null)
    sequences = seqGen();

  if (sequences == null || !passedTests)
    return [null, false, error];

  console.log("now create sequences using regular new Function becasue it seems like garbage collection is fucking with me");


  return [sequences, passedTests];
};
