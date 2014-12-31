// import {kick} from "abletonClip";
var kickGrid=1;

import {CarimboRhythm} from "abletonClip_CarimboRhythm";

var kick_template=CarimboRhythm
.set({pitch:60,velocity:[0.9,0.6,0.8,0.5,0.8], duration:0.1})


export var kick=kick_template
// .swing(1/4,0.1)
.automate("param1",(n) => Math.abs((n.evt.time)%8-4)/4);
// .automate("param2",(n) => Math.abs((n.evt.time+8)%24-12)/12);
// .automate("pitchBend", n => Math.sin((n.time+n.evt.time)*Math.PI/1)/4+0.5);4
 
 
export var tomFromKick=kick_template.automate("param1",(n) => Math.abs((n.evt.time)%16)/16).delay(2);