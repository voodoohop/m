// import {kick} from "abletonClip";
var kickGrid=2;

export var kick=m.evt({pitch:[54,60],velocity:0.9, duration:kickGrid-0.5}).cache().metro(kickGrid);
// .automate("pitchBend", n => 0.5).cache();


export var tom=m.evt({pitch:60,velocity:0.7, duration:0.1,color:"yellow"}).metro(0.25).bjorklund(16,9,2);
    
export var hat=m.evt({pitch:60,velocity:0.9, duration:0.2}).metro(1).delay(0.2).cache();

