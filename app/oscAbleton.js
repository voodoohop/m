import {t} from "./time";

import timeInterpolator from "./timeInterpolator";

var osc = require("osc");


var Bacon = require("baconjs");

var oscToBaconStream = function(udpPort) {

  return Bacon.fromBinder(function(sink) {
    udpPort.on("message", (m) => sink(m));
    return function(){console.log("baconunsubscribe")};
  });

}


export var AbletonReceiver = function(inPort) {

  var baconTime = new Bacon.Bus();

  var udpPort = new osc.UDPPort({
      localAddress: "127.0.0.1",
      localPort: inPort
  });

  udpPort.open();


  //udpPort.on("message", (m) => console.log(m));

  console.log("starting OSC Ableton receiver on port",inPort);

  var oscMessageIn = oscToBaconStream(udpPort);

  var firstTime = null;

  var codeChange = oscMessageIn.filter((message) => message.address == "/codeChange").map((oscBundle) => oscBundle.args[0]);

  codeChange.onValue(function() { firstTime = null;});

  oscMessageIn.filter((message) => message.address == "/abletonTime").map((message) => message.args[0]).skipDuplicates().onValue(function(v){
    if (firstTime == null)
      firstTime = v- v % t.bars(16);
    baconTime.push(v-firstTime);
  });

  // oscMessageIn.onValue(function(v) {
  //   console.log("osc",v);
  // });


  var baconParam = (name) => oscMessageIn
    .filter((message) => message.address.startsWith("/param/"+name))
    .map((message) => message.args[0]).toProperty();


  baconParam("1").onValue((v) => console.log("baconvalue",v));



  return {
    time: timeInterpolator(baconTime),
    param:  baconParam,
    codeChange: codeChange
  }

}


export var AbletonSender = function(outPort) {
  var udpPort = new osc.UDPPort({
      localAddress: "0.0.0.0",
      localPort: 55555
  });

  console.log("starting OSC Ableton sender to port",outPort);


  // Open the socket.

  udpPort.open();
  // Send an OSC message to, say, SuperCollider

  var noteOn = function(pitch,velocity,time) {
    console.log("noteOn",pitch);
    udpPort.send({
        address: "/midiNote",
        args: [pitch, velocity, 1,time]
    }, "127.0.0.1", outPort);
    // udpPort.send({
    //   address: "/codeUpdate",
    //   args: ["while(true) {console.log(\'hlo\');\n}"+Math.random()],
    // },"127.0.0.1", outPort);
  }

  var noteOff = function(pitch,time) {
    console.log("noteOff",pitch);

    udpPort.send({
      address: "/midiNote",
      args: [pitch, 0, 0,time]
    }, "127.0.0.1", outPort);
  }

  var param=function(name,val) {
    //console.log("automation",name,val);
    udpPort.send({
      address: "/param/"+name,
      args:[val]
    }, "127.0.0.1", outPort);
  }


  return {
    noteOn: noteOn,
    noteOff: noteOff,
    param:param
  }
}
