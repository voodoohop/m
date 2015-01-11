


import {CarimboNaRoca} from "abletonClip_CarimboNaRoca";

import {mapToChordProg} from "scaleTools";

export var chords = CarimboNaRoca;
 
var chordProg = mapToChordProg(CarimboNaRoca);

log("chordProgMapping",chordProg); 

// console.log(); 

export var arpeggiated = m().evt({
    // pitch: [60,58,62], 
    velocity:[0.6, 0.7,0.5],
    duration: 0.2, color:"yellow"}) 
.loop()
.metro(1/6)
.bjorklund(16,13,0)
.pitch(n => Math.floor(Math.sin(n.time*Math.PI/4)*4)+60 )

// .duration(n => time%32/128+0.01)
.invoke(chordProg)
.pitch(n => {
    log(n.pitch);
    return n.pitch > 65 ? n.pitch-12:n.pitch;
})

// .simpleMap(n => n.set("previous2", false).set("next", false))

for (let n of arpeggiated.take(4))
  log("arpeggiated",n);

// .simpleMap(n =>{
//     log(n);
//     return n;
// })
// .log("arped")






// .invoke(chordProg)
// .combine(CarimboNaRoca);

log(arpeggiated);








var arped = arpeggiated.take(2);
console.log("helloooo before");
for (let n of arped)
    console.log("arped",n);
console.log("end")


// toArray().forEach(log);















 


