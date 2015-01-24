function run(m, t, baconParam, teoria) {

  //var chordProg = ["F","Fmaj7","Dm7","Csus4"];
  //var chordProg = "Dm / Am / Dm / Bb / F / C / Dm / Dm / Bb / Gm / Dm / Dm / A / A / A".split(" / ");
  var chordProg = "E7 F#7 E7 F#7 Cmaj9 A7 D9 Gmaj9 Cmaj9 F#7 b5 B7".split(" ");
  var chordProgMap = (n) => {
      var barNo = Math.floor(n.time / t.bars(1));
      var currentChord = teoria.chord(chordProg[barNo % chordProg.length]);
      var chordNotes = currentChord.notes().map(note => note.key());
      var prevNote = n.pitch;
      var transformedNote = chordNotes[(prevNote - 64 + (chordNotes.length * 1000)) % chordNotes.length] + 12 * Math.floor((prevNote - 64) / chordNotes.length);
      return {
        pitch: transformedNote
      };
    }
    //
    //
    // var s=m.note().duration(t.beats(1/32.0)).loop().pitch([64,65,70]).velocity([30,40,50,60,70,80,90,60,40,30,20,30])
    //               .metro(t.beats(1/4.0)).swing(t.beats(1/2.0),0.2).map(chordProgMap);
    // var s2=m.note().duration(t.beats(0.125)).loop().pitch([64,66,63,65]).velocity([30,40,50,60,70,80,90,60,40,30,20,30])
    //               .metro(t.beats(1/4.0)).swing(t.beats(1/2.0),0.05).map(chordProgMap);
    //
    // var s3=m.note({duration:t.beats(0.125), velocity: 60}).loop().velocity([20,30,40,50,55,60,65,70,75,80,82,83,84,90,100,110]).eventCount().pitch([(s)=> (s.count % 8 > 3 ? 63:62)]).metro(t.beats(1/4.0)).swing(t.beats(1/2.0),0.1).map(chordProgMap);
    //
    // var structure=m.evt().loop().set({
    //   type:            ["peak","break","peak","break","peak","outro"],
    //   duration: t.bars(4,4, 8, 4)
    // }).timeFromDurations();
    //
    //
    //
    // var branched = structure.branch((structureEvent) => structureEvent.type == "peak", s.eventCount().filter(() => s.count % 6 != 0),s2);
    //
    //
    //
    //
    // // var marimba = structure.flatMap((s) => {
    // //   if (s.type == "intro")
    // //     return s;
    // //   if (s.type == "break")
    // //     return s2;
    // //   return s;
    // // });
    //
    // //play("test3", s.map((s) => s.set({pitch: s.pitch+12, time: s.time - t.beats(1/6.0)}).count().filter((n)=>n.count % 3 == 0)));
    //
    // //return;
    // //play("test1",testSeq);
    //
    //
    // //play("test2",branched);
    // var seq44 = m.note().externalProperty("durationModifier", baconParam("1"), 127).loop().set({
    //   pitch: [64,63,70,68,67,69],
    //   duration: (n) => { return Math.ceil((n.durationModifier+1)/8)*t.beats(1/32)},
    //   velocity: m.value([40,70,100,80,80,0,80,90])
    // }).timeFromDurations();
    //
    // var seq45 = m.note().loop().set({
    //   pitch: m.value(m.count(70,-1)).take(7).filter((n) => n % 2==0).loop(),
    //   duration: (n) => { return Math.ceil((n.durationModifier+1)/8)*t.beats(1/32)},
    //   velocity: m.value([70,100,80,80,0,80,90,0,100,100,90,70,60,50,40,30])
    // }).timeFromDurations().duration(() => Math.random() * t.beats(1.5) ).map((n) => {velocity: ((n.time % t.bars(5))/t.bars(8)+1)/2*n.velocity}).swing(t.beats(0.5),0.07).swing(t.bars(2),0.03).map(chordProgMap);
    //
    // // for (let e of getIterator(seq44)) {
    // //   console.log("seq44",e.durationModifier);
    // // }
    //
    //
    // var branched2 = structure.branch((s) => s.type == "peak",
    //   seq44,
    //   structure.branch((s) => s.type=="break",
    //    seq44.pitch(62).velocity(80,90,110).map(chordProgMap), seq44.map((s) => s.set({pitch: s.pitch+3, time:s.time+t.beats(0.25)}).map(chordProgMap))))
    //
    //
    //
    // var cSeq = m.automate("pitchBend", (time,e) => Math.sin(time/t.beats(1.0))*1+64 ).set({duration:t.bars(256)}).timeFromDurations();
    //
    //
    // //for (let c of getIterator(cSeq)) {
    // //  console.log("continuous",c);
    // //}
    // //console.log("evaluated continuous");
    // //return;
    // //seq44.map(chordProgMap).play(OSCSequencer);
    // //seq45.map(chordProgMap).play(OSCSequencer);
    // //cSeq.play(OSCSequencer);
    //
    // console.log("seq45ToS "+seq45);
    //
    // //return [seq45, cSeq];
    //
    // var valToNoteTest3 = m.note({pitch:1, duration:10})
    //   .loop()
    //   .set({pitch:[60,61,63]})
    //   //.set({pitch: m.value().count(70,-1).take(7).filter((n) => n % 2==0)})
    //   .set({velocity: m.value([70,100,80,80,0,80,90,0,100,100,90,70,60,50,40,30])})
    //   //.set(bla: (n) => {console.log("inSet",n); return Math.random()}})
    //   .set({test2: m.value().loop().setValue([20,30,40,50])}).metro(t.beats(1/2.0)).swing(t.beats(0.5),0.07);
    //
    // var valToNoteTest = m.note({pitch:60,duration: t.beats(0.2), velocity:100,time:0}).loop()
    //   .set({velocity: m.value([70,100,80,80,0,80,90,0,100,100,90,70,60,50,40,30]).loop()})
    //   .set({test2: m.value().loop().setValue([20,30,40,50])})
    //   .pitch([68,65,73]).metro(t.beats(1/8.0)).duration(() => Math.random() * t.beats(1.5) ).map(chordProgMap).swing(t.beats(0.5),0.07);
    // //console.log("LIVECODE: VAAAAALToNOOOTE3",[for (e of valToNoteTest3) e]);
    //
    // var seq46 = m.note({pitch:50}).externalProperty("durationModifier", baconParam("1"), 127).loop().set({
    //   pitch: 60,//m.value().count(75,-1).take(5).filter((n) => n % 1==0),
    //   baseDuration: t.beats(4),//(n) => { return Math.ceil((n.durationModifier+1)/8)*t.beats(1/32)},
    //   velocity: m.value([70,100,80,80,2,80,90,30,100,100,2,70,60,1,40,30,2])
    // })
    // .duration((n) => n.baseDuration)
    // .timeFromDurations()
    // .duration((n) => n.baseDuration/2 )
    // .set((n) => {velocity: ((n.time % t.bars(5))/t.bars(8)+1)/2*n.velocity})//.swing(t.beats(0.5),0.07)
    // //.velocity(100)
    // .set((n) => {time: n.time+t.beats(0)})//.swing(1/4, 0.4);
    // //.swing(t.beats(0.5),0.1)
    // .map(chordProgMap);
    // ;
    //
    // var seqsimple = m.note({pitch:62,velocity:100, duration:t.beats(1/16)}).loop().pitch([66,65,67,72,68,59]).velocity([80,80,0,80,60,0,20,0,50,0,90,80,0,20,40])
    // .metro(t.beats(1/4))
    // .duration(t.beats(1/8))
    // .delay(t.beats(1/4))
    // .velocity((n) => n.velocity +1)
    // .map(chordProgMap)
    // .swing(t.beats(0.25),0.15);
    //
    // var cSeq = m.automate("pitchBend", (time,e) => Math.sin(time/t.beats(1.0))*30+64 ).set({duration:t.bars(1)}).loop().timeFromDurations();
    //
    //
    // var simple666 = m.note({pitch:73,velocity:5}).loop()
    // .pitch([73,70,74,77,60])
    // .metro(t.beats(2))
    // .duration(t.beats(0.25))
    // .velocity((n) => n.time % t.bars(8)/t.bars(8)*50+n.velocity)
    // .map(chordProgMap)
    // .delay(t.bars(1/3));
    // //console.log(c2

  var cSeq = m.value((time, e) => {
    console.log("tim", time, time / t.beats(4));
    return Math.sin(time / t.beats(16) * 2 * Math.PI) * 3 + 64;
  }).set({
    duration: t.bars(0.5)
  }).loop().timeFromDurations().automatePlay("pitchBend");

  var seqsimple = m.evt({
    pitch: 64,
    duration: t.beats(1 / 3),
    velocity: 100
  }).loop().metro(t.beats(1 / 4)); //.delay(t.beats(1/2)).pitch([70,70,65,68,62,61,62,64,65,66,70,68]).velocity([0,80,0,70,0,60,59,0,70,22,0,44,55])
  //.map((n) => [n
  // ,{pitch:n.pitch+1}
  //])
  //.swing(t.beats(0.25),0.1).map(chordProgMap).notePlay();

  var s2 = m.evt({
    pitch: 64,
    duration: t.beats(1),
    velocity: 100
  }).loop().metro(t.beats(2));

  var structure = m.evt().repeat(5).set({
    name: ["intro", "break", "peak", "break", "intro"],
    duration: t.bars(4, 2, 4, 2, 4)
  });

  //for (let s of structure)
  //  console.log(s);



  //for (let s of structure)
  //  console.log('struct',s);
  //return;


  //var structured = structure.time((s) => s.time-t.bars(0.5)).branch((s) => ])
  return [
    //seqsimple.pitch((n) => n.pitch+24).delay(t.beats(0.125)),
    //simple666
    //cSeq,
    structure.map((s) => s.name == "peak" ? seqsimple : s2)
    //seqsimple.pitch((n) => n.pitch+12).delay(t.beats(0.25))
  ];

}

//console.log("bla");

module.exports = {
  run: run
};