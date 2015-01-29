

import {songUnit, songStructureUnit, songUnitEaser,periodicEaser} from "overallAutomator"; 


var fillTransform = (node) => node.delay(0.5);

var fillDuration = 2;

var isAtFill = n => n.time % songStructureUnit >= songStructureUnit-fillDuration

var isFirstDownBeat = n => n.time%songStructureUnit === 0;

var not = wu.curryable((f,n) => !f(n));

function buildToFill(n) {
    return periodicEaser(n.time+n.target.time,"in-expo", songUnit) ;
}


var kick = m().note().pitch(36).metro(1)
.filter(not(isAtFill))
.filter(not(isFirstDownBeat))

;



var fillKick = kick.metro(2/3).bjorklund(8,5,0).velocity([0.5,0.9]).filter(isAtFill);

export var generativeKick = kick.merge(fillKick);



var closedHat = m().note().pitch(41).metro(0.5)
.combine(generativeKick).filter(n => {
    // if (n.next)
    //     log(n.next.time-n.time);
    return n.next.time-n.time>0;
})
.filter(not(isAtFill));
// .automate("param1", buildToFill);

var breakHat=closedHat.metro(2/3).filter(isAtFill);

closedHat=closedHat.merge(breakHat);

export var swingHat = closedHat;

export var combined = generativeKick.merge(swingHat).swing(0.25,0.1).automate("param1", buildToFill);