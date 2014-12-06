"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__codeStore__;
var srv = require("../web/server");
console.log('listening on port 8000');
var io = srv.io;
console.log(io);
var codeStore = ($__codeStore__ = require("./codeStore"), $__codeStore__ && $__codeStore__.__esModule && $__codeStore__ || {default: $__codeStore__}).codeStore;
var generatorStore = null;
var Bacon = require("baconjs");
var baconStream = Bacon.fromBinder(function(sink) {
  io.on('connection', function(socket) {
    var deviceId = null;
    console.log('a device connected');
    var generatorUpdate = function() {
      var generators = arguments[0] !== (void 0) ? arguments[0] : null;
      if (generators != null)
        generatorStore = generators;
      socket.emit("generators", generatorStore);
    };
    setInterval(function() {
      socket.emit("ping", "ping");
    }, 30000);
    socket.on("requestGenerators", function() {
      console.log("requestGenerators", generatorStore);
      generatorUpdate();
    });
    socket.on('getCode', function(msg) {
      console.log('getCode message: ', msg);
      deviceId = msg.device;
      codeStore.get(deviceId, function(err, res) {
        console.log("sending code", res);
        socket.emit("code", res);
      });
    });
    socket.on('codeChange', function(msg) {
      console.log('message: ', msg);
      codeStore.save(msg.device + (msg.name ? "/" + msg.name : ""), msg.code, function(err) {
        sink({
          device: msg.device,
          code: msg.code
        });
        if (err) {
          throw err;
        }
      });
    });
  });
});
console.log("exporting", baconStream);
var generatorUpdate = function() {
  var generators = arguments[0] !== (void 0) ? arguments[0] : null;
  if (generators != null)
    generatorStore = generators;
  console.log(io.emit);
  io.sockets.emit("generators", generatorStore);
  console.log("emitted");
};
var beatFeedback = function(beatInfo) {
  beatInfo.throttle(100).onValue((function(v) {
    io.emit("beat", v);
  }));
};
var remoteLogger = new Bacon.Bus();
remoteLogger.onValue((function(v) {
  io.emit("consoleMessage", v);
}));
var sequenceFeedback = new Bacon.Bus();
sequenceFeedback.onValue((function(v) {
  io.emit("sequenceEvent", {
    pitch: v.pitch,
    time: v.time,
    name: v.name,
    seqName: v.seqName,
    velocity: v.velocity,
    automationVal: v.automationVal
  });
}));
var $__default = {
  liveCode: baconStream,
  generatorUpdate: generatorUpdate,
  beatFeedback: beatFeedback,
  remoteLogger: remoteLogger,
  sequenceFeedback: sequenceFeedback
};
console.log("exported");
