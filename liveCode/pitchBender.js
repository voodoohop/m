

 

export var periodicEaser = function(easeTyoe, period) { 
    var easingFunc = easer().using(easeType );
    var x = ((n.evt.time) % (period))/(period);
    var prop = easingFunc(x);
    return x;
}

log("balasdas4");  
  
export var pitchBendPlayer2 = function(bendToNotes) {
    return function*() {
        var bendToIterator = getIterator(bendToNotes);
        var note = bendToIterator.next().value;
        var time=note.time;
        var basePitch=60;
        while (note !== undefined) {
            var currentPitch = null;
            if (currentPitch === null)
                currentPitch = n;
            var meDelta = (6*100+basePitch-currentPitch) % 12;
            if (meDelta >6)
              meDelta -=12;
              
            yield Math.max(0,Math.min(1,0.5 + meDelta/12))
            time+= 1/4;
            if (time > note.duration+note.time)
                note = bendToIterator.next().value;
        }
    };
}  ;
  
export var pitchBendPlayer=function(bendToNotes, pitchBender)  {
var easingFunc = easer().using("in-linear");

 var combined = pitchBender.combine(bendToNotes.delay(0.01)).prop("color","yellow");
 var pBended = combined.automate("pitchBend", n => {
    //  log(n.target.previous);
     if (!n.target.previous || !n.target.next) 
        return 0.5;
    var prev = n.target.previous;
    var next = n.target.next;
    var nextPitch = prev.pitch;
    var prevPitch = next.pitch;
    var mePitch=n.target.pitch;
    // var pitchNow = (nextPitch-prevPitch)*n.time/n.duration+prevPitch;
    log(n.duration);
    log(mePitch,prevPitch, nextPitch);
    
    var meLastDelta = (6*100+prevPitch-mePitch) % 12;
    if (meLastDelta >6)
      meLastDelta -=12;
    var meNextDelta = (6*100+nextPitch-mePitch) % 12;
    if (meNextDelta >6)
      meNextDelta -=12;
    log(meLastDelta);
    log(meNextDelta);
      
    var x= easingFunc(n.time/n.duration);
    var nowDelta=x*meNextDelta+(1-x)*meLastDelta;
    log(nowDelta);
    return Math.max(0,Math.min(1,0.5 + nowDelta/12));
 
   // return 0.5;
 })
//  log(pbPlay.take(1).toArray());
  return pBended;    
} 
  
 

//  log(pbPlay.take(10).toArray()); 
//  if (true) 
//  return pitchBender.set({color:"blue"});
//  var res= pbPlay.automate("pitchBend",(n) => {
//     if (!n.previous || !n.next) {// || n.evt.other.previous.events.length<=noteNo || n.evt.other.next.events.length<=noteNo) {
//         log("dont have enough polyphony for this pitchBend automation");
//         log(n);
//         return 0.5;
//     }
//     var evtNo1 = Math.floor(n.previous.count/16);
//     var evtNo2 = Math.floor(n.next.count/16);
//     var prev = n.previous.events[noteNo%n.previous.length];
//     var next = n.next.events[noteNo%n.next.length];
//     var nextPitch = next.pitch;
//     var prevPitch = prev.pitch;
//     var mePitch=n.pitch;
//     //console.log("pbPlayer",me,next,n.time, n.duration,mePitch);
//     var pitchNow = (nextPitch-prevPitch)*n.time/n.duration+prevPitch;
//     var meLastDelta = (6*100+prevPitch-mePitch) % 12;
//     if (meLastDelta >6)
//       meLastDelta -=12;
//     var meNextDelta = (6*100+nextPitch-mePitch) % 12;
//     if (meNextDelta >6)
//       meNextDelta -=12;
 
//     var amplitude = 1;
//     var x= n.time/n.duration;
//     var xTransformed = Math.max(0,x-startAfter)*1/(1-startAfter);
//     var easingFunc = easer().using("in-bounce");
//     var prop =easingFunc(xTransformed);
//     var nowDelta=prop*meNextDelta+(1-prop)*meLastDelta;
//     return Math.max(0,Math.min(1,0.5 + nowDelta/12));
//  }); 

//  return res;
// } 

  
