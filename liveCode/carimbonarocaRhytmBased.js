
import {CarimboRhythm} from "abletonClip_CarimboRhythm";

export var rhythmBased2=CarimboRhythm.duration(0.1).takeWhile(n => n.time < 1).loopLength(1).pitch(60);