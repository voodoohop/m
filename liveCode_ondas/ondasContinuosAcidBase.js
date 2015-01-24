
import {ondasGrooveAcidNoAuto} from "ondasContinuosAcid";

import {growToBreak1,songUnitEaser, chorusFilter} from "overallAutomator";

export var ondasContinuousBass = ondasGrooveAcidNoAuto
// .bjorklund(16,13,0)
// .invoke(chorusFilter)
.pitch(n=>n.pitch-24)
.automate("param3",growToBreak1)
.automate("param4", songUnitEaser)
;