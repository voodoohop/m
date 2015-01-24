"use strict";
Object.defineProperties(exports, {
  m: {get: function() {
      return m;
    }},
  CarimboNaRoca: {get: function() {
      return CarimboNaRoca;
    }},
  kick: {get: function() {
      return kick;
    }},
  tom: {get: function() {
      return tom;
    }},
  hat: {get: function() {
      return hat;
    }},
  kick_real: {get: function() {
      return kick_real;
    }},
  getPitches: {get: function() {
      return getPitches;
    }},
  extendScaleToFullRange: {get: function() {
      return extendScaleToFullRange;
    }},
  OndasGroove: {get: function() {
      return OndasGroove;
    }},
  OndasGrooveTest: {get: function() {
      return OndasGrooveTest;
    }},
  __esModule: {value: true}
});
var $__functionalM_47_baseLib__,
    $__functionalM_47_baseFunctionalGens__,
    $__functionalM_47_genexporters__,
    $__functionalM_47_musicalGens__,
    $__functionalM_47_asyncSequence__,
    $__lib_47_hrtimer__;
var mImported = ($__functionalM_47_baseLib__ = require("./functionalM/baseLib"), $__functionalM_47_baseLib__ && $__functionalM_47_baseLib__.__esModule && $__functionalM_47_baseLib__ || {default: $__functionalM_47_baseLib__}).m;
($__functionalM_47_baseFunctionalGens__ = require("./functionalM/baseFunctionalGens"), $__functionalM_47_baseFunctionalGens__ && $__functionalM_47_baseFunctionalGens__.__esModule && $__functionalM_47_baseFunctionalGens__ || {default: $__functionalM_47_baseFunctionalGens__});
($__functionalM_47_genexporters__ = require("./functionalM/genexporters"), $__functionalM_47_genexporters__ && $__functionalM_47_genexporters__.__esModule && $__functionalM_47_genexporters__ || {default: $__functionalM_47_genexporters__});
($__functionalM_47_musicalGens__ = require("./functionalM/musicalGens"), $__functionalM_47_musicalGens__ && $__functionalM_47_musicalGens__.__esModule && $__functionalM_47_musicalGens__ || {default: $__functionalM_47_musicalGens__});
($__functionalM_47_asyncSequence__ = require("./functionalM/asyncSequence"), $__functionalM_47_asyncSequence__ && $__functionalM_47_asyncSequence__.__esModule && $__functionalM_47_asyncSequence__ || {default: $__functionalM_47_asyncSequence__});
var hrTimer = ($__lib_47_hrtimer__ = require("./lib/hrtimer"), $__lib_47_hrtimer__ && $__lib_47_hrtimer__.__esModule && $__lib_47_hrtimer__ || {default: $__lib_47_hrtimer__}).default;
var assert = require("assert");
var m = mImported;
var _ = require("lodash");
console.log("mprototype", m.prototype);
var mTest = m({pitch: 10}).loop();
console.log("------", "" + mTest);
console.log("------", mTest.take(10).toArray());
console.log(mTest.take(20).toArray().length);
console.log(mTest.take(2).toArray());
console.log(mTest.take(5).toArray());
assert.equal(mTest.take(1).toArray()[0].pitch, 10);
assert.equal(mTest.take(20).toArray().length, 20);
var mEvtTest = m().evt({
  pitch: 10,
  velocity: [0.7, 0.8]
});
console.log(mEvtTest.take(10).toArray());
var test3 = m().count();
var countRes = test3.skip(10).take(10).simpleMap((function(n) {
  return n / 4;
})).toArray();
console.log("countRes", countRes);
assert.equal(countRes[countRes.length - 1], 4.75);
var eventCount = m().evt({
  pitch: 60,
  velocity: [20, 30]
}).eventCount().take(20);
console.log("evtCountToArray", eventCount.toArray());
assert.equal(_.last(eventCount.toArray()).count, 19);
assert.equal(_.last(eventCount.toArray()).count, 19);
assert.equal(_.last(eventCount.simpleMap((function(e) {
  return e.set("pitch", e.pitch + 10);
})).simpleMap((function(e) {
  return e.set({
    duration: 0.2,
    pitch: e.pitch + 10
  });
})).toArray()).pitch, 80);
assert.equal(eventCount.prop("color", "turquoise").skip(3).takeWhile((function(e) {
  return e.count < 5;
})).toArray()[0].count, 3);
var test4 = m().evt({pitch: 30}).duration(20);
console.log(test4.take(10).toArray());
console.log("---tests---");
var testMap = m().evt({
  pitch: 60,
  duration: 0.3,
  velocity: 1
}).metro(4).automate("param1", (function(n) {
  return 0.5;
})).automate("param2", (function(n) {
  return 0.2;
})).take(10);
console.log(testMap.take(10).toArray());
var CarimboNaRoca = m().data([{
  "pitch": 57,
  "duration": 7.99,
  "velocity": 0.7,
  "time": 0,
  "color": "yellow"
}, {
  "pitch": 64,
  "duration": 7.99,
  "velocity": 0.7,
  "time": 8,
  "color": "red"
}]).loopLength(16);
console.log("CarimboNaRocaTest", CarimboNaRoca.toPlayable().take(20).toArray());
var lowerNotes = CarimboNaRoca.groupByTime().simpleMap((function(n) {
  var meNote = n[0];
  return meNote;
})).map((function(n) {
  return m([n, n, n, n, n]);
})).pitch((function(n) {
  return n.pitch;
})).duration(1).delay([1, 3, 4, 5, 7]);
console.log("CarimboNaRocaTest2", lowerNotes.take(20).toArray());
var kickGrid = 2;
var kick = m().evt({
  pitch: [54, 60, 65],
  velocity: 0.9,
  duration: kickGrid - 0.5
}).metro(kickGrid).automate("pitchBend", (function(n) {
  return Math.sin((n.time + n.target.time) * Math.PI / 1) / 4 + 0.5;
}));
var tom = m().evt({
  pitch: 60,
  velocity: 0.7,
  duration: 0.1,
  color: "yellow"
}).metro(0.2).bjorklund(16, 9, 2);
var log = console.log;
var hat = m().evt({
  pitch: [48, 60],
  velocity: [0.3, 0.5, 0.7, 0.3, 0.6],
  duration: 0.1
}).metro(0.25).bjorklund(4, 3, 0).swing(1 / 4, 0.15);
var kick_real = m().evt({
  pitch: 60,
  velocity: [0.9, 0.7, 0.8],
  duration: 0.1
}).metro(1);
var profilerDataStore = [];
var profileSamples = 2000;
var startTime = hrTimer();
for (var $__2 = kick.toPlayable().take(profileSamples)[$traceurRuntime.toProperty(Symbol.iterator)](),
    $__3; !($__3 = $__2.next()).done; ) {
  var n = $__3.value;
  {
    var x = ({
      time: n.time,
      pitch: n.pitch,
      veloctiy: n.velocity,
      type: n.type
    });
  }
}
var timeTaken = hrTimer() - startTime;
log("time:", timeTaken);
log("-------------".bgRed);
console.log(kick.toPlayable().take(50).toArray()[49]);
for (var $__4 = tom.toPlayable().take(profileSamples)[$traceurRuntime.toProperty(Symbol.iterator)](),
    $__5; !($__5 = $__4.next()).done; ) {
  var n = $__5.value;
  {
    var cx = ({
      time: n.time,
      pitch: n.pitch,
      veloctiy: n.velocity
    });
  }
}
timeTaken = hrTimer() - startTime;
log("time:", timeTaken);
for (var $__6 = tom.toPlayable().take(profileSamples)[$traceurRuntime.toProperty(Symbol.iterator)](),
    $__7; !($__7 = $__6.next()).done; ) {
  var n = $__7.value;
  {
    var x = ({
      time: n.time,
      pitch: n.pitch,
      veloctiy: n.velocity,
      type: n.type
    });
    x = ({
      time: n.time,
      pitch: n.pitch,
      veloctiy: n.velocity,
      type: n.type
    });
    x = ({
      time: n.time,
      pitch: n.pitch,
      veloctiy: n.velocity,
      type: n.type
    });
  }
}
timeTaken = hrTimer() - startTime;
log("time2:", timeTaken);
for (var $__8 = tom.toPlayable().take(profileSamples)[$traceurRuntime.toProperty(Symbol.iterator)](),
    $__9; !($__9 = $__8.next()).done; ) {
  var n = $__9.value;
  var x = ({
    time: n.time,
    pitch: n.pitch,
    veloctiy: n.velocity
  });
}
timeTaken = hrTimer() - startTime;
log("time:", timeTaken);
var flautaArpBase = m().data([{
  "pitch": 72,
  "duration": 8,
  "velocity": 0.7874015748031497,
  "time": 0,
  "color": "yellow"
}, {
  "pitch": 76,
  "duration": 8,
  "velocity": 0.6299212598425197,
  "time": 0,
  "color": "yellow"
}, {
  "pitch": 74,
  "duration": 4,
  "velocity": 0.7874015748031497,
  "time": 8,
  "color": "yellow"
}, {
  "pitch": 77,
  "duration": 4,
  "velocity": 0.7874015748031497,
  "time": 8,
  "color": "yellow"
}, {
  "pitch": 71,
  "duration": 2,
  "velocity": 0.7874015748031497,
  "time": 12,
  "color": "yellow"
}, {
  "pitch": 76,
  "duration": 2,
  "velocity": 0.7874015748031497,
  "time": 12,
  "color": "yellow"
}, {
  "pitch": 71,
  "duration": 2,
  "velocity": 0.7874015748031497,
  "time": 14,
  "color": "yellow"
}, {
  "pitch": 74,
  "duration": 2,
  "velocity": 0.6929133858267716,
  "time": 14,
  "color": "yellow"
}]).duration((function(n) {
  return n.duration * 0.99;
})).loopLength(16);
var flautaInScale = flautaArpBase;
m().addGen(function* arpeggiator1(noteSelector, templateSequence, node) {
  templateSequence = m(templateSequence);
  var applyTemplate = (function(note) {
    var takeCount = 0;
    return templateSequence.takeWhile((function(nt) {
      log(nt.time, " ", note.duration, " ", takeCount++);
      return Number(nt.time).valueOf() < Number(note.duration).valueOf();
    })).time((function(n) {
      return n.time + note.time;
    })).pitch((function(nTemplate) {
      return nTemplate.pitch + note.pitch;
    }));
  });
  yield* m().getIterator(m(node).groupByTime().map((function(n) {
    log("got here too", selectedNotes);
    var selectedNotes = noteSelector(n);
    var res = applyTemplate(selectedNotes);
    return res;
  })));
});
var arpTemplate = m().evt({
  pitch: [0, 2, 0, -2, 0, 1, 0, -1, 0, 0],
  duration: [0.5, 0.3, 0.4],
  velocity: [0.9, 1, 0.7]
}).metro(1 / 2);
var arpNoteSelector = (function(notes) {
  return notes[notes.length - 1];
});
var flautaAcid = m(flautaInScale).arpeggiator1(arpNoteSelector, arpTemplate).automate("param1", (function(n) {
  return Math.sin(n.target.time * Math.PI / 16) / 2 + 0.5;
})).automate("param2", (function(n) {
  return Math.sin(n.target.time * Math.PI / 12) / 2 + 0.5;
}));
;
console.log("===start===");
m(flautaAcid).take(16).toArray().forEach((function(n) {
  return console.log(n);
}));
var getPitches = function(sequence) {
  var pitches = {};
  for (var $__10 = sequence[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__11; !($__11 = $__10.next()).done; ) {
    let n = $__11.value;
    if (n && n.pitch)
      pitches[n.pitch] = true;
  }
  return Object.keys(pitches).map((function(n) {
    return Number(n).valueOf();
  }));
};
var extendScaleToFullRange = (function(pitches) {
  return m(pitches).simpleMap((function(p) {
    return m().count(p % 12, 12).take(3).toArray();
  })).flattenAndSchedule().toArray();
});
log(extendScaleToFullRange([2, 3]));
var OndasGroove = m().data([{
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5196850393700787,
  "time": 4,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.28346456692913385,
  "time": 4.475468158721924,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4015748031496063,
  "time": 4.989764213562012,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.23622047244094488,
  "time": 5.516486167907715,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.6299212598425197,
  "time": 6,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.6771653543307087,
  "time": 6.2463531494140625,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 1,
  "time": 6.734462738037109,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5590551181102362,
  "time": 7.004249572753906,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.15748031496062992,
  "time": 7.481731414794922,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5511811023622047,
  "time": 8,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.41732283464566927,
  "time": 8.492384910583496,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.2992125984251969,
  "time": 8.787187576293945,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.49606299212598426,
  "time": 9.027570724487305,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.44881889763779526,
  "time": 9.454976081848145,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.49606299212598426,
  "time": 10,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4881889763779528,
  "time": 10.223350524902344,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.9212598425196851,
  "time": 10.692339897155762,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4645669291338583,
  "time": 11.00927734375,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.48031496062992124,
  "time": 11.429234504699707,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4645669291338583,
  "time": 12,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4881889763779528,
  "time": 12.447126388549805,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.23622047244094488,
  "time": 12.696270942687988,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4015748031496063,
  "time": 12.974640846252441,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.3543307086614173,
  "time": 13.471063613891602,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4330708661417323,
  "time": 14,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.44881889763779526,
  "time": 14.23709487915039,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.7165354330708661,
  "time": 14.72500991821289,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.29133858267716534,
  "time": 14.992319107055664,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.2125984251968504,
  "time": 15.472204208374023,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5354330708661418,
  "time": 16,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.2125984251968504,
  "time": 16.250415802001953,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.3779527559055118,
  "time": 16.453229904174805,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.2125984251968504,
  "time": 16.732837677001953,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4566929133858268,
  "time": 17.004894256591797,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.14173228346456693,
  "time": 17.15622901916504,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.2047244094488189,
  "time": 17.46550941467285,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.49606299212598426,
  "time": 18,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.44881889763779526,
  "time": 18.201942443847656,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.6141732283464567,
  "time": 18.68305015563965,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4645669291338583,
  "time": 18.971540451049805,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.11811023622047244,
  "time": 19.147428512573242,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.11023622047244094,
  "time": 19.444917678833008,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5275590551181102,
  "time": 20,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.2440944881889764,
  "time": 20.488140106201172,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.1968503937007874,
  "time": 20.72562599182129,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.44881889763779526,
  "time": 21.000890731811523,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.2677165354330709,
  "time": 21.494970321655273,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4409448818897638,
  "time": 22,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4015748031496063,
  "time": 22.227867126464844,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.6141732283464567,
  "time": 22.714706420898438,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.44881889763779526,
  "time": 22.997121810913086,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.11811023622047244,
  "time": 23.48663330078125,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4645669291338583,
  "time": 24,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.2047244094488189,
  "time": 24.506704330444336,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5354330708661418,
  "time": 25.003007888793945,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.14960629921259844,
  "time": 25.477087020874023,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5748031496062992,
  "time": 26,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.3543307086614173,
  "time": 26.264148712158203,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.6377952755905512,
  "time": 26.75870704650879,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.41732283464566927,
  "time": 27,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.14173228346456693,
  "time": 27.503385543823242,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5433070866141733,
  "time": 28,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.31496062992125984,
  "time": 28.483121871948242,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5433070866141733,
  "time": 28.993412017822266,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.25984251968503935,
  "time": 29.499698638916016,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.44881889763779526,
  "time": 30,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5354330708661418,
  "time": 30.249906539916992,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.7086614173228346,
  "time": 30.707706451416016,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.3700787401574803,
  "time": 30.976945877075195,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.1732283464566929,
  "time": 31.481304168701172,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5748031496062992,
  "time": 32,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.25984251968503935,
  "time": 32.47423553466797,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.2440944881889764,
  "time": 32.7399787902832,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4251968503937008,
  "time": 32.99528884887695,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.12598425196850394,
  "time": 33.21460723876953,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.1968503937007874,
  "time": 33.47126388549805,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.6771653543307087,
  "time": 34,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.36220472440944884,
  "time": 34.25382995605469,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5354330708661418,
  "time": 34.73331832885742,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5118110236220472,
  "time": 35.01654815673828,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.11811023622047244,
  "time": 35.5330696105957,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.47244094488188976,
  "time": 36,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.36220472440944884,
  "time": 36.48945999145508,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4566929133858268,
  "time": 36.9898567199707,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.2125984251968504,
  "time": 37.52382278442383,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.48031496062992124,
  "time": 38,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.30708661417322836,
  "time": 38.258949279785156,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.7007874015748031,
  "time": 38.752113342285156,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.47244094488188976,
  "time": 39.00068283081055,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.11811023622047244,
  "time": 39.526309967041016,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.030078930556774137,
  "velocity": 0.4409448818897638,
  "time": 40,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.3464566929133858,
  "time": 40.47604751586914,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.25984251968503935,
  "time": 40.727108001708984,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.49606299212598426,
  "time": 41.00271987915039,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.2992125984251969,
  "time": 41.47480010986328,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4881889763779528,
  "time": 42.0004997253418,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.3228346456692913,
  "time": 42.22511672973633,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5590551181102362,
  "time": 42.7059326171875,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.3779527559055118,
  "time": 42.98914337158203,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.10236220472440945,
  "time": 43.475677490234375,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5984251968503937,
  "time": 44,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.28346456692913385,
  "time": 44.45497131347656,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.2283464566929134,
  "time": 44.74039077758789,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4881889763779528,
  "time": 45.00654983520508,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.2125984251968504,
  "time": 45.48869323730469,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5905511811023622,
  "time": 46,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.41732283464566927,
  "time": 46.26555633544922,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.6614173228346457,
  "time": 46.7472038269043,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.3228346456692913,
  "time": 47.0101318359375,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.16535433070866143,
  "time": 47.49053192138672,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.8031496062992126,
  "time": 48,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.2755905511811024,
  "time": 48.46925354003906,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.23622047244094488,
  "time": 48.763694763183594,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4330708661417323,
  "time": 49.01466369628906,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.2992125984251969,
  "time": 49.49592590332031,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4251968503937008,
  "time": 50,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.3228346456692913,
  "time": 50.2387580871582,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5039370078740157,
  "time": 50.70866012573242,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.3543307086614173,
  "time": 50.9930419921875,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.25984251968503935,
  "time": 51.47917175292969,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5669291338582677,
  "time": 52,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.2125984251968504,
  "time": 52.44175720214844,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.28346456692913385,
  "time": 52.730777740478516,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4566929133858268,
  "time": 52.9950065612793,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.2125984251968504,
  "time": 53.46434020996094,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5590551181102362,
  "time": 54,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.36220472440944884,
  "time": 54.24101638793945,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.6850393700787402,
  "time": 54.72923278808594,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.33858267716535434,
  "time": 54.98115921020508,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5433070866141733,
  "time": 55.4799919128418,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5590551181102362,
  "time": 56,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.2440944881889764,
  "time": 56.264671325683594,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.49606299212598426,
  "time": 56.45408630371094,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.30708661417322836,
  "time": 56.73703384399414,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4015748031496063,
  "time": 56.99770736694336,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.25984251968503935,
  "time": 57.49066162109375,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4251968503937008,
  "time": 58,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.36220472440944884,
  "time": 58.2493896484375,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5905511811023622,
  "time": 58.70431900024414,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4094488188976378,
  "time": 59.02067565917969,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.07874015748031496,
  "time": 59.49469757080078,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.07086614173228346,
  "time": 59.77197265625,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5826771653543307,
  "time": 60,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.18110236220472442,
  "time": 60.25868606567383,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.29133858267716534,
  "time": 60.47197341918945,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.1732283464566929,
  "time": 60.75,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.3700787401574803,
  "time": 61.00941467285156,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.12598425196850394,
  "time": 61.167510986328125,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.1889763779527559,
  "time": 61.502994537353516,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.07086614173228346,
  "time": 61.791255950927734,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5590551181102362,
  "time": 62,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.36220472440944884,
  "time": 62.27077102661133,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.3858267716535433,
  "time": 62.7623176574707,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.47244094488188976,
  "time": 62.994598388671875,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.23622047244094488,
  "time": 63.48186111450195,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.6299212598425197,
  "time": 64,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.2677165354330709,
  "time": 64.47811126708984,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.18110236220472442,
  "time": 64.7840347290039,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.5354330708661418,
  "time": 64.99124908447266,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.2440944881889764,
  "time": 65.44145965576172,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.48031496062992124,
  "time": 66,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.2755905511811024,
  "time": 66.23738861083984,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.6692913385826772,
  "time": 66.72309112548828,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.4881889763779528,
  "time": 66.99406433105469,
  "color": "yellow"
}, {
  "pitch": 101,
  "duration": 0.0525,
  "velocity": 0.13385826771653545,
  "time": 67.48712158203125,
  "color": "yellow"
}]).delay(-4).loopLength(64);
var R = require("ramda");
log("here we are!");
var OndasGrooveTest = m().evt({
  pitch: 60,
  duration: 0.1,
  velocity: 0.9
}).metro(0.5);
function dist(n1, n2) {
  var dist2 = Math.abs(n1.time - n2.time);
  if (dist2 > 1)
    log("dist shouldn't be greater than 1", dist2, n1, n2);
  return dist2;
}
var ondasKick = m().evt({
  pitch: 60,
  duration: 0.1,
  velocity: 0.9
}).metro(0.25).combine(OndasGroove).simpleMap((function(n) {
  if (!n.previous || !n.next) {
    log("no previous");
    return n;
  }
  var closestOther = R.minBy((function(other) {
    return dist(other, n);
  }), [n.previous, n.next]);
  log("yeah");
  var closestDist = dist(closestOther, n);
  log(n.next.time, ":", n.previous.time);
  log("closesOtherIs", n, closestOther);
  return n.set({
    time: closestOther.time,
    color: "orange",
    velocity: 0.9,
    duration: 0.1
  });
}));
log(OndasGroove.take(50).toArray());
ondasKick.take(10).toArray().forEach((function(a) {
  return console.log("ondasKick", a);
}));
log(OndasGroove.merge(m().evt({
  pitch: 60,
  duration: 0.1,
  velocity: 0.9
}).metro(1)).take(50).toArray());
