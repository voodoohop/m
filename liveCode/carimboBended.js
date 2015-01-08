import {carimboChords} from "abletonClip_carimboChords";

export var bendedCarimbo = carimboChords.groupByTime().simpleMap(n => {
    // log(n[0]);
    return n[0];
})
.withNext()
.automate("pitchBend", (n) => {
    
    
    log(0.5+(n.target.next.pitch-n.target.pitch)/6*n.time);
    
    return 0.5+(n.target.next.pitch-n.target.pitch)/6*n.time/n.duration;
})
;//.automate("pitchBend",);

