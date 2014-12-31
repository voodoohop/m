import {CarimboNaRoca2 as harmony} from "ableton";

export var rhythmHarmony = harmony.duration(1).simpleMap(n => {
var res= {
   events: [
       n.set("time",n.time+0.5),
       n.set({time:n.time+3,duration:0.5}),
       n.set({time:n.time+4.5,duration:0.5,pitch:n.pitch, velocity:n.velocity}),
       n.set({time:n.time+5.5,duration:0.5,pitch:n.pitch-12, velocity:n.velocity}),
       n.set({time:n.time+6.5,duration:1,pitch:n.pitch, velocity:n.velocity}), 
       n.set({time:n.time+7.75 ,duration:0.5,pitch:n.pitch, velocity:n.velocity}) 

   ],
   time: n.time
};
return res;
}).flattenAndSchedule();//.map(n => [{time: n.time}]) ;

