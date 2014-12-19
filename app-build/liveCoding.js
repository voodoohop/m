"use strict";
function run(m, t, baconParam, teoria) {
  var chordProg = "E7 F#7 E7 F#7 Cmaj9 A7 D9 Gmaj9 Cmaj9 F#7 b5 B7".split(" ");
  var chordProgMap = (function(n) {
    var barNo = Math.floor(n.time / t.bars(1));
    var currentChord = teoria.chord(chordProg[$traceurRuntime.toProperty(barNo % chordProg.length)]);
    var chordNotes = currentChord.notes().map((function(note) {
      return note.key();
    }));
    var prevNote = n.pitch;
    var transformedNote = chordNotes[$traceurRuntime.toProperty((prevNote - 64 + (chordNotes.length * 1000)) % chordNotes.length)] + 12 * Math.floor((prevNote - 64) / chordNotes.length);
    return {pitch: transformedNote};
  });
  var cSeq = m.value((function(time, e) {
    console.log("tim", time, time / t.beats(4));
    return Math.sin(time / t.beats(16) * 2 * Math.PI) * 3 + 64;
  })).set({duration: t.bars(0.5)}).loop().timeFromDurations().automatePlay("pitchBend");
  var seqsimple = m.evt({
    pitch: 64,
    duration: t.beats(1 / 3),
    velocity: 100
  }).loop().metro(t.beats(1 / 4));
  var s2 = m.evt({
    pitch: 64,
    duration: t.beats(1),
    velocity: 100
  }).loop().metro(t.beats(2));
  var structure = m.evt().repeat(5).set({
    name: ["intro", "break", "peak", "break", "intro"],
    duration: t.bars(4, 2, 4, 2, 4)
  });
  return [structure.map((function(s) {
    return s.name == "peak" ? seqsimple : s2;
  }))];
}
module.exports = {run: run};
