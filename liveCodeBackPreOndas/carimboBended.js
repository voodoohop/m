import {flautaArpBase as carimboChords} from "abletonClip_flautaArpBase";

var easy =easer().using("out-expo");
log(easy(0.5));


export var bendedCarimbo = 
m().evt({pitch:76,velocity:0.9, duration:0.99}).metro(1).combine(
carimboChords.groupByTime().simpleMap(n => {
  // log(n[0]);
  return n[1];
}))

.automate("pitchBend", (n) => {

  if (!n.target.previous)
      return 0.5;
  log(n.target.pitch," ",n.target.next.pitch);
  log(0.5+(n.target.next.pitch-n.target.pitch)/12*n.time/n.duration);
  var targetPB = 0.5+(n.target.next.pitch-n.target.pitch)/12;
  var startPB;
  
//   if (n.target.previous)
//   log(n.target.previous);
  if (n.target.previous)
    startPB = 0.5+(n.target.previous.pitch-n.target.pitch)/12
    else
      startPB=targetPB;
      log(n);
      


      
    log((n.target.next.time-n.target.time)," ",(n.target.next.time-n.target.previous.time));
      
  var x=(n.target.next.time-(n.target.time+n.time))/(n.target.next.time-n.target.previous.time);
  log(x);
  x=easy(x);
  var pbInterpolated = (x) * startPB + (1-x)*targetPB;
  log(x," ",pbInterpolated);
  log(targetPB);
  log(startPB); 
  return pbInterpolated;
});


export var bendedCarimbo2 =  m().evt({pitch:76,velocity:0.9, duration:0.99}).metro(1).combine(
carimboChords.groupByTime().simpleMap(n => {
  // log(n[0]);
  return n[1];
}))

.automate("pitchBend", (n) => {

  if (!n.target.previous)
      return 0.5;
  log(n.target.pitch," ",n.target.next.pitch);
  log(0.5+(n.target.next.pitch-n.target.pitch)/12*n.time/n.duration);
  var targetPB = 0.5+(n.target.next.pitch-n.target.pitch)/12;
  var startPB;
  
//   if (n.target.previous)
//   log(n.target.previous);
  if (n.target.previous)
    startPB = 0.5+(n.target.previous.pitch-n.target.pitch)/12
    else
      startPB=targetPB;
      log(n);
      


      
    log((n.target.next.time-n.target.time)," ",(n.target.next.time-n.target.previous.time));
      
  var x=(n.target.next.time-(n.target.time+n.time))/(n.target.next.time-n.target.previous.time);
  log(x);
  x=easy(x);
  var pbInterpolated = (x) * startPB + (1-x)*targetPB;
  log(x," ",pbInterpolated);
  log(targetPB);
  log(startPB); 
  return pbInterpolated;
})
;//.automate("pitchBend",);

     
