

var teoria = require("teoria");

import {m} from "./functionalMonads";

import {t} from "./time";

import {wu} from "./wu";

import webServer from "./webConnection";

import {isIterable,getIterator,clone} from "./utils";

var Easer = require('functional-easing').Easer;

var _ = require("lodash");

import {abletonReceiver, abletonSender} from "./oscAbleton";



var remoteLog = function(...m) {
  console.log("seqLog".bgYellow,m);
  try {
    webServer.remoteLogger.push(""+m)
  } catch (e) {
    console.error("error sending log",e);
  }
};


export default function getSandBox(loadedSequences) {


  var seqLoader = {
    get: (m) => {
      console.log("seqLoader: requesting sequences from",m);
      var evaluated = loadedSequences.getIn([m,"evaluated"]);
      console.log("seqLoader: sending evaluated",evaluated);
      if (!evaluated)
        throw "evaluated sequences falsy",m;
      return evaluated;
    }
  }


  var sandbox = {
    "$traceurRuntime": $traceurRuntime,
    "m": m,
    "t": t,
    "params": abletonReceiver.param,
    "wu": wu,
    "teoria": teoria,
    "_": _,
    "System": seqLoader,
    "clone":clone,
    "easer":() => new Easer(),
    "console": {log: remoteLog, warn: remoteLog, error: remoteLog}
  };


  return Object.freeze(sandbox);
}
