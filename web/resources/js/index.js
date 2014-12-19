var component = require('omniscient'),
    immstruct = require('immstruct'),
    React = require("react"),
    Bacon = require("baconjs");

// var m = require("6to5!../../../app/functionalMonads");

function get(name){
  if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
    return decodeURIComponent(name[1]);
  }

  var myDeviceId = get("device");

console.log("device id",myDeviceId);

   var io = require('webpack-dev-server/client/web_modules/socket.io');
   var socket = io.connect("/");

   console.log("socket",socket);
   socket.on("ping", function() {
     console.log("ping");
   });

  var codeLoaded = false;

  Bacon.fromEventTarget(socket, "consoleMessage").log("console");

  var sequenceFeedback = Bacon.fromEventTarget(socket, "sequenceEvent");
  // sequenceFeedback.log("seqEvent");


  var codeReceived = Bacon.fromEventTarget(socket, "code");

  codeReceived.onValue(function(code) {
    codeLoaded = code;
  });

  // codeReceived.log("new code received");

  var connected = Bacon.fromEventTarget(socket, "connect");


  socket.on("connect", function() {
    console.log("connected");
    socket.emit("requestGenerators","yes");
  if (codeLoaded)
    window.setTimeout( function() {
      codePlay.push(codeLoaded);
    },100);
  });


// var Clicks = require('./clicks').jsx;

$(document).ready(function() {
  //  $(".ace_text-layer").jrumble({opacity:true, rotation: 0, x:0, y:0, speed:3, opacityMin:0.3});
  socket.emit("getCode", {device: myDeviceId});
});



// var data = immstruct({ clicks: 0 });
// data.on('swap', render);


var codePlay = new Bacon.Bus();


codePlay.log("codePlay");

codePlay.onValue(function(code) {
  console.log("codeChange",{device:myDeviceId, code:code});
  socket.emit("codeChange",{device:myDeviceId, code:code});
});


var availableGenerators = Bacon.fromEventTarget(socket, "generators");

availableGenerators.log("new generator list received");

var updateGenerator = Bacon.fromEventTarget(socket, "generatorUpdate");

updateGenerator.log("generatorUpdate");

var genData = immstruct({generators: Immutable.Map({})});

var genCursor = genData.cursor("generators");

// var Immutable = require('immutable');



availableGenerators.onValue(function(genList) {
  // genData.cursor("generators").update(function(prev) {
  //   return Immutable.List(genList)});
});

sequenceFeedback.onValue(function(v) {
//   genData.cursor("generators").update(function(prev) {
// //    console.log("prev",v,prev.get(v.device));
//     return prev.set(v.device,_.extend(prev.toJS()[v.device],{feedback: v}));
//   });
//   setTimeout(function() {
//     genData.cursor("generators").update(function(prev) {
//       //    console.log("prev",v,prev.get(v.device));
//       return prev.set(v.device,_.extend(prev.get(v.device),{feedback: null}));
//     });
//   },50);
  console.log(genData.cursor("generators"));
});


updateGenerator.onValue(function (genUpdate) {
  genData.cursor("generators").update(function(prev) {
    console.log("prev",prev.toJS());
    return prev.set(genUpdate.device, genUpdate);
  });
  console.log("genUpdate",genUpdate);
  if (genUpdate.device != myDeviceId)
    return
  var myGens = genUpdate.evaluatedDetails;
  Object.keys(myGens).forEach(function(seqName) {
    var error;
    console.log("checking ",seqName,"for errors");
    if (error = myGens[seqName].evaluatedError) {
      if (error.errorPos) {
        console.log("marking error",error);
        cursorToSeq.push(error);
      }
    }
  })
});

var loadCode = function(path) {
  var device=path.split("/")[1];
  console.log("load device",device);
  myDeviceId = device;
  socket.emit("getCode", {device: myDeviceId});
  cursorToSeq.push(path.split("/")[2]);
}

var cursorToSeq = new Bacon.Bus();

var BraceEdit = require('./braceEditor');
var GeneratorList = require('./generatorList');

socket.emit("requestGenerators","yes");

genData.on('swap', render);

function render (data) {
  // console.log("render called",genCursor,data);
  var style={width:"100%",height:"100%", padding:"0px",background:"none"};
  var style2={padding:"2px",background:"none"};

  var createEditor = function() {
    return (
    <div className="panel panel-default" style={style}>
    <div className="panel-body" style={style}>
    <BraceEdit style="width:100%; height:100%" codePlay={codePlay} setCode={codeReceived} sequenceFeedback={sequenceFeedback} cursorToSeq={cursorToSeq}/>
    </div>
    </div>);
  }

  React.render(createEditor(),document.getElementById("javascript-editor"));

  React.render(GeneratorList({cursor: genData.cursor("generators"), statics: {loadCode: loadCode}}),
    document.getElementById("nodeGenListContainer"));

}

//window.BraceEdit = BraceEdit;
render();
