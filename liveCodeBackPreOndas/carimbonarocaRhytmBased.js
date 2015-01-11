
import {CarimboRhythm} from "abletonClip_CarimboRhythm";

export var rhythmBased2=CarimboRhythm.duration(0.2).takeWhile(n => n.time < 2)
.loopLength(2)
.pitch(n => n.time %6 >2 ? 62 : 50)
.velocity(n => {
    log(n.time % 0.5+0.5);
    return n.time % 0.5+0.5;
})
// .bjorklund(16,8,2)
