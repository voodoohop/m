
import {CarimboChords2} from "abletonClip_CarimboChords2";
import clip from "playing";
import {extendScaleToFullRange} from "scaleTools";

export var toChord = clip.combine(CarimboChords2.groupByTime().simpleMap(n=> ({time:n[0].time, notes:n})))
.pitch(n => {
    if (!n.previous)
        return n.pitch;
    var pitches = n.previous.notes.map(n => n.pitch);
    // log(pitches);
    var allPitches=extendScaleToFullRange(pitches);
    // log(allPitches);
    // log(n.pitch);
    var closest = {pitch:null, dist: 999};
    for (let p of allPitches) {
        var dist = Math.abs(p-n.pitch);
        if (dist<closest.dist)
          closest = {pitch:p, dist:dist};
    }
    log("closest", closest);
    return closest.pitch;
})

;