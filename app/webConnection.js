//var traceur = require("traceur");
//
// console.log(traceur);

//var socket = require( 'koa-socket' );



// $ GET /package.json
//app.use(serve('.'));



// $ GET /hello.txt
//app.use(serve('./browser-build'));

// or use absolute paths
//app.use(serve(__dirname + '/test/fixtures'));

var srv = require("../web/server");

var _ = require("lodash");

console.log('listening on port 8000');



// socket.start(app);
//
// socket.on('join', function(data){
//   console.log("client connect");
//   console.log( 'join event fired', data );
// });


var io = srv.io;

// console.log(io);

import {
  codeStore
}
from "./codeStore";

var generatorStore = {};

var Bacon = require("baconjs");

var baconStream = Bacon.fromBinder(function(sink) {

  io.on('connection', function(socket) {
    var deviceId = null;
    console.log('a device connected');
    setInterval(function() {
      socket.emit("ping", "ping");
      //log.error("helloooo");
    }, 30000)
    socket.on("requestGenerators", function() {
      console.log("requestGenerators");

      // console.log("requestGenerators", generatorStore);
      if (generatorStore) {
        Object.keys(generatorStore).forEach(function(devName) {
          console.log("emitting ", devName);
          io.sockets.emit("generatorUpdate", generatorStore[devName]);
        });
      }
    });

    socket.on('getCode', function(msg) {
      console.log('getCode message: ', msg);
      deviceId = msg.device;
      var res = codeStore.get(deviceId);
      console.log("sending code", res);
      socket.emit("code", res);
    });

    // socket.on('getDevices', function(msg){
    //   console.log('getDevices message: ', msg);
    //   var res=codeStore.get(deviceId);
    //   console.log("sending code",res);
    //   socket.emit("code",res);
    //
    // });

    //socket.emit("code", "something is going on\n is going on!!");
    socket.on('codeChange', function(msg) {
      console.log('message: ', msg);
      sink({
        device: msg.device,
        code: msg.code
      });
    });
  });
});

console.log("exporting", baconStream);

// baconStream.onValue(function(v) {
//   console.log("baconVal",v);
// });

var generatorUpdate = function(generators = null) {
  // if (generators != null)
  //   generatorStore = generators;
  // console.log("emitting generators", generatorStore);
  // console.log(io.emit);
  // io.sockets.emit("generators", generatorStore);
  // console.log("emitted");
}


var individualGenUpdate = function(genData) {
  generatorStore[genData.get("device")] = genData.toJS();
  io.sockets.emit("generatorUpdate", genData.toJS());
}


var beatFeedback = function(beatInfo) {

  beatInfo.throttle(100).onValue((v) => {
    io.emit("beat", v)
  });
}


var remoteLogger = new Bacon.Bus();

remoteLogger.onValue((v) => {
  console.log("remoteLogger", v);
  io.sockets.emit("consoleMessage", v);
})





var count = 0;
var sequenceFeedback = new Bacon.Bus();
sequenceFeedback.filter((v) => v.type == "noteOn" && !v.automationVal).skipDuplicates(_.isEqual).onValue((v) => {
  // console.log("emitting",{count:count, device:v.device, pitch:v.pitch, time:v.time, name:v.name,seqName:v.seqName, velocity:v.velocity, automationVal: v.automationVal});
  io.sockets.emit("sequenceEvent", {
    stack: v.stack,
    count: count++,
    device: v.device,
    pitch: v.pitch,
    time: v.time,
    name: v.name,
    seqName: v.seqName,
    velocity: v.velocity,
    automationVal: v.automationVal
  });
})

export default {
  liveCode: baconStream,
  generatorUpdate: generatorUpdate,
  beatFeedback: beatFeedback,
  remoteLogger,
  sequenceFeedback,
  individualGeneratorUpdate: individualGenUpdate,
  io: io
};

console.log("exported");