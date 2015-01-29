var teoria = require("teoria");

import {
  m
}
from "./functionalM/baseLib";

import {
  t
}
from "./time";

import {
  wu
}
from "./lib/wu";

import webServer from "./webConnection";

import {
  immutableTom as immutable
}
from "./immutable/nodeProxiedImmutable";

import log from "./lib/logger";

import {
  isIterable, getIterator, clone
}
from "./lib/utils";

var Easer = require('functional-easing').Easer;

var _ = require("lodash");

import {
  abletonReceiver, abletonSender, maxControl
}
from "./oscAbleton";

var vm = require("vm");

var stackTrace = require("stack-trace");


import getSourcePos from "./lib/findSourceStackPos";

var ramda = require("ramda");

import * as livePlayingClips from "./livePlayingClips";



export default function getSandBox(loadedSequences, deviceStruct = null, loggerOverride = false) {


  var remoteLog = function(...m) {
    // console.log("seqLog".bgYellow,m);

    // try {
    // console.log("deviceStruct sourcePos",deviceStruct.sourcePos);
    var sourcePos = getSourcePos(deviceStruct.sourcePos);
    if (!sourcePos)
      log.warn("warning, logging to device but no sourcePos", deviceStruct.name, "sourcePos:", deviceStruct.sourcePos);
    webServer.remoteLogger.push({
      msg: m,
      sourcePos: sourcePos,
      device: deviceStruct.device,
      // allStack:stack,
      // code: deviceStruct.code,
      // processedCode: deviceStruct.processedCode
    });
    // } catch (e) {
    //   console.error("error sending log",e);
    // }
  };

  var seqLoader = {
    get: (m) => {
      if (m === "playing") {
        return {"default":livePlayingClips.getSequence(deviceStruct.device)};
      }
      console.log("seqLoader: requesting sequences from", m);
      var evaluated = loadedSequences.getIn([m, "evaluated"]);
      console.log("seqLoader: sending evaluated", evaluated);
      if (!evaluated)
        throw new Error("evaluated sequences falsy" + m);
      return evaluated;
    }
  }


  var sandbox = {
    "$traceurRuntime": $traceurRuntime,
    "m": m,
    "t": t,
    "params": (paramName) => abletonReceiver.param(deviceStruct.device,paramName).map(v => v.value),
    "params2": (paramName) => abletonReceiver.param(deviceStruct.device, paramName),
    "wu": wu,
    "teoria": teoria,
    "immutable": immutable,
    "_": _,
    "R": ramda,
    "System": seqLoader,
    "clone": clone,
    "easer": () => new Easer(),
    "log": loggerOverride ? loggerOverride : remoteLog,
    // "console": {log: remoteLog, warn: remoteLog, error: remoteLog},
    "Symbol": Symbol,
    "playingClip": livePlayingClips.newPlayingClip,
    "maxControl":maxControl,
    "automate": (paramName,automation) => {
      automation.onValue(v => abletonSender.param(deviceStruct.path, v.port, paramName, v.value, -1));
    }
  };


  return sandbox;
}
