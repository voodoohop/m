

import {abletonReceiver,time} from "./oscAbleton";

import {m} from "./functionalMonads";

import log from "./lib/logger";

// import {processedAndReEval} from "./generatorModuleManager";

var devicesWantingClip = {};

var livePlayingClips = {};

var subscribeRequests={}

abletonReceiver.sequencePlayRequests.skipDuplicates((a,b) => ""+a.port+"_"+a.device == ""+b.port+"_"+b.device)
.onValue(sub => {
  subscribeRequests[sub.port] = sub.device;
});

var ableTime = 0;
abletonReceiver.time.onValue(v => ableTime=v);

var _ = require("lodash");

function createHotSwappableSequence(object,fieldName) {

  log.info("creating hot swappable sequence");

  var seq = m().evt({pitch:60, duration:0.1, velocity:0.1}).metro(4);

  log.info("created hot swappable sequence: "+seq);

  var swapper = {};
  return {swapper: swapper, currentSequence: seq.hotSwapper(swapper, "swapSequence")};
}




abletonReceiver.playingClipNotes.onValue(function(v) {
  log.info("received new playing clip at time",ableTime,v);

  var notes = _.sortBy(v.clip.notes, (n) => n.time);
  var seq=m().data(notes.map((n) => {
    return {
      pitch: n.pitch,
      duration: n.duration-0.01,
      velocity:n.velocity/127,
      time: n.time,
      color: "yellow"
    }
  }
)).loopLength(v.clip.loopEnd-v.clip.loopStart);//.delay(Math.floor(ableTime-0.3));
  log.info("updating livePlayingCLips which should trigger a hotSwap",livePlayingClips);
  if (livePlayingClips[v.port])
    livePlayingClips[v.port].swapper.swapSequence = seq;
  else {
    var swapper = {};
    livePlayingClips[v.port] = {swapper: swapper, currentSequence: seq.hotSwapper(swapper, "swapSequence")};
  }
  log.info("playing in live", livePlayingClips);
});



export function getSequence(device) {
  log.info("got request for playing sequence from device",device);
  log.info("looking for subscribed sequence", _.pairs(subscribeRequests), device);
  // subSequences.forEach(s => console.log("subsequence",s));

  var subscription = _.find(_.pairs(subscribeRequests), sub => {
    log.info(sub,sub[1] === device, livePlayingClips[sub[0]])
    return sub[1] === device && livePlayingClips[sub[0]];
  });

  log.info("result",subscription);


  if (subscription) {
    console.log("found subscription ",subscription);
    return livePlayingClips[subscription[0]].currentSequence;
  }

  var wanting = _.find(_.pairs(subscribeRequests), sub => sub[1] === device);

  if (wanting) {
    log.info("couldn't find subscription, creating hot swappable sequence for ", wanting);
    livePlayingClips[wanting[0]] = createHotSwappableSequence(livePlayingClips, wanting[0]);
    return livePlayingClips[wanting[0]].currentSequence;
  }

  log.info("returning dummy because there was nothing to be found");
  return m().evt({pitch:60, duration:0.1, velocity:0.9}).metro(3);
}
