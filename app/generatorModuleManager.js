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
  console.log("evaluating new Sequence:".underline.bold,newSeqIm.get("device"));

  var allExports = loadedSequences.valueSeq().map(v => v.get("exports")).flatten();
  var unsatisfiedImports = newSeqIm.get("imports").entrySeq().filter((i) => {
    var [importDevice, importSeqNames] = i;
    // if (loadedSequences.get(importDevice))
    //   console.log("importdevice",loadedSequences.get(importDevice).toJS(),"imSeqNames",importSeqNames.toJS());
    return !loadedSequences.get(importDevice) || !importSeqNames.isSuperset(loadedSequences.get(importDevice).get("exports"))
  }
  );
  if (unsatisfiedImports.count() > 0) {
    console.log("imports unSatisfied".bold.red, unsatisfiedImports.toJS());
    // console.log("all imports",newSeqIm.get("imports").entrySeq().toJS());
    console.log("existing exports".bold,loadedSequences.entrySeq().map(s => ({name: s[0],  exports:s[1].get("exports").toJS()})).toJS());
    return newSeqIm.set("evaluatedError", Immutable.Map({type:"importsUnsatisfied", msg:"imports unsatisfied", imports:unsatisfiedImports}));
  }
  var [evaluated,details, error] = evalSequences(newSequence.processedCode, loadedSequences);
  var evaluatedRes = null;
  if (!details) {
    console.error("eval of ",newSequence,"FAILED!!!".bold.red);
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

var evaluated =
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

export var processedSequences = evaluated.filter((n) => n.get("evaluated"))//.flatMap((n) => n.get("evaluated").toJS());
.flatMap(n => {
 var n = n.toJS();

 return Bacon.fromArray(Object.keys(n.evaluated).map(seqName => _.extend(n, {sequence: n.evaluated[seqName], device: n.device, name:seqName})));
});


// processedSequences.log("processedSequences");
// evaluatedSequenceStream.


// var evaluated = unEvaluated.map(s => {
//   console.log("evaluating",s);
//   var [evaluated,success] = evalSequences(s.processedCode,loadedSequences);
//   if (!success) {
//     console.error("eval of ",seqCode.device,"FAILED!!!".bold.red);
//     return;
//   }
//   newDev = newDev.set("evaluated",evaluated);
//   newDev = newDev.set("satisfiedDeps",true);
// });

//
//
// loadedSequenceStream.onValue((seqCode) => {
//   console.log("received seq code to eval",seqCode.toJS());
//   return;
//   // fs.writeFileSync(processedPath,compiled);
//
//
//   // var compiled = traceur.compile(seqCode.code,{modules:"register", generators:"parse", blockBinding:"parse"});
//
//   // var newDev = Immutable.Map(seqCode);
//   console.log("newDevSeq",newDev.toJS());
//   var [evaluated,success] = evalSequences(newDev.get("processedCode"),loadedSequences);
//   if (!success) {
//     console.error("eval of ",seqCode.device,"FAILED!!!".bold.red);
//     return;
//   }
//   newDev = newDev.set("evaluated",evaluated);
//   newDev = newDev.set("satisfiedDeps",true);
//
//   console.log("newDev after eval",newDev.toJS());
//
//   // if (loadedSequences.get(seqCode.device) && ""+newDev.toJS().evaluated == ""+loadedSequences.get(seqCode.device).toJS().evaluated) {
//   //   console.log("is Equal:"+newDev.toJS().evaluated);
//   //   console.log("NO CHANGE DETECTED IN "+seqCode.device+" ignoring".bgRed);
//   // }
//
//   loadedSequences = loadedSequences.set(seqCode.device,newDev);
//
//
//   var newSequences = loadedSequences.map((s,sName) => {
//     console.log("lsmap",s);
//     if (s.get("imports").keySeq().contains(seqCode.device)) {
//       console.log("devalitaing",sName,"because ",seqCode.device," was compiled");
//       return s.set("evaluated",null).set("satisfiedDeps",false);
//     }
//     else
//       return s;
//   })
//
//
//   var reRun=false;
//   do {
//     var updated = null;
//     [updated, newSequences,reRun] = checkDepsAndEval(newSequences);
//     updated.unshift(seqCode.device);
//     console.log("evaluated sequences",updated);
//     for (var device of updated) {
//       var seqs = newSequences.get(device).get("evaluated");
//       for (var seqName of Object.keys(seqs)) {
//         console.log("passing on evaluated",seqName);
//         processedSequences.push({device:device, name: seqName, sequence:seqs[seqName], code: newSequences.get(device).get("code")});
//       }
//     }
//     loadedSequences = newSequences;
//   }
//   while(reRun);
//   return loadedSequences = newSequences;
// });


//
//
// newSequenceCode.push({device:"ableton1", code:"export var test=1; import {needed} from 'ableton2'; console.log('success',needed);"});
// newSequenceCode.push({device:"ableton2", code:"export var needed='yes';"});
// newSequenceCode.push({device:"ableton3", code:"export var needing=1; import {needed} from 'ableton4';"});

// console.log("afterwards:",loadedSequences.toJS());

// throw "bye";
