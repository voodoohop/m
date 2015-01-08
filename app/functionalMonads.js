

import {m as mImported} from "./functionalM/baseLib";

import {} from "./functionalM/baseFunctionalGens";
import {} from "./functionalM/genexporters";
import {} from "./functionalM/musicalGens";

var assert = require("assert");

export var m = mImported;

var _ = require("lodash");

console.log("mprototype",m.prototype);

var mTest = m({pitch:10}).loop();
console.log("------",""+mTest);
console.log("------",mTest.take(10).toArray());
console.log(mTest.take(20).toArray().length);
console.log(mTest.take(2).toArray());
console.log(mTest.take(5).toArray());
assert.equal(mTest.take(1).toArray()[0].pitch,10);
assert.equal(mTest.take(20).toArray().length,20);


var mEvtTest = m().evt({pitch:10, velocity:[0.7,0.8]});

console.log(mEvtTest.take(10).toArray());


var test3 = m().count();

var countRes = test3.skip(10).take(10).simpleMap(n => n/4).toArray();
console.log("countRes",countRes);

assert.equal(countRes[countRes.length-1],4.75);

var eventCount = m().evt({pitch:60, velocity: [20,30]}).eventCount().take(20);
console.log("evtCountToArray",eventCount.toArray());

assert.equal(_.last(eventCount.toArray()).count,19);

assert.equal(_.last(eventCount.toArray()).count,19);

assert.equal(_.last(eventCount
.simpleMap(e => e.set("pitch",e.pitch+10))
.simpleMap(e => e.set({duration:0.2,pitch: e.pitch+10})).toArray()).pitch,80);

assert.equal(eventCount.prop("color","turquoise").skip(3).takeWhile(e => e.count<5).toArray()[0].count,3);

var test4=m().evt({pitch:30}).duration(20);

console.log(test4.take(10).toArray());

console.log("---tests---");

var testMap = m().evt({pitch: 60, duration: 0.3, velocity: 1}).metro(4)
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



export var CarimboNaRoca = m().data([
{
  "pitch": 57,
  "duration": 7.99,
  "velocity": 0.7,
  "time": 0,
  "color": "yellow"
},
{
  "pitch": 64,
  "duration": 7.99,
  "velocity": 0.7,
  "time": 8,
  "color": "red"
}
]).loopLength(16);

console.log("CarimboNaRocaTest", CarimboNaRoca.toPlayable().take(20).toArray());

var lowerNotes = CarimboNaRoca
.groupByTime().simpleMap(n => {
  var meNote = n[0];
  return meNote; //m().data([res.set({pitch:res.pitch+12,velocity:0.5}),res.set({pitch:res.pitch, time:res.time+0.5})]).take(2);
})
.map(n => m([n,n,n,n,n]))
.pitch(n =>  n.pitch)
.duration(1)
.delay([1,3,4,5,7]);

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

var log=console.log;
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

var microtime = require("microtime");


var profilerDataStore = [];
var profileSamples = 20;


var startTime = microtime.nowDouble();

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

var timeTaken = microtime.nowDouble() - startTime;
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


// startTime = microtime.nowDouble();
timeTaken = microtime.nowDouble() - startTime;
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

timeTaken = microtime.nowDouble() - startTime;
log("time2:", timeTaken);


for (var n of tom
  .toPlayable()
  .take(profileSamples))
  var x = ({
    time: n.time,
    pitch: n.pitch,
    veloctiy: n.velocity
  });

timeTaken = microtime.nowDouble() - startTime;
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


var flautaArpBase = m().data([
{
  "pitch": 72,
  "duration": 8,
  "velocity": 0.7874015748031497,
  "time": 0,
  "color": "yellow"
},
{
  "pitch": 76,
  "duration": 8,
  "velocity": 0.6299212598425197,
  "time": 0,
  "color": "yellow"
},
{
  "pitch": 74,
  "duration": 4,
  "velocity": 0.7874015748031497,
  "time": 8,
  "color": "yellow"
},
{
  "pitch": 77,
  "duration": 4,
  "velocity": 0.7874015748031497,
  "time": 8,
  "color": "yellow"
},
{
  "pitch": 71,
  "duration": 2,
  "velocity": 0.7874015748031497,
  "time": 12,
  "color": "yellow"
},
{
  "pitch": 76,
  "duration": 2,
  "velocity": 0.7874015748031497,
  "time": 12,
  "color": "yellow"
},
{
  "pitch": 71,
  "duration": 2,
  "velocity": 0.7874015748031497,
  "time": 14,
  "color": "yellow"
},
{
  "pitch": 74,
  "duration": 2,
  "velocity": 0.6929133858267716,
  "time": 14,
  "color": "yellow"
}
]).duration(n => n.duration*0.99).loopLength(16);


var flautaInScale =flautaArpBase;// flautaArpBase.pitch(pitchToScale(scale));

m().addGen(function* arpeggiator1(noteSelector,templateSequence, node) {


  //log(""+m(node).groupByTime().map(n => m(templateSequence).pitch(nTemplate => nTemplate.pitch+n[0].pitch).delay(n[0].time)) );
  templateSequence = m(templateSequence);


  var applyTemplate= (note) =>  {
    var takeCount=0;


    return templateSequence
    // .take(8)
    .takeWhile(nt => {
      log(nt.time, " ", note.duration," ",takeCount++);
      return  Number(nt.time).valueOf() <Number(note.duration).valueOf()

    })
    .time(n => n.time+note.time)
    .pitch(nTemplate => nTemplate.pitch+note.pitch)
    // .toArray();
  }

  yield* m().getIterator(m(node).groupByTime().map(n => {


    // log("got here");
    log("got here too", selectedNotes);

    var selectedNotes = noteSelector(n);


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




var arpTemplate = m().evt({pitch:
  [0,2,0,-2,0,1,0,-1,0,0],
  // 0,
  duration:[0.5,0.3,0.4],
  velocity: //0.7
  [0.9,1,0.7]

}).metro(1/2);

var arpNoteSelector = (notes) => notes[notes.length-1];



var flautaAcid = m(flautaInScale).arpeggiator1(arpNoteSelector,arpTemplate)
// .bjorklund(8,5,0)
// .delay(-24)
// .skip(24)
.automate("param1", n => Math.sin(n.target.time*Math.PI/16) /2 +0.5)
.automate("param2", n => Math.sin(n.target.time*Math.PI/12) /2 +0.5)

;

console.log("===start===");

m(flautaAcid).take(16).toArray().forEach(n => console.log(n));

// throw("bye");




export var getPitches = function(sequence) {
  var pitches={};
  for (let n of sequence)
    if (n && n.pitch)
      pitches[n.pitch] = true;

      return Object.keys(pitches).map(n => Number(n).valueOf());
    }


    export var extendScaleToFullRange=(pitches) => m(pitches).simpleMap(p => m().count(p%12,12).take(3).toArray()).flattenAndSchedule().toArray();


    // log(m().count(2%12,12).take(10).toArray());

    log(extendScaleToFullRange([2,3]));

  //  log(m([6,3,4,5]).simpleMap(n => [n+3,n]).flattenAndSchedule().toArray());

    // throw "bye";
