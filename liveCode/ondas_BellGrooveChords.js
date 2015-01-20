
import {chords as OndasChords} from "OndasChordsVariety";
import {MisturaBreakGroove as MistureCongaGroove} from "abletonClip_MisturaBreakGroove";

var chords =OndasChords.groupByTime().simpleMap(n => ({time:n[0].time, events:n}));

log(chords.take(10).toArray());

export var bellChordGroove = MistureCongaGroove.bjorklund(8,8,0).combine(chords).simpleMap(n => {
  if (!n.previous)
    return n;
    // log(n.previous.eventspitch);
    return n.set({pitch:n.previous.events[0].pitch});
    // .bjorklund(16,9,0)
    ;

    // return n.prop("pitch",n.previous.pitch);
  }).bjorklund(16,9,2).velocity([0.9,0.7,0.9,0.8]).delay(0);
