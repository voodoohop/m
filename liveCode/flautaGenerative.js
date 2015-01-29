
import {FlautaMelody} from "abletonClip_FlautaMelody";

import {CarimboScale} from "abletonClip_CarimboScale";
import {getPitches,extendScaleToFullRange, scaleToPitch, pitchToScale} from "scaleTools";
var scale = extendScaleToFullRange(getPitches(CarimboScale));



function sinOsc(rate, amplitude, offset=0) {

    return n => { 
    var time = n.time;
    if (n.target)
        time += n.target.time;        
        return (Math.sin(time * rate * Math.PI *2)/2+0.5)*amplitude+offset ;
    };
}

  var template= m().evt({pitch:[0,-3,-5,0,0],duration:[0.5,0.125,0.5,0.25,0.25],velocity:[0.65,0.5,0.3]}).metro(0.25)
//   .timesFromDuration()
  .bjorklund(8,3,0)
//   .durationsFromTime()
  ;


function noteSelect(n) {
  return n[0];
}

export var flautaModified = FlautaMelody.duration(0.25).pitch(n => n.pitch+ (n.time % 16 < 8 ? 12 : 0 ));

export var flautaVitor = FlautaMelody
.externalProp("beatDensity", params("1"), 5)

.externalProp("beatRotation", params("2"), 5)
.bjorklund(16,(n) => { 
 
    log("hey vitor ",n);
    return Math.ceil(((n.beatDensity/127)+0.01)*15)
},
(n) => { 
    return Math.floor(((n.beatRotation/127)+0.01)*4)
})
.durationsFromTime()
.pitch(pitchToScale(scale))
.arpeggiator(noteSelect,template)
.pitch(n => n.time %16 >= 8 ? n.pitch-2 : n.pitch)
.pitch(scaleToPitch(scale))

.automate("param1", sinOsc(1/8, 1))
;