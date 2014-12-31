"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__codeStore__;
var srv = require("../web/server");
var _ = require("lodash");
console.log('listening on port 8000');
var io = srv.io;
var codeStore = ($__codeStore__ = require("./codeStore"), $__codeStore__ && $__codeStore__.__esModule && $__codeStore__ || {default: $__codeStore__}).codeStore;
var generatorStore = {};
var Bacon = require("baconjs");
var baconStream = Bacon.fromBinder(function(sink) {
  io.on('connection', function(socket) {
    var deviceId = null;
    console.log('a device connected');
    setInterval(function() {
      socket.emit("ping", "ping");
    }, 30000);
    socket.on("requestGenerators", function() {
      console.log("requestGenerators");
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
var generatorUpdate = function() {
  var generators = arguments[0] !== (void 0) ? arguments[0] : null;
};
var individualGenUpdate = function(genData) {
  generatorStore[genData.get("device")] = genData.toJS();
  io.sockets.emit("generatorUpdate", genData.toJS());
};
var beatFeedback = function(beatInfo) {
  beatInfo.throttle(100).onValue((function(v) {
    io.emit("beat", v);
  }));
};
var remoteLogger = new Bacon.Bus();
remoteLogger.onValue((function(v) {
  io.sockets.emit("consoleMessage", v);
}));
var count = 0;
var sequenceFeedback = new Bacon.Bus();
sequenceFeedback.filter((function(v) {
  return v.type == "noteOn" && !v.automationVal;
})).skipDuplicates(_.isEqual).onValue((function(v) {
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
}));
var $__default = {
  liveCode: baconStream,
  generatorUpdate: generatorUpdate,
  beatFeedback: beatFeedback,
  remoteLogger: remoteLogger,
  sequenceFeedback: sequenceFeedback,
  individualGeneratorUpdate: individualGenUpdate
};
console.log("exported");
