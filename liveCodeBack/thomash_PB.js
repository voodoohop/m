import {transChordsLonger} from "abletonClip_transChordsLonger";

// import {progression} from "abletonClip_progression";

var progression = transChordsLonger;

var pitchBendPlayer = (node, noteNo,basePitch, startAfter, delay, pbendedEvery=16) => {
  var pbAuto = node.groupByTime().durationsFromTime().set({pitch:basePitch, velocity:0.9}).delay(0.01)
  .combine(node.groupByTime().eventCount())
  //  .withNext()
  //  .map((n) => m.data(n.me).take(1))
  .automate("pitchBend",(n) => {
    //   console.log("PEEBEE",n);
    //  return 0.5;
    if (!n.evt.other.previous || !n.evt.other.next) {// || n.evt.other.previous.events.length<=noteNo || n.evt.other.next.events.length<=noteNo) {
      console.warn("dont have enough polyphony for this pitchBend automation");
      console.log(n);
      console.log(n.evt.other);
      return 0.5;
    }
    var evtNo1 = Math.floor(n.evt.other.previous.count/16);
    var evtNo2 = Math.floor(n.evt.other.next.count/16);
    var prev = n.evt.other.previous.events[noteNo%n.evt.other.previous.events.length];//(noteNo+evtNo1)%n.evt.other.previous.events.length];
    var next = n.evt.other.next.events[noteNo%n.evt.other.next.events.length];//event(noteNo+evtNo2)%n.evt.other.next.events.length];
    var nextPitch = next.pitch.valueOf();
    var prevPitch = prev.pitch.valueOf();
    var mePitch=n.evt.pitch.valueOf();
    //console.log("pbPlayer",me,next,n.time, n.duration,mePitch);
    var pitchNow = (nextPitch-prevPitch)*n.time/n.duration+prevPitch;
    
    // console.log("pnow",pitchNow, n.evt.other.previous.count);
    var meLastDelta = (6*100+prevPitch-mePitch) % 12;
    if (meLastDelta >6)
      meLastDelta -=12;
      // pitchNow=(96+pitchNow)%24-12;
      // console.log((mePitch%24 - pitchNow)/24);   
      var meNextDelta = (6*100+nextPitch-mePitch) % 12;
      if (meNextDelta >6)
        meNextDelta -=12;
        //console.log("pdelta",pitchDelta,pitchNow,pitchDelta/12,"n",n);
        
        var amplitude = 1;
        var x= n.time/n.duration;
        var xTransformed = Math.max(0,x-startAfter)*1/(1-startAfter);
        var easingFunc = easer().using("in-expo");
        var prop =easingFunc(xTransformed);
        // prop = 0;
        var nowDelta=prop*meNextDelta+(1-prop)*meLastDelta;
        //    console.log("newDelta",nowDelta,"prevPitch",prevPitch,"nextPitch",nextPitch, "lastDelta",meLastDelta,"nextDelta",meNextDelta,"mePitch",mePitch);
        //   console.log("res",0.5 + nowDelta/12)
        // console.log("pBendedEvery",pbendedEvery);

        return Math.max(0,Math.min(1,0.5 + nowDelta/12));
      }
    ).prop("pitchBend", (n) => n.pitchBend );
    var res = m.evt({pitch:basePitch, velocity:0.9}).metro(t.bars(pbendedEvery)).duration(pbendedEvery-0.05)//   
    .notePlay().merge(pbAuto.delay(delay));
    return res;
  };
  
  export var transPB1 = pitchBendPlayer(progression,0,50,0.1,0,64);
  export var transPB2 = pitchBendPlayer(progression,1,50,0.2,0,64);
  export var transPB3 = pitchBendPlayer(progression,2,50,0.2,0,64);
  
  
  