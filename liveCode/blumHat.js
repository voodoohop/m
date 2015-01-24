
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





export var hat = m().evt({pitch:60,velocity:[0.7,0.5,0.6], duration:0.1}).metro(1).delay(0.5)
.filter(n => n.time%64 >32)
// .filter(n => n.time%128 <120)

.invoke(swing)
.automate("param1", n=> (n.target.time % 32)/32)
.automate("param2", sinOsc(1/128, 1)) 

;

// params("1").onValue(v => param1 = v/127);

// params("2").onValue(v => param2 = v/127);



