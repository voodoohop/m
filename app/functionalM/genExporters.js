
import {addChainEndFunction,addGenerator} from "./baseLib";


addChainEndFunction(function toArray(node) {
  var res = [];
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


var Rx = require("Rx");

addChainEndFunction(function MToRx(node) {return Rx.Observable.from(node)});;


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
