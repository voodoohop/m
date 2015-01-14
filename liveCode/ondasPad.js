import {arpedPercArped1} from "arpedPerc";


export var toMerge = arpedPercArped1.delay(-12).takeWhile(n => n.time < 8).loopLength(8)
.prop("arpedMerge",1).prop("color","orange").pitch(32);

export var ondasPad = m().evt({pitch:[71,47,59], duration: 4, velocity: 0.5}).metro(8).merge(toMerge).automate("param1",n => {
    if (n.target.arpedMerge)
        return 1;
    else
        return 0;
});