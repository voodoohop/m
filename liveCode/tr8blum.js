

var swing= (n) => n.swing(1/4,0.15);

var param1 = 0.5;
var param2 = 0.5;

export var kick2 = m()
.evt({pitch:60, velocity:0.5, duration:0.1})
// .externalProp("beatDensity", params("1"),50)
.metro(0.25).filter(n => n.time %1 !==0).simpleMap(n => {
    // log(n);
    return n;
}).bjorklund(32,() => { 
    return Math.ceil((param1+0.01)*31)
},
() => { 
    return Math.floor((param2+0.01)*8)
}
);



export var kick = m().evt({pitch:60,velocity:0.9, duration:0.1}).metro(1).merge(kick2)
.filter(n => n.time%32 <30)
.invoke(swing);

params("1").onValue(v => param1 = v/127);

params("2").onValue(v => param2 = v/127);



