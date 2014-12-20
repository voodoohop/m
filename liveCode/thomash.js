// import {kick} from "abletonClip";
var kickGrid=1;

export var kick=m().evt({pitch:60,velocity:[0.9,0.6,0.8,0.5,0.8], duration:0.1}).metro(1).bjorklund(64,37,0).swing(1/4,0.1)
.automate("param1",(n) => Math.abs((n.evt.time)%32-16)/16)
.automate("param2",(n) => Math.abs((n.evt.time+8)%24-12)/12);
// .automate("pitchBend", n => Math.sin((n.time+n.evt.time)*Math.PI/1)/4+0.5);4
