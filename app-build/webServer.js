"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var serve = require('koa-static');
var koa = require('koa');
var app = koa();
app.use(serve('./browser-build'));
console.log('listening on port 8000');
var io = require('socket.io').listen(app.listen(8000));
var nStore = require("nstore");
var codeStore = nStore.new("code.db");
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
      console.log("emitting generators", generatorStore);
      socket.emit("generators", generatorStore);
    };
    socket.on("requestGenerators", function() {
      console.log("requestGenerators", generatorStore);
      generatorUpdate();
    });
    socket.on('getCode', function(msg) {
      deviceId = msg.maxDeviceId;
      codeStore.get(deviceId, function(err, res) {
        socket.emit("code", res);
      });
    });
    socket.on('codeChange', function(msg) {
      codeStore.save(msg.maxDeviceId, msg.code, function(err) {
        sink({
          device: msg.maxDeviceId,
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
  console.log("emitting generators", generatorStore);
  console.log(io.emit);
  io.emit("generators", generatorStore);
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
  console.log(v);
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
