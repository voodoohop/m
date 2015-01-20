m().addGen(function* arpeggiator(noteSelector,templateSequence, node) {

  //log(""+m(node).groupByTime().map(n => m(templateSequence).pitch(nTemplate => nTemplate.pitch+n[0].pitch).delay(n[0].time)) );
  templateSequence = m(templateSequence);


  var applyTemplate= (note) =>  {
    var takeCount=0;


    return templateSequence
    // .take(8)
    .takeWhile(nt => {
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
//         yield

//     }

//     // for (let time=n.time)
// }
});



m().addGen(function* arpeggiator2(noteSelector,templateSequence, node) {

  //log(""+m(node).groupByTime().map(n => m(templateSequence).pitch(nTemplate => nTemplate.pitch+n[0].pitch).delay(n[0].time)) );
  templateSequence = m(templateSequence);


  var applyTemplate= (note,noteSelector) =>  {
    var takeCount=0;


    return templateSequence
    // .take(8)
    .takeWhile(nt => {
      return  nt.time < noteSelector(note,nt).duration

    })
    .time(n => n.time+noteSelector(note,n).time)
    .pitch(nTemplate => nTemplate.pitch + noteSelector(note,nTemplate).pitch)
    // .toArray();
  }

  yield* m().getIterator(m(node).groupByTime().map(n => {


    // log("got here");

    // var selectedNotes = noteSelector(n);

    // log("got here too", selectedNotes);

    // if (!selectedNotes.length)
    //     selectedNotes=[selectedNotes];
    // log("got here too", selectedNotes);
    var res = applyTemplate(n,noteSelector);// R.chain(n => applyTemplate(n),selectedNotes)

    // log(res.toArray());

    return res;
  })
);

// for (let n of node) {
//     // if (n.length)
//     for (let nTemplate of templateSequence) {
//         yield

//     }

//     // for (let time=n.time)
// }
});
