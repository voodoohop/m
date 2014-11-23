inlets = 2;
post("hello");

//var lastTime=0;
var scheduleBuffer = [];

function getTimeFromMsg(m) {
  return m[m.length-1];
}

var processing = false;



function time(t) {
  if (processing)
    return;
  processing = true;
  if (scheduleBuffer.length>0)
    post(scheduleBuffer.length+"\n");
  while (scheduleBuffer.length>0 && getTimeFromMsg(scheduleBuffer[0]) < t) {
    var evt = scheduleBuffer.shift();
    
    outlet(0,evt);
  }
  processing = false;
}

function evt() {
  var e = [];
  for (var i=0;i<arguments.length;i++)
    e.push(arguments[i]);
  scheduleBuffer.push(e);
}

time.immediate = true;
evt.immediate = true;