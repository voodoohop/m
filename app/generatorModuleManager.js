// var console = require('better-console');

var Bacon = require("baconjs");

var Immutable = require("immutable");





import {isIterable,getIterator,clone} from "./utils";




import evalSequences from "./sequenceEvaluator";

var _ = require("lodash");


export var newSequenceCode = new Bacon.Bus();

// export var loadedSequences = Immutable.Map();




var fs = require("fs"),
    mkpath = require("mkpath");

import processCode from "./sequenceCodeProcessor";

var processed=newSequenceCode.map(processCode);

processed.onError(e => console.error("Error while processing code",e));

var loadedSequenceStream = new Bacon.Bus();


var evalStreamEntry = function(loadedSequences, newSequence) {
  var newSeqIm = Immutable.fromJS(newSequence);
  console.log("evaluating new Sequence:".underline,newSeqIm);

  var allExports = loadedSequences.valueSeq().map(v => v.get("exports")).flatten();
  var unsatisfiedImports = newSeqIm.get("imports").entrySeq().filter((i) => {
    var [importDevice, importSeqNames] = i;
    // if (loadedSequences.get(importDevice))
    //   console.log("importdevice",loadedSequences.get(importDevice).toJS(),"imSeqNames",importSeqNames.toJS());
    return !loadedSequences.get(importDevice) || !importSeqNames.isSubset(loadedSequences.get(importDevice).get("exports"))
  }
  );
  if (unsatisfiedImports.count() > 0) {
    console.log("imports unSatisfied".red, unsatisfiedImports.toJS());
    // console.log("all imports",newSeqIm.get("imports").entrySeq().toJS());
    console.log("existing exports".bold,loadedSequences.entrySeq().map(s => ({name: s[0],  exports:s[1].get("exports").toJS()})).toJS());
    return newSeqIm.set("evaluatedError", Immutable.Map({type:"importsUnsatisfied", msg:"imports unsatisfied", imports:unsatisfiedImports}));
  }
  var [evaluated,details, error] = evalSequences(newSequence.processedCode, loadedSequences);
  var evaluatedRes = null;
  if (!details) {
    console.error("eval of ",newSequence,"FAILED!!!".red);
    //return Bacon.never();
    evaluatedRes = Immutable.fromJS(newSequence).set("evaluatedError", error);
  } else
    evaluatedRes = Immutable.fromJS(newSequence).merge({evaluated: evaluated, evaluatedDetails: details});
    // console.log("evalSequences result", evaluatedRes.toJS());
    return evaluatedRes;
}

var processedAndReEval = new Bacon.Bus();

processedAndReEval.plug(processed.skipErrors());


var markForReEval = function(loadedSequences, device) {
  loadedSequences.entrySeq().forEach((s) => {
    var [seqName, seq]=s;
    if (seq.get("imports").get(device)) {
      console.log("marking ".bgMagenta, (""+seqName).underline,"for reEvaluation");
      processedAndReEval.push(seq.toJS());
      markForReEval(loadedSequences, seq.get("device"));
    }
  });
}

export var evaluated =
  Bacon.zipAsArray(loadedSequenceStream, processedAndReEval).map(s => {
    var res = evalStreamEntry(...s);
    var loadedSequences = s[0];
    var newSequence = s[1];
    if (!res.get("evaluatedError"))
      markForReEval(loadedSequences, newSequence.device);
    return res;
  });


var evaluatedSequenceStream = evaluated.skipErrors().scan(
  Immutable.Map(), (prev, next) => prev.set(next.get("device"), next)
);

// evaluatedSequenceStream.onValue(v => console.log("evaluated".bold.underline, v.valueSeq().map(v=>v.get("evaluatedDetails")).toJS()));


loadedSequenceStream.plug(evaluatedSequenceStream);

export var loadedSequences = evaluatedSequenceStream;

export var processedSequences = evaluated//.filter((n) => n.get("evaluated"))//.flatMap((n) => n.get("evaluated").toJS());
.flatMap(n => {
 var n = n.toJS();
 // console.log("flatMap",Object.keys(n.evaluated).map(seqName => ({device: n.device, name:seqName})));
 return Bacon.fromArray(n.exports.map(seqName => _.extend({sequence: n.evaluated ? n.evaluated[seqName] : null, device: n.device, name:seqName},n)));
});
