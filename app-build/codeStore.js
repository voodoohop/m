"use strict";
Object.defineProperties(exports, {
  codeStore: {get: function() {
      return codeStore;
    }},
  storedSequences: {get: function() {
      return storedSequences;
    }},
  baconStorer: {get: function() {
      return baconStorer;
    }},
  __esModule: {value: true}
});
var Bacon = require("baconjs");
var liveCodeDir = "./liveCode";
var fs = require("fs");
var codeStore = {get: function(deviceName) {
    try {
      return fs.readFileSync(liveCodeDir + "/" + deviceName + ".js", 'utf8');
    } catch (e) {}
    ;
    return null;
  }};
var storedSequences = fs.readdirSync(liveCodeDir).map((function(fileName) {
  return ({
    code: fs.readFileSync(liveCodeDir + "/" + fileName, 'utf8'),
    device: fileName.replace(".js", "")
  });
}));
console.log(fs.readdirSync(liveCodeDir), storedSequences);
var baconStorer = new Bacon.Bus();
baconStorer.onValue((function(s) {
  console.log("storing", s);
  var path = liveCodeDir + "/" + s.device + ".js";
  fs.writeFileSync(path, s.code, 'utf8');
}));
