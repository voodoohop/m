// import {kick} from "abletonClip";
var kickGrid=2;
5
export var kick=m.evt({pitch:[54,60,65],velocity:0.9, duration:kickGrid-0.5}).cache().metro(kickGrid)
.automate("pitchBend", n => Math.sin((n.time+n.evt.time)*Math.PI/1)/4+0.5).cache();


export var tom=m.evt({pitch:60,velocity:0.7, duration:0.1,color:"yellow"}).metro(0.2).bjorklund(16,9,2);
    
export var hat=m.evt({pitch:[48,60],velocity:[0.3,0.5,0.7,0.3,0.6], duration:0.1}).metro(0.25).bjorklund(4,3,0).swing(1/4,0.15).cache();

export var kick_real=m.evt({pitch:60,velocity:[0.9,0.7,0.8], duration:0.1}).metro(1).cache();
// .automate("pitchBend", n => Math.sin((n.time+n.evt.time)*Math.PI/8)/4+0.5)

