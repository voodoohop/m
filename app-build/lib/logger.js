"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_webConnection__;
var webServer = ($___46__46__47_webConnection__ = require("../webConnection"), $___46__46__47_webConnection__ && $___46__46__47_webConnection__.__esModule && $___46__46__47_webConnection__ || {default: $___46__46__47_webConnection__}).default;
var io = webServer.io;
var bunyan = require("bunyan");
function MyRawStream() {}
MyRawStream.prototype.write = function(rec) {
  if (typeof(rec) !== 'object') {
    console.error('error: raw stream got a non-object record: %j', rec);
  } else {
    io.sockets.emit("bunyan", rec);
  }
};
var logLevels = ["info", "error", "fatal", "warn", "debug"];
var log = bunyan.createLogger({
  name: 'MusicGen',
  streams: $traceurRuntime.spread(logLevels.map((function(level) {
    return ({
      level: level,
      stream: new MyRawStream(),
      type: "raw"
    });
  })), logLevels.map((function(level) {
    return ({
      level: level,
      stream: process.stdout
    });
  })))
});
log.info("bunyan log");
setInterval((function() {
  log.info("bunyan ping", {testObj: {bla: true}});
}), 30000);
log.showDebug = false;
var $__default = log;
