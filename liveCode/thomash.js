


var pitchMap=wu.curryable(function(pitches,node) {
    return node.pitch(n => n.pitch+pitches[Math.floor(n.time/4%pitches.length)]);
});

var tPitchMap=pitchMap([2,0,3,4,-12,-5,12,12]);
//var tPitchMap=pitchMap([0]);

export var marimba2=tPitchMap(m.evt({pitch:32,duration:0.2,color:"red",velocity:[0.9]})
.metro(0.25)
//.bjorklund(8,6,0)
.automate("param1", n => (n.time+n.evt.time) % 4 /4)
.automate("pitchBend", n => (n.time+n.evt.time) % 64 /64))
;



