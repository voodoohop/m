import {CarimboNaRoca} from "abletonClip_CarimboNaRoca";
import {CarimboRhythm} from "abletonClip_CarimboRhythm";

export var carimboChords = CarimboNaRoca.pitch(n => n.pitch+12);

export var carimboChordsBend = CarimboRhythm.durationsFromTime().automate("pitchBend",n => {
    return 0.5;
}).automationOnly();


log(carimboChordsBend.take(5).toArray());

// log(carimboBended.take(10).toArray());