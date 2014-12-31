
   log("nope");


export var mapToChordProg = wu.curryable((chordProg, nOrig) => {
    // return n.combine(chordProg);
//  log(
//      n.combine(chordProg.groupByTime()
//     .simpleMap(m => ({time: m[0].time, events: m}))).take(20).toArray());
 
  return nOrig.combine(
      chordProg.groupByTime().simpleMap(m => ({time: m[0].time, events: m})))
    .simpleMap((n) => {
    //   log(n);
      if (!n.previous)
        return n.set("pitch",60);
        
      var chordNotes = n.previous.events;
      var prevNote = n.pitch;
      
      var chordNoteIndex = (prevNote-60+(chordNotes.length*1000))%chordNotes.length;
      var octaveSelect = 12*Math.floor((prevNote-60)/chordNotes.length);
      
      var transformedPitch = chordNotes[chordNoteIndex].pitch+octaveSelect;
      
      log(transformedPitch);
      
      var transformedNote = n.set("pitch",transformedPitch);
      
      
    //   log(octaveSelect); 
      
      
      log(transformedNote);
      
        //     if (true || !n.previous)
        //  return n.set("pitch",60);
        
      return transformedNote;
  });
});

log("yep");


