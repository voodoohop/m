



import {ondasScale} from "ondasContinuosAcid";
import {OndasGroove} from "abletonClip_OndasGroove";
import {OndasChords} from "abletonClip_OndasChords";

import {getPitches,extendScaleToFullRange, scaleToPitch, pitchToScale} from "scaleTools";

var chordsInScale = OndasChords.pitch(pitchToScale(ondasScale));


m().addGen( function* reduceGroove(node) {
    var lastDistTo16th = 999;
    var lastNote = undefined;
    var count=0;
    for (let n of node) {
        if (!lastNote) {
            lastNote=n;
            yield n;
            continue;
        }
        
        var distTo16th = n.time % 0.25;
        
        distTo16th = Math.min(0.25-distTo16th, distTo16th);
        
        if (n.time-lastNote.time<0.2)
            continue;
        yield n;
        
        lastNote = n;
        lastDistTo16th=distTo16th;
    }
});


var pitchPattern =[0,3,-2,0];

log(chordsInScale.groupByTime().take(3).toArray());
export var acid = OndasGroove.reduceGroove()
.set({noteNo: m().count(0,1)})

.combine(
    chordsInScale
    .groupByTime()
    .simpleMap(n => ({time:n[0].time, notes:n}))
    )
.pitch(n => {
    // log(n);
 return n.next.notes[1].pitch;
}
)

.pitch(n => {
    
        return n.pitch+pitchPattern[n.noteNo %pitchPattern.length];
        
})
.duration(0.2)
.duration(n => {
            var distTo4th = n.time % 1;
        
        distTo4th = Math.min(1-distTo4th, distTo4th);
        return (distTo4th > 0.03) ? n.duration : 0.4;
          
})
.pitch(scaleToPitch(ondasScale))
.pitch(n => n.pitch-12)
.automate("param1", n=> Math.sin(n.target.time*Math.PI*2/16)/2+0.5)
.automate("param2", n=> Math.sin(n.target.time*Math.PI*2/24)/2+0.5)




// log(m(ondasGrooveReduced).take(10).toArray());




