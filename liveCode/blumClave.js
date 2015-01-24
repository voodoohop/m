

var swing= (n) => n.swing(1/4,0.15);

// var param1 = 0.5;
// var param2 = 0.5;

function sinOsc(rate, amplitude, offset=0) {

    return n => { 
    var time = n.time;
    if (n.target)
        time += n.target.time;        
        return (Math.sin(time * rate * Math.PI *2)/2+0.5)*amplitude+offset ;
    };
}

export var blumClave = m()
.evt({pitch:60, velocity:[0.5,0.7,0.4,0.5], duration:0.1})
.externalProp("beatDensity", params("1"), 50)
.externalProp("beatRotation", params("2"), 50)
.metro(0.5).simpleMap(n => {
    //  log(n);
    return n;
})
.bjorklund(16,(n) => { 
    return Math.ceil(((n.beatDensity/127)+0.01)*15)
},
(n) => { 
    return Math.floor(((n.beatRotation/127)+0.01)*4)
}
)
// .filter(n => n.time%16 <15)
// .filter(n => n.time%32 <16)
.automate("param1", sinOsc(1/48 ,1))
.automate("param2", sinOsc(1/96, 1)) 

;



// params("1").onValue(v => param1 = v/127);

// params("2").onValue(v => param2 = v/127);