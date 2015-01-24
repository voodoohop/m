import {
  m as mImported
}
from "./functionalM/baseLib";

import {}
from "./functionalM/baseFunctionalGens";
import {}
from "./functionalM/genexporters";
import {}
from "./functionalM/musicalGens";

import {}
from "./functionalM/asyncSequence";

import hrTimer from "./lib/hrtimer";

var assert = require("assert");

export var m = mImported;

var _ = require("lodash");

console.log("mprototype", m.prototype);

var mTest = m({
  pitch: 10
}).loop();
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

var countRes = test3.skip(10).take(10).simpleMap(n => n / 4).toArray();
console.log("countRes", countRes);

assert.equal(countRes[countRes.length - 1], 4.75);

var eventCount = m().evt({
  pitch: 60,
  velocity: [20, 30]
}).eventCount().take(20);
console.log("evtCountToArray", eventCount.toArray());

assert.equal(_.last(eventCount.toArray()).count, 19);

assert.equal(_.last(eventCount.toArray()).count, 19);

assert.equal(_.last(eventCount
  .simpleMap(e => e.set("pitch", e.pitch + 10))
  .simpleMap(e => e.set({
    duration: 0.2,
    pitch: e.pitch + 10
  })).toArray()).pitch, 80);

assert.equal(eventCount.prop("color", "turquoise").skip(3).takeWhile(e => e.count < 5).toArray()[0].count, 3);

var test4 = m().evt({
  pitch: 30
}).duration(20);

console.log(test4.take(10).toArray());

console.log("---tests---");

var testMap = m().evt({
    pitch: 60,
    duration: 0.3,
    velocity: 1
  }).metro(4)
  // .map(n => [n.set("duration", 0.2),n.set("time", n.time + 2)])
  .automate("param1", (n) => {
    // console.log("automationMap".red.bold,n);
    return 0.5;
  })
  .automate("param2", (n) => {
    // console.log("automationMap".red.bold,n);
    return 0.2;
  })
  .take(10)
  // .lazyResolve()
  // .toPlayable()
  // .toPlayable();


// var x =testMap.take(10).toArray();
console.log(testMap.take(10).toArray());
// console.log(""+x[0]["$lazy"]);

// throw "bye";



