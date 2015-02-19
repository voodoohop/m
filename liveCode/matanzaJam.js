import {bassMatanza} from "abletonClip_bassMatanza";

import {CarimboScale} from "abletonClip_CarimboScale";import {extendScaleToFullRange,getPitches,scaleToPitch} from "scaleTools";

var scale = extendScaleToFullRange(getPitches(bassMatanza));

export var bassModified2 = bassMatanza.pitch(n =>Math.floor(20+n.time%8)).groupByTime().map(n => [n[0],n[0].set({time : n[0].time+1}),n[0].set({time : n[0].time+1.75})])
.bjorklund(16,13,0).delay(1).duration(0.1).pitch(scaleToPitch(scale))
.filter(n => n.time %16 >12);

export var bassModified = bassMatanza.pitch(n => n.time % 32 > 24 ? n.pitch+12 : n.pitch)
.combine(bassModified2)
.automate("param1", n =>
{
    log("hey");
    var dist = n.target.previous.time - n.target.time;
    log(dist);
    
    return Math.min(1,dist/10);
}
);
