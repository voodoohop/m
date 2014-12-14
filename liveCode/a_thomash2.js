import {kick_thomash3} from "a_thomash3";

export var kick_thomash5=kick_thomash3.duration((n) => (Math.abs(n.time %64-32))/32 * 0.3+0.05)
.map(n => {
//   console.log(n);
  if (n.time%16 <8)
    return  [{time: n.time},{pitch:n.pitch+24,duration:n.duration/2, velocity:0.5}]
  else
    return n;
}
)

.prop("color","red").cache();