export var CarimboNaRoca = m().data([{
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

var lowerNotes = CarimboNaRoca
  .groupByTime().simpleMap(n => {
    var meNote = n[0];
    return meNote; //m().data([res.set({pitch:res.pitch+12,velocity:0.5}),res.set({pitch:res.pitch, time:res.time+0.5})]).take(2);
  })
  .map(n => m([n, n, n, n, n]))
  .pitch(n => n.pitch)
  .duration(1)
  .delay([1, 3, 4, 5, 7]);

console.log("CarimboNaRocaTest2", lowerNotes.take(20).toArray());

// import {kick} from "abletonClip";
var kickGrid = 2;

export var kick = m().evt({
    pitch: [54, 60, 65],
    velocity: 0.9,
    duration: kickGrid - 0.5
  }).metro(kickGrid)
  .automate("pitchBend", (n) => {
    // console.log("automate called",n);
    return Math.sin((n.time + n.target.time) * Math.PI / 1) / 4 + 0.5
  });


export var tom = m().evt({
  pitch: 60,
  velocity: 0.7,
  duration: 0.1,
  color: "yellow"
}).metro(0.2).bjorklund(16, 9, 2);


// var rxified = tom.take(100).toRx();
//
// rxified.subscribe((v) => console.log("rx",v));

// var mified = m.fromRx(rxified);

// console.log(mified.toArray());

var log = console.log;
// console.log = () => ({});

export var hat = m().evt({
  pitch: [48, 60],
  velocity: [0.3, 0.5, 0.7, 0.3, 0.6],
  duration: 0.1
}).metro(0.25).bjorklund(4, 3, 0).swing(1 / 4, 0.15);

export var kick_real = m().evt({
  pitch: 60,
  velocity: [0.9, 0.7, 0.8],
  duration: 0.1
}).metro(1);
// .automate("pitchBend", n => Math.sin((n.time+n.evt.time)*Math.PI/8)/4+0.5)

// var microtime = require("microtime");


var profilerDataStore = [];
var profileSamples = 2000;


var startTime = hrTimer();

// console.log(kick.toPlayable()[wu.iteratorSymbol]);

for (var n of kick
    .toPlayable()
    .take(profileSamples)) {
  var x = ({
    time: n.time,
    pitch: n.pitch,
    veloctiy: n.velocity,
    type: n.type
  });
  // console.log(n);
}

var timeTaken = hrTimer() - startTime;
log("time:", timeTaken);
log("-------------".bgRed);
console.log(kick.toPlayable().take(50).toArray()[49]);
// throw "bye";

for (var n of tom
    .toPlayable()
    .take(profileSamples)) {
  var cx = ({
    time: n.time,
    pitch: n.pitch,
    veloctiy: n.velocity
  });
}


// startTime = process.hrtime();
timeTaken = hrTimer() - startTime;
log("time:", timeTaken);

for (var n of tom
    .toPlayable()
    .take(profileSamples)) {
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

timeTaken = hrTimer() - startTime;
log("time2:", timeTaken);


for (var n of tom
    .toPlayable()
    .take(profileSamples))
  var x = ({
    time: n.time,
    pitch: n.pitch,
    veloctiy: n.velocity
  });

timeTaken = hrTimer() - startTime;
log("time:", timeTaken);

// throw "bye";


// console.log = col;
// throw "bye";


// throw "bye";
//
//
// // var test1 = m.evt({pitch:12}).metro(10).automate("param1",(n) => 0.5).delay(10);
// // var test2 = m.evt({pitch:3, velocity:0.3}).metro(4);
// // console.log(test1);
// // throw "bye";
//
//
// // for (var m of test1)
// //   console.log("test1",m.time, m);
// // for (var m of test2)
// //   console.log("test2",m.time, m);
//
// // var combined = test2.combineMap((c,other) =>  {
// //   var nextTime = null;
// //   var prevTime = null;
// //   //console.log("other",other);
// //
// //   if (c.other.previous)
// //     prevTime = combine.previous.time;
// //   if (combine.next)
// //     nextTime = combine.next.time;
// //   //console.log(me, combine,"prevTime:",prevTime,"nextTime",nextTime);
// //
// //   return {pitch: nextTime == me.time ? 5: 24}
// // }, test1);
//
// // console.log(test2.combine(test1).take(5));
// // for (var c of combined.take(5))
// //   console.log("combined",c);
//
// // var test1 =m.evt({pitch:20, velocity:[30,40], duration:0.5}).metro(0.25).duration([0.3,0.7])
// // .swing(0.25,0.1)
// // .map((n) => {return {velocity: n.velocity/100}})
// // .notePlay();
//
// // throw "just terminating";
// //
// // var simpleMelody = m.evt().set({pitch:[62,65,70,75], velocity:[0.8,0.6,0.5], duration:1.5}).metro(2)
// // // .duration((n) => {
// // // //  console.log("durationmap",n);
// // //   return n.duration*200
// // // })
// // .duration((n) => {
// // //  console.log("durationmap",n);
// //   return n.duration;
// // })
// // .swing(1,0.3)
// // .automate("pitchBend",(n) => 1.5);
//
//
// // console.log(simpleMelody);
//
//
//
// // throw "Byebye";
// //
// //
// // for (var e of simpleMelody.skip(10).toPlayable().take(5)) {
// //   console.log("eventNoteOnOffYeeee",e);
// // }
//
//
// // console.log("getting combined");
// // for (var m of combined) {
// //
// //   console.log("combined",m);
// // }
// //
//
// //var count = MTime(MCount(0,1),MLoop(MEvent({pitch:[12,13,100]})));
// //for (var c of count)
// //  console.log(c);
// //var automator = m.value([40,50]).set({duration:t.bars(1)}).timeFromDurations().automatePlay("pitchBend");
// //for (var a of automator) {console.log(a);}
// //return;
// //
// //
// // //console.log("iteratorSymbol",wu.iteratorSymbol);
// //
// // var val = MValue(40);
// // for (var e of val) {
// //   console.log("VAAL",e);
// // }
// // //return;
// //
// // var valtest = m.value().loop().setValue([20,30,40,50]).take(5);
// // console.log("VAAAAAL3",[for (e of valtest) e]);
// //
// //
// // var valToNoteTest3 = m.note({pitch:12, duration:10,time:0})
// //   .loop()
// //   .set({pitch:[12,13]})
// //   .set({velocity:[11,50,60]})
// //   .set({time: m.count(0,20), bla: (n) => {console.log("inSet",n); return Math.random()}})
// //   .set({test2: m.value().loop().setValue([20,30,40,50])}).toNoteOnOff().take(5);
// // var valToNoteTest = m.note({pitch:12,duration:20}).loop().set({velocity: m.value().loop().setValue([20,30,40,50])}).take(5);
// // console.log("VAAAAALToNOOOTE3",[for (e of valToNoteTest) e]);
// //
// // //return;
// //
// // var seqNewNew = m.note().loop().pitch([12,13,14]).set({bla:"test"}).take(5);
// // console.log(""+seqNewNew);
// //
// // var tsts = m.note().loop().pitch([12,13,14]).set({bla:"test"}).take(5);
// //
// // console.log("tststs",""+tsts);
// //
// // for (var n of tsts) {
// //   console.log("tsts",n);
// // }
// //
// // //return;
// //
// // //var seqNewNew2 = m.note().repeat(10).pitch([3,4,5]).velocity(100).duration([20,10,10]).eventCount().timeFromDurations().filter((e) => e.count % 5 != 0);
//
// //
// //
// // var pitchMap=wu.curryable(function(pitches,node) {
// //   return node.pitch(n => n.pitch+pitches[Math.floor(n.time/4%pitches.length)]);
// // });
// //
// // var tPitchMap=pitchMap([2,0,3,4,-12,-5,12,12]);
// // //var tPitchMap=pitchMap([0]);
// //
// // export var marimba2=tPitchMap(m.evt({pitch:50,duration:[0.2,0.1,0.3],color:"red",velocity:[0.9,0.7]})
// // .metro(1)
// // //.bjorklund(8,6,0)
// // .automate("param1", n => (n.time+n.evt.time) % 4 /4)
// // .automate("pitchBend", n => (n.time+n.evt.time) % 64 /64));
// //
// //
// // var c=0;
// // for (let e of marimba2.toPlayable()) {
// //   c++;
// //   if (c %500==0)
// //     console.log("m2",c,e);
// //     if (c > 5000)
// //       break;
// //
// //     }
// //
// // c=0;
// //     for (let e of marimba2.toPlayable()) {
// //       c++;
// //       if (c %500==0)
// //         console.log("m2",c,e);
// //         if (c > 5000)
// //           break;
// //         }
// //         c=0;
// //         for (let e of marimba2.toPlayable()) {
// //           c++;
// //           if (c %500==0)
// //             console.log("m2",c,e);
// //             if (c > 5000)
// //               break;
// //             }
// //
// //             c=0;
// //             for (let e of marimba2.toPlayable()) {
// //               c++;
// //               if (c %500==0)
// //                 console.log("m2",c,e);
// //                 if (c > 5000)
// //                   break;
// //                 }
// //                 c=0;


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
}]).duration(n => n.duration * 0.99).loopLength(16);


var flautaInScale = flautaArpBase; // flautaArpBase.pitch(pitchToScale(scale));

m().addGen(function* arpeggiator1(noteSelector, templateSequence, node) {


  //log(""+m(node).groupByTime().map(n => m(templateSequence).pitch(nTemplate => nTemplate.pitch+n[0].pitch).delay(n[0].time)) );
  templateSequence = m(templateSequence);


  var applyTemplate = (note) => {
    var takeCount = 0;


    return templateSequence
      // .take(8)
      .takeWhile(nt => {
        log(nt.time, " ", note.duration, " ", takeCount++);
        return Number(nt.time).valueOf() < Number(note.duration).valueOf()

      })
      .time(n => n.time + note.time)
      .pitch(nTemplate => nTemplate.pitch + note.pitch)
      // .toArray();
  }

  yield * m().getIterator(m(node).groupByTime().map(n => {


    // log("got here");
    log("got here too", selectedNotes);

    var selectedNotes = noteSelector(n);


    // if (!selectedNotes.length)
    //     selectedNotes=[selectedNotes];
    // log("got here too", selectedNotes);
    var res = applyTemplate(selectedNotes); // R.chain(n => applyTemplate(n),selectedNotes)

    // log(res.toArray());

    return res;
  }));

  // for (let n of node) {
  //     // if (n.length)
  //     for (let nTemplate of templateSequence) {
  //         yield ;

  //     }

  //     // for (let time=n.time)
  // }
});




var arpTemplate = m().evt({
  pitch: [0, 2, 0, -2, 0, 1, 0, -1, 0, 0],
  // 0,
  duration: [0.5, 0.3, 0.4],
  velocity: //0.7
    [0.9, 1, 0.7]

}).metro(1 / 2);

var arpNoteSelector = (notes) => notes[notes.length - 1];



var flautaAcid = m(flautaInScale).arpeggiator1(arpNoteSelector, arpTemplate)
  // .bjorklund(8,5,0)
  // .delay(-24)
  // .skip(24)
  .automate("param1", n => Math.sin(n.target.time * Math.PI / 16) / 2 + 0.5)
  .automate("param2", n => Math.sin(n.target.time * Math.PI / 12) / 2 + 0.5)

;

console.log("===start===");

m(flautaAcid).take(16).toArray().forEach(n => console.log(n));

// throw("bye");




export var getPitches = function(sequence) {
  var pitches = {};
  for (let n of sequence)
    if (n && n.pitch)
      pitches[n.pitch] = true;

  return Object.keys(pitches).map(n => Number(n).valueOf());
}


export var extendScaleToFullRange = (pitches) => m(pitches).simpleMap(p => m().count(p % 12, 12).take(3).toArray()).flattenAndSchedule().toArray();


// log(m().count(2%12,12).take(10).toArray());

log(extendScaleToFullRange([2, 3]));

//  log(m([6,3,4,5]).simpleMap(n => [n+3,n]).flattenAndSchedule().toArray());

// throw "bye";




export var OndasGroove = m().data([{
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

export var OndasGrooveTest = m().evt({
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






// log(ondasGrooveCompare.take(100).toArray().map(n=>n.time));


var ondasKick = m().evt({
  pitch: 60,
  duration: 0.1,
  velocity: 0.9
}).metro(0.25)


.combine(OndasGroove).simpleMap(n => {

  //   return note;
  if (!n.previous || !n.next) {

    log("no previous");
    return n;
  }

  var closestOther = R.minBy(other => dist(other, n), [n.previous, n.next]);
  log("yeah");

  var closestDist = dist(closestOther, n);
  // if (closestDist>0.2)
  //   log("distance",dist(n.previous,n),"\n",
  //   dist(n.previous,n), "\n",
  //   dist(closestOther,n));

  // if (closestDist > 0.3)
  //   return n;

  log(n.next.time, ":", n.previous.time);







  log("closesOtherIs", n, closestOther);
  return n.set({
    time: closestOther.time,
    color: "orange",
    velocity: 0.9,
    duration: 0.1
  }); // n.set({time:closestOther.time});
});




log(OndasGroove.take(50).toArray());







ondasKick.take(10).toArray().forEach(a => console.log("ondasKick", a));









log(OndasGroove.merge(m().evt({
  pitch: 60,
  duration: 0.1,
  velocity: 0.9
}).metro(1)).take(50).toArray());









// throw "bye";
