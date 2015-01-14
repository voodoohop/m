
import {OndasGroove} from "abletonClip_OndasGroove";

export var arpedPerc= m().data({pitch:60, time:13, duration:4, velocity:0.9}).loopLength(16);

export var arpedPercArped1 = arpedPerc.arpeggiator(n => n[0], 
m().evt({pitch:0, velocity:[0.4,0.8],duration: [0.125,0.125,0.5,0.25,0.25,0.5,0.25,0.5]})
.timeFromDurations()
// .bjorklund(4,3,2)
)
.combine(OndasGroove.delay(4))
.simpleMap(n => {
    if (!n.previous)
        return n;
    
    return n.set({time: n.previous.time});
}).durationsFromTime().duration(n => n.duration/2);

export var arpedPercArped = arpedPercArped1
.automate("param1", n=> {
  var t = n.time+n.target.time;
  return 1-Math.abs((t % 1)-0.5)*2;
})
.automate("param2", n => {
  var t = n.time+n.target.time;
  return 1-Math.max(0,((t % 128)-64)/64);
});

// .combine(OndasGroove, n => {
//     return n;
//     if (!n.previous)
//         return n;
//     return n.set("time", n.previous.time);
// })

log(arpedPerc.take(2).toArray());

// OndasGroove.pitch(60).
// bjorklund(6,3,0).duration(n => n.time%0.2+0.1);