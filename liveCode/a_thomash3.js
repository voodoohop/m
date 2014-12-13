import {kick} from "thomash";

export var kick_thomash3=kick.pitch(50).prop("color", "yellow").duration(0.25).cache()
.automate("pitchBend",n => (n.time+n.evt.time)%1).cache();


