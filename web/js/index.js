var component = require('omniscient'),
    immstruct = require('immstruct'),
    React = require("react"),
    Router = require("react-router"),
    Bacon = require("baconjs");



// var    jointGraph = require("./jointGraph");

// console.log("jGraph",jointGraph);



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

  var logMessage = Bacon.fromEventTarget(socket, "consoleMessage");
  // logMessage.log("console");

  var sequenceFeedback = Bacon.fromEventTarget(socket, "sequenceEvent");
  //  sequenceFeedback.log("seqEvent");
  // jointGraph.generatorInfo.plug(sequenceFeedback);

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


// codePlay.log("codePlay");

codePlay.onValue(function(code) {
  console.log("codeChange",{device:myDeviceId, code:code});
  socket.emit("codeChange",{device:myDeviceId, code:code});
});


var availableGenerators = Bacon.fromEventTarget(socket, "generators");

// availableGenerators.log("new generator list received");

// console.log(jointGraph);
// jointGraph.generatorInfo.plug(availableGenerators);


var updateGenerator = Bacon.fromEventTarget(socket, "generatorUpdate");

// jointGraph.generatorInfo.plug(updateGenerator);

updateGenerator.log("generatorUpdate");

var genData = immstruct({generators: {}, selectedDevice:{id:myDeviceId}, editorState: {scrollTop: 0}, deviceLogs:{}});

// var genCursor = genData.cursor("generators");

// var deviceCursor = genData.cursor("device");

// var editorStateCursor = genData.cursor("editorState");

// console.log("selDeviceCursor",selectedDeviceCursor.toJS());

updateGenerator.onValue(function (genUpdate) {
  genData.cursor("generators").update(function(prev) {
    console.log("prev",prev.toJS());
    return prev.update(genUpdate.device, () => genUpdate);
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
  history.pushState({device: device},"","/web/public/?device="+myDeviceId);
  // window.location.search="?device="+myDeviceId;
  genData.cursor("selectedDevice").update(function(prev) {

    return prev.set("id",myDeviceId);//prev.set("selectedId",myDeviceId);
  });
  socket.emit("getCode", {device: myDeviceId});
  cursorToSeq.push(path.split("/")[2]);
}

var cursorToSeq = new Bacon.Bus();

var BraceEdit = require('./braceEditor');
var GeneratorList = require('./generatorList');

socket.emit("requestGenerators","yes");



var LogView = require("./logFeedback");


var logProcessor = function(logFeed) {
  logFeed.log("logFeed");
  listener = logFeed.map(n => _.extend({updateTime: Date.now()},n))
  .scan({},function(prev,next) {
    // console.log("prev",prev,"next",next);
    prev[next.device+"/"+next.sourcePos[0]] = next;
    return prev;
  })
  //.debounce(100)
  // .map(function (n){
  //   return _.values(n);
  // })
  .map(n => _.mapValues(n,m => _.extend({timePassed: Date.now()-m.updateTime},m))
    // .filter(m => m.timePassed<10000)
  )
  .log("processedLogFeed")
  .onValue(function(v) {
    // genData.cursor(["generators",v.).update(function(prev) {
    //   return {visibleLogs:v};
    // })
    // deviceCursor.update(function(prev) {
    //   prev.set("visibleLogs",v);
    // })
    genData.cursor("deviceLogs").update(function (prev) {
      console.log("prevDeviceLogs",prev);
      return prev.merge(v);
    });

    console.log("log",v);
  }.bind(this))
}

logProcessor(logMessage);

var scrollFeedBack = new Bacon.Bus();

scrollFeedBack
// .debounce(200)
.onValue(function(v) {
  genData.cursor("editorState").update(function(prev) {
    return prev.set("scrollTop",v);
  })
});
render= function(data) {
 console.log("render called",genData.cursor().toJS(),data);
  var style={width:"100%",height:"100%", padding:"0px",background:"none"};
  var style2={padding:"2px",background:"none"};

  var createEditor = function() {
    return (
    <div className="panel panel-default" style={style}>
    <div className="panel-body" style={style}>
  {LogView("logs", {selectedDevice: genData.cursor("selectedDevice"), deviceLogs: genData.cursor("deviceLogs"), editorState: genData.cursor("editorState")})}
    <BraceEdit style="width:100%; height:100%" codePlay={codePlay} setCode={codeReceived} sequenceFeedback={sequenceFeedback} cursorToSeq={cursorToSeq} scrollFeedBack={scrollFeedBack}/>
    </div>
    </div>);


  }


  React.render(createEditor(),document.getElementById("javascript-editor"));

  // aceEditor.session.on("changeScrollTop", function(s) {
  //   editorStateCursor.update(function (prev) {
  //     console.log("editorState prev",prev.toJS());
  //     return {scrollTop: s}
  //   });
  // }.bind(this));


  React.render(GeneratorList({cursor: genData.cursor("generators"), statics: {loadCode: loadCode}}),
    document.getElementById("nodeGenListContainer"));

}

genData.on('swap', render);

render(genData);

window.genData=genData;
