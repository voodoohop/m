

import playing from "playing";

export var gola = m().evt({pitch:[60,52,68], velocity: [0.7,0.3,0.5], duration : [0.1,0.1]})
.metro(2)
.simpleMap(n => n.time % 16 < 2 ? n.set({velocity:0.3, color:"yellow"}): n)
.automate("param1", n => {
    return Math.sin((n.target.time+n.time) * Math.PI*2/32)/2+0.5;
}).pitch(n => n.pitch-12); 


// log(""+playing);
// // log(m(playing).toArray());

// setInterval(function() {
//     log(playing.take(2).toArray());
// },1000)

// log(""+playing);

export var gola2 = playing.pitch(n => n.pitch+24).duration(0.3).groupByTime().map(n=> {
var reps = 4;
var res=[];
for (var i=0;i<reps;i++)
 res = res.concat(n.map((n,ni) => n.set({time:n.time+1+i*0.75})));
 
return res;
    
}
).groupByTime().bjorklund(12,10,0).map(n=>n);   