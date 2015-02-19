import {TapsGroove} from "abletonClip_TapsGroove";
import {NiceHummingChords} from "abletonClip_NiceHummingChords";

export var accent = n => n.velocity(n => {
var accent=(Math.abs(((n.time+1)%4)-2)/2);
return accent*n.velocity;
})

export var accentLength = n => n.duration(n => {
var accent=(Math.abs(((n.time+1)%4)-2)/2);
return accent*n.duration;
})

export var synthTaps = TapsGroove.pitch(62).bjorklund(16,15,2).velocity([0.3,0.7,0.8,0.2]).delay(0.5).invoke(accent);

export var bassTaps = TapsGroove.pitch(74)
.bjorklund(16,9,0)
.filter(n => {
    var t = n.time % 4;
    return t > 1 && t<4;
})

.velocity([0.3,0.7,0.8,0.2]).delay(2).duration(0.2).invoke(accent);

export var acidTaps = TapsGroove.pitch(62)
.bjorklund(8,5,2)
.filter(n => {
    var t = n.time % 4;
    return ( t>=3.25);
})
.velocity([0.3,0.7,0.8,0.2]).delay(0).duration(0.6).invoke(accent).invoke(accentLength).duration(n => n.duration+0.1);

export var harmonizedAcidTaps = acidTaps.combine(NiceHummingChords.groupByTime().simpleMap(n => ({notes:n, time:n[0].time, duration:n[0].duration})))
.map(n => {
    if (!n.previous)
        return n;
    return [
        n.set({pitch:n.previous.notes[0].pitch, time:Math.round((n.time-0.25)*4)/4, duration:0.3}),
        n.set({pitch:n.previous.notes[2].pitch, time:Math.round((n.time)*4)/4,duration:0.2})
        ];
})
;

export var acidModulate = 
acidTaps.delay(-0.2).duration(n => n.duration+0.2).automate("param1",n => n.time < n.duration-0.2 ? 1 : 0);