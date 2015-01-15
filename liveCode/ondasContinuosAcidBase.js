
import {ondasGrooveAcidNoAuto} from "ondasContinuosAcid";

import {growToBreak1,songUnitEaser} from "overallAutomator";

export var ondasContinuousBass = ondasGrooveAcidNoAuto.bjorklund(16,7,0).pitch(n=>n.pitch-24)
.automate("param3",growToBreak1)
.automate("param4", songUnitEaser)
;