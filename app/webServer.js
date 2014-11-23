//var traceur = require("traceur");
//
// console.log(traceur);

//var socket = require( 'koa-socket' );

var serve = require('koa-static');
var koa = require('koa');
var app = koa();


// $ GET /package.json
//app.use(serve('.'));



// $ GET /hello.txt
app.use(serve('./browser-build'));

// or use absolute paths
//app.use(serve(__dirname + '/test/fixtures'));


console.log('listening on port 8000');

// socket.start(app);
//
// socket.on('join', function(data){
//   console.log("client connect");
//   console.log( 'join event fired', data );
// });


var io = require('socket.io').listen( app.listen(8000) );

var nStore = require("nstore");

var codeStore = nStore.new("code.db");

var generatorStore = null;

var Bacon = require("baconjs");

var baconStream = Bacon.fromBinder(function(sink) {

  io.on('connection', function(socket){
    var deviceId = null;
    console.log('a device connected');
    var generatorUpdate = function(generators=null) {
      if (generators != null)
        generatorStore = generators;
      console.log("emitting generators", generatorStore);
      socket.emit("generators", generatorStore);
    };

    socket.on("requestGenerators", function() {
      console.log("requestGenerators", generatorStore);
      generatorUpdate();
    });

    socket.on('getCode', function(msg){
  //    console.log('message: ', msg);
      deviceId = msg.maxDeviceId;
      codeStore.get(deviceId, function(err, res) {
        socket.emit("code",res);
      });
    });

    //socket.emit("code", "something is going on\n is going on!!");
    socket.on('codeChange', function(msg){
    //  console.log('message: ', msg);
      codeStore.save(msg.maxDeviceId, msg.code, function (err) {

      sink({device:msg.maxDeviceId, code:msg.code});
      if (err) { throw err; }
      // The save is finished and written to disk safely
      });
    });
  });


});

console.log("exporting",baconStream);

// baconStream.onValue(function(v) {
//   console.log("baconVal",v);
// });

var generatorUpdate = function(generators=null) {
  if (generators != null)
    generatorStore = generators;
  console.log("emitting generators", generatorStore);
  console.log(io.emit);
  io.emit("generators", generatorStore);
  console.log("emitted");
}

var beatFeedback = function(beatInfo) {

  beatInfo.throttle(100).onValue((v) => {
    io.emit("beat",v)
    });
}


var remoteLogger = new Bacon.Bus();

remoteLogger.onValue((v) => {
  io.emit("consoleMessage",v);
})

var sequenceFeedback = new Bacon.Bus();
sequenceFeedback.onValue((v) => {
  console.log(v);
  io.emit("sequenceEvent",{pitch:v.pitch, time:v.time, name:v.name,seqName:v.seqName, velocity:v.velocity, automationVal: v.automationVal});
})

export default {liveCode: baconStream, generatorUpdate: generatorUpdate, beatFeedback:beatFeedback, remoteLogger, sequenceFeedback};

console.log("exported");
