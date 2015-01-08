import {flauta} from "abletonClip_flauta";

import {flautaArpBase} from "abletonClip_flautaArpBase";

import {flautaNotas} from "abletonClip_flautaNotas";

import {getPitches,extendScaleToFullRange,pitchToScale,scaleToPitch} from "scaleTools";

var scale = extendScaleToFullRange(getPitches(flautaNotas));//.map(n => n.pitch-);

log(scale);

var flautaInScale = flautaArpBase.pitch(pitchToScale(scale));
 



m().addGen(function* arpeggiator(noteSelector,templateSequence, node) {
    
     //log(""+m(node).groupByTime().map(n => m(templateSequence).pitch(nTemplate => nTemplate.pitch+n[0].pitch).delay(n[0].time)) );
    templateSequence = m(templateSequence);
       
       
        var applyTemplate= (note) =>  {
            var takeCount=0;
            
           
            return templateSequence
                // .take(8)
                 .takeWhile(nt => { 
                     log(nt.time, " ", note.duration," ",takeCount++);
                    return  nt.time < note.duration
                     
                 })
                 .time(n => n.time+note.time)
                 .pitch(nTemplate => nTemplate.pitch+note.pitch)
                // .toArray();
        }

    yield* m().getIterator(m(node).groupByTime().map(n => { 
        

        // log("got here");
        
        var selectedNotes = noteSelector(n);
        
        // log("got here too", selectedNotes);
        
        // if (!selectedNotes.length)
        //     selectedNotes=[selectedNotes];
                // log("got here too", selectedNotes);
        var res = applyTemplate(selectedNotes);// R.chain(n => applyTemplate(n),selectedNotes)

        // log(res.toArray());
        
        return res;
    })
    );
    
    // for (let n of node) {
    //     // if (n.length)
    //     for (let nTemplate of templateSequence) {
    //         yield ;
            
    //     } 
        
    //     // for (let time=n.time)
    // }
});


m().addGen(function* arpeggiator(noteSelector,templateSequence, node) {
    
     //log(""+m(node).groupByTime().map(n => m(templateSequence).pitch(nTemplate => nTemplate.pitch+n[0].pitch).delay(n[0].time)) );
    templateSequence = m(templateSequence);
       
        var applyTemplate= (note) =>  {
            var takeCount=0;
           
            return templateSequence
                // .take(8)
                 .takeWhile(nt => { 
                     log(note," ",nt.pitch," ",nt.time, " ", note.duration," ",takeCount++);
                    return  nt.time < note.duration
                     
                 })
                 .time(n => n.time+note.time)
                 .pitch(nTemplate => nTemplate.pitch+note.pitch)
                // .toArray();
        }

    yield* m().getIterator(m(node).groupByTime().map(n => { 
        var selectedNotes = noteSelector(n);
        
        // if (!selectedNotes.length)
        //     selectedNotes=[selectedNotes];
                // log("got here too", selectedNotes);
        var res = applyTemplate(selectedNotes);// R.chain(n => applyTemplate(n),selectedNotes)

        // log(res.toArray());
        
        return res;
    })
    );
    
});

var arpTemplate = m().evt({pitch:
[0,3,0,-2,0,1,0,-1,0,0],
// 0,
duration:[0.3,0.2,0.5,0.1],
velocity: //0.7 
[0.9,1,0.7]
    
}).metro(1/4);

var arpNoteSelector = (notes) => notes[notes[0].time % 32 < 16 ? notes.length-1:0];



export var flautaAcid = m(flautaInScale).arpeggiator(arpNoteSelector,arpTemplate)
.pitch(scaleToPitch(scale))
.bjorklund(16,9,0)
.filter(n =>  ((n.time-1) %2 > 0.5))
.swing(1/4,0.1)
.duration([0.2,0.3,0.2,0.5])

// .delay(-24)
// .skip(24)
.automate("param1", n => Math.sin(n.target.time*Math.PI/16) /2 +0.5)
.automate("param2", n => Math.sin(n.target.time*Math.PI/12) /2 +0.5)

// .automate("pitchBend", n=> Math.max(1-(((n.target.time+n.time)/2) % 2) ,0.5))
;

export var acidBasedPerc = flautaAcid.pitch(60).duration(0.1)//.automate("param1", (n) => 0.5)
.delay([-0.25,0.75])//.combine(flautaAcid).pitch(n => n.next.time - n.time < 0.1 ? n.pitch+3:n.pitch);

// log(m(flautaInScale).groupByTime().take(16).toArray());

// export var flauta_modificada2 = flautaInScale//.duration(0.2)
// // .pitch(n => n.pitch+12)
// .bjorklund(16,9,0)

// .map(n => [n.set({pitch: n.pitch-2, time: n.time-0.25, duration:0.1, velocity:0.2}), 
// n.set({pitch: n.pitch+2, time: n.time-0.5, duration:0.1, velocity:0.2}), 
// n.set({pitch: n.pitch, time: n.time+0.25, duration:0.2, velocity:0.2}), 
// // n.set({pitch: n.pitch+1, time: n.time+0.25, duration:0.2, velocity:0.2}), 
// n.set({pitch: n.pitch+1, time: n.time})])
// // .automate("pitchBend", n => {
// //     return n.target.time % 32 < 2 ? 1 - (n.target.time%4)/8 - 0.25  : 0.5
// // })
// // .duration([0.1,0.3]).delay([0,0.5])
// .pitch(scaleToPitch(scale)).pitch(n => n.pitch-24)
// .automate("param1", n => Math.sin(n.target.time*Math.PI/8) /2 +0.5)
// .automate("param2", n => Math.sin(n.target.time*Math.PI/4) /2 +0.5)
// ;



// log(flauta_modificada.take(5).toArray());
// .automate("param1", n => {
//   return Math.sin((n.target.time+n.time)*4*Math.PI*2)/2+0.5; 
// });
// .swing(1/4,0.1)

// .delay([0,1,1.5]);
 
// log("hey");


// log(scale);

