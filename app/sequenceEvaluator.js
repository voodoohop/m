
var vm = require("vm");

var _ = require("lodash");

var microtime = require("microtime");

import sandbox from "./sequenceEvalSandbox";
  // var wait=require('wait.for-es6')

  var testIfSeqEmitsNotes = function(sequences, sequenceSandbox) {


    // var resSequences = vm.runInNewContext(code, sequenceSandbox, {timeout: '1000'});


    // console.log("seq res".bgYellow, sequences);

    // console.log("tester:",testerCode);
    return _.mapValues(sequences, seq => {
      // var seq = sequences[seqName];
      var res = {
        // sequence: seq
      };

      res.isSequenceGenerator = seq.isTom;

      if (!res.isSequenceGenerator)
        return res;
      var sampleSize=500;
      var playableSequence = seq.toPlayable().take(500);
      var testerCode = "result = sequence.toArray()";

      console.log("testing playableSequence:".bgYellow,seq, playableSequence);

      try {
        var startTime=microtime.nowDouble();
        var testSeqResult = vm.runInNewContext(testerCode,{
          traceurRuntime: $traceurRuntime,
          sequence: playableSequence,
          console: sequenceSandbox.console
        }, {timeout: 1000});

        var timeTaken = microtime.nowDouble()-startTime;
        var lastBeatTime = testSeqResult[testSeqResult.length-1].time;
        console.log("testSeqResult", lastBeatTime, timeTaken);
        res.playable = true;
        res.eventSample = testSeqResult;
        res.timeTaken = timeTaken;
        res.timePerEvent = timeTaken/sampleSize;
        res.beatsPerTime = lastBeatTime/timeTaken;

      } catch(e) {
        console.log("exception while trying to generate events",e.stack,e);
        res.playable=false;
      }
      return res;
      //console.log("test result:",testSeqResult);
    });
  }


  export default  function evalSequences(code, loadedSequences) {

    // console.log("creating sandbox");
    var sequenceSandbox = sandbox(loadedSequences);
    // console.log("created sandbox");

    var sequences = null
    var passedTests = false;
    var error =null;
    try {
      // console.log("sequencesForLoading", sequencePlayManager.availableSequences);
      var availableGlobals = Object.keys(sequenceSandbox);
      var f = new Function(...availableGlobals, "return "+code);

      var globals = _.values(sequenceSandbox);
      sequences = f(...globals);

      console.log("testing if sequences emit events", Object.keys(sequences));

      var testedSequences = testIfSeqEmitsNotes(sequences,sequenceSandbox);
      console.log("testedSequences".bgYellow, testedSequences);
      //if (_.find(tested))
      // for (let k of Object.keys(sequences)) {
      //   if (sequences[k].isTom) {
      //     console.log("first 5 event of sequence",sequences[k].take(5).toArray());
      //     console.log("test if seq emits notes in separate worker");
      //     // wait.launchFiber(testIfSeqEmitsNotes, sequences[k]);
      //   }
      //   else
      //     console.log("wasn't a sequence generator:",k);
      //   }
      //   passedTests = true;
      passedTests=testedSequences;
    } catch(e) {
      console.log("exception in live code",e.stack);
      error = ["exception in live code",e.stack];
    }

    if (sequences == null || !passedTests)
      return [null, false, error];

    return [sequences,passedTests];
  };
