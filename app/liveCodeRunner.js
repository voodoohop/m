var hotload = require("hotload");




import {t} from "./time";
import {m} from "./functionalMonads";
import {baconParam} from "./oscAbletonCommunication";

var teoria = require("teoria");

var activeSequencers = [];

export function liveCodeRun(path, sequencer) {
  console.log("livecoderun");
  var liveCode= hotload(path, function(newCode) {
    console.log("reloaded",newCode);
    console.log("stopping activeSequencers",activeSequencers)
    for (let s of activeSequencers) {
    //  console.log(s);
      s.stop();
    }
    firstTime = null;
    let sequences = newCode.run(m,t,baconParam,teoria);
    activeSequencers = sequences.map((s) => sequencer(s));
    console.log("activeSequencers",activeSequencers.length);
  });
}

// example: liveCodeRun("./liveCoding_build/liveCoding", OSCSequencer)
