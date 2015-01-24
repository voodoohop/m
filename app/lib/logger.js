import webServer from "../webConnection";

var io = webServer.io;



var bunyan = require("bunyan");

function MyRawStream() {}
MyRawStream.prototype.write = function(rec) {
  if (typeof(rec) !== 'object') {
    console.error('error: raw stream got a non-object record: %j', rec)
  } else {
    // process.stdout.write(JSON.stringify(rec) + '\n');
    io.sockets.emit("bunyan", rec);
  }
}
var logLevels = ["info", "error", "fatal", "warn", "debug"];
var log = bunyan.createLogger({
  name: 'MusicGen',
  streams: [
    ...logLevels.map(level => ({
      level: level,
      stream: new MyRawStream(),
      type: "raw"
    })),
    ...logLevels.map(level => ({
      level: level,
      stream: process.stdout
    }))
  ]
});

log.info("bunyan log");



setInterval(() => {
  log.info("bunyan ping", {
    testObj: {
      bla: true
    }
  });
}, 30000)

log.showDebug = false;

export default log;
