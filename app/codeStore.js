
var Bacon = require("baconjs");

// var nStore = require("nstore");
// nStore = nStore.extend(require('nstore/query')());

var liveCodeDir = "./liveCode";

var fs =require("fs");

export var codeStore = {
  get: function(deviceName) {
    try {
      return fs.readFileSync(liveCodeDir+"/"+deviceName+".js",'utf8');
    }
    catch (e){};
    return null;
  }
}

export var storedSequences = fs.readdirSync(liveCodeDir)
  .map(fileName => ({code:fs.readFileSync(liveCodeDir+"/"+fileName,'utf8'), device: fileName.replace(".js","")}));

console.log(fs.readdirSync(liveCodeDir),storedSequences);
// throw "heeey";

export var baconStorer = new Bacon.Bus();


// export var baconStoreChanged = new Bacon.Bus();

baconStorer.onValue((s) => {
//  return;
  console.log("storing",s);
  var path = liveCodeDir+"/"+s.device+".js";
  fs.writeFileSync(path, s.code,'utf8');

  // codeStore.save(s.device, s.code, function(err) {console.log("stored code", s);})

});
