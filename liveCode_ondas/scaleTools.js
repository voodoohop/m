

// var testSeq=m().evt({pitch: [40,45], duration:0.2, velocity:0.9}).metro(0.2)

export var getPitches = function(sequence) {
    // log ("hey",typeof m(sequence).reduce);
    // log(immutable());
    var pitches = m(sequence).take(128)
        .reduce((prev,n) => n && n.pitch !==undefined ? prev.set(n.pitch, true) : prev, immutable());
    // log("ho");
    // log(Object.keys(pitches));
    return Object.keys(pitches).map(n => Number(n).valueOf());
}

// log(getPitches(testSeq));

export var extendScaleToFullRange=(pitches) => m(pitches).map(p => m().count(p%12,12).take(10)).toArray();

export var pitchToScale =wu.curryable((scale, n) => R.indexOf(n.pitch,scale));

export var scaleToPitch = wu.curryable((scale, n) => {
    // log(n.pitch);
    if (scale[n.pitch] === undefined) {
        log(n.pitch," ",scale);
        return 0;
    }
    return scale[n.pitch];
});

// ,scaleToPitch

log(m().count(2%12,12).take(10).toArray());

log(extendScaleToFullRange([6,3,4,5]));

log(m([6,3,4,5]).simpleMap(n => [n+3,n]).flattenAndSchedule().toArray());
// ,pitchToScale,scaleToPitch

