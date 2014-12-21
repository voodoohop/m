
import {CarimboRhythm} from "abletonClip_CarimboRhythm";

export var rhythmBased2=CarimboRhythm.duration(0.1).takeWhile(n => n.time < 1).loopLength(1.5).pitch([60,70,80]).time(n => n.time);
