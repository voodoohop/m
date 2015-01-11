
import {modelMelody as offMelody} from "abletonClip_modelMelody";


log("hey");

log("hello peter");



export var offMelodyForClave = offMelody.delay(-0.2).automate("param1", (n) => {
  var lowPitch =78;
  var highPitch=102;
  var pitch = n.target.pitch;
//   log(pitch); 

  while (pitch<lowPitch)
     pitch+=12;
  while (n.pitch>highPitch)
     pitch-=12;
     
    log(pitch);
    var pitchRatio = (pitch-lowPitch)/(highPitch-lowPitch);
    // log(pitchRatio);
    return pitchRatio;
}).delay(0.2);

    log("hey3");
log("hey4");