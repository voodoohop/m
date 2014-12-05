var component = require('omniscient'),
    immstruct = require('immstruct'),
    React = require("react"),
    Bacon = require("baconjs");

function get(name){
  if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
    return decodeURIComponent(name[1]);
  }

  var myDeviceId = get("maxDeviceId");

   var io = require('webpack-dev-server/client/web_modules/socket.io');
   var socket = io.connect("/");

   console.log("socket",socket);
   socket.on("ping", function() {
     console.log("ping");
   });

  var codeLoaded = false;

  Bacon.fromEventTarget(socket, "consoleMessage").log("console");

  var codeReceived = Bacon.fromEventTarget(socket, "code");

  codeReceived.onValue(function(code) {
    codeLoaded = code;
  });

  codeReceived.log("new code received");

  var connected = Bacon.fromEventTarget(socket, "connect");


  socket.on("connect", function() {
    console.log("connected");
  if (codeLoaded)
    window.setTimeout( function() {
      codePlay.push(codeLoaded);
    },100);
  });


// var Clicks = require('./clicks').jsx;

$(document).ready(function() {
  //  $(".ace_text-layer").jrumble({opacity:true, rotation: 0, x:0, y:0, speed:3, opacityMin:0.3});
  socket.emit("getCode", {maxDeviceId: myDeviceId});
});



// var data = immstruct({ clicks: 0 });
// data.on('swap', render);


var codePlay = new Bacon.Bus();


codePlay.log("codePlay");

codePlay.onValue(function(code) {
  socket.emit("codeChange",{maxDeviceId:myDeviceId, code:code});
});


var availableGenerators = Bacon.fromEventTarget(socket, "generators");

availableGenerators.log("new generator list received");

var genData = immstruct({generators: Immutable.List([])});

var genCursor = genData.cursor("generators");

// var Immutable = require('immutable');



availableGenerators.onValue(function(genList) {
  genData.cursor("generators").update(function(prev) {
    return Immutable.List(genList)});
});

var BraceEdit = require('./braceEditor');
var GeneratorList = require('./generatorList');



genData.on('swap', render);

function render (data) {
  console.log("render called",genCursor.toArray(),data);
  // React.render(
  //   <Clicks clicks={data.cursor('clicks')}/>,
  //   document.getElementById("clicksId"));
  React.render(
    <BraceEdit codePlay={codePlay} setCode={codeReceived}/>,
    document.getElementById("javascript-editor"));

  React.render(GeneratorList(genData.cursor("generators")),
    document.getElementById("nodeGenListContainer"));

}

//window.BraceEdit = BraceEdit;
render();
