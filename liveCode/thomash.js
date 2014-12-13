// import {kick} from "abletonClip";
var kickGrid=0.3;

export var kick=m.evt({pitch:60,velocity:0.9, duration:kickGrid-0.002}).cache().metro(kickGrid).cache()
.automate("pitchBend", n => 0.5).cache();
    
export var hat=m.evt({pitch:60,velocity:0.9, duration:0.2}).metro(1).delay(0.2).cache();




