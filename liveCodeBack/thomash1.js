export var kick=m.evt({pitch:60,duration:0.4,velocity:0.9}).bjorklund(16,8,0).metro(1);

export var kick3=m.evt({pitch:40,duration:0.1,velocity:0.9})
.metro(0.5)
.automate("pitchBend",(n) => ((n.time+n.evt.time) % 8 )/ 8);

export var hat=m.evt({pitch:60,velocity:[0.5,0.8,0.6],duration:0.1}).metro(1).delay(0.5)