
import {addChainEndFunction,addGenerator} from "./baseLib";
import log from "../lib/logger";

addChainEndFunction(function toArray(node) {
  var res = [];
  // console.log("iterating",node);
  for (var n of node) {
    // console.log(typeof n);
    res.push(n);
  }
  return res;
});

addGenerator(function* log(name, node) {
  // console.log("logggging");
  for (var e of node) {
    console.log(name, e);
    yield e;
  }
});



// var wait = require('wait.for-es6');
//
// var MfromRx = function*(rxObservable) {
//   return {
//     next: function*() {
//       var nextVal =
//       yield wait.for(rxObservable.onValue);
//       return {
//         value: nextVal,
//         done: false
//       };
//     }
//   }
// }



addChainEndFunction(function reduce(func,initial,node) {
  log.debug("reducing start");
  if (node === undefined) {
    node = initial;
    initial=null;
  }
  log.debug("reducing node",node);
  for (let n of node) {
    if (initial===undefined) {
      initial = n;
      continue;
    }
    initial = func(initial, n);
  }
  return initial;
});



var Rx = require("Rx");

addChainEndFunction(function MToRx(node) {return Rx.Observable.from(node)});;
