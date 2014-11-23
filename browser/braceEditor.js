var ace = require('brace');
require('brace/mode/javascript');
require('brace/theme/monokai');
var _ = require("lodash");
window._ = _;

var editor = ace.edit('javascript-editor');
editor.getSession().setMode('ace/mode/javascript');
editor.setTheme('ace/theme/monokai');



function get(name){
   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
}

var myDeviceId = get("maxDeviceId");

var socket = require('socket.io-client')('http://localhost');


socket.on("connect", function() {
  //socket.emit("getCode", {maxDeviceId: myDeviceId});
  if (codeLoaded)
    window.setTimeout( function() {
      socket.emit("codeChange",{maxDeviceId: myDeviceId, code:editor.getValue()});
    },100);
});

console.log("editor",editor);

var codeLoaded = false;
socket.on("code", function(code) {
  console.log(editor);
  console.log(edit.getValue());
  editor.setValue(code);
  codeLoaded = true;
//  socket.emit("codeChange",{maxDeviceId:myDeviceId, code:editor.getValue()});
});

socket.on("consoleMessage", function(message) {
  console.log(message);
})

$(document).ready(function() {
//  $(".ace_text-layer").jrumble({opacity:true, rotation: 0, x:0, y:0, speed:3, opacityMin:0.3});

  socket.on("beat",function (beatInfo)  {
    return;
    console.log(beatInfo);
    $("#beatIndicator").text(""+beatInfo);
    if (beatInfo % 1 ==0) {

      if ($ == undefined)
        return;
      if (window.disableRumble)
        return;
      $(".ace_text-layer").trigger("startRumble");
      window.setTimeout(function() {$(".ace_text-layer").trigger("stopRumble"); $(".ace_text-layer").css("position","");},100);
      }
  });

});
// editor.on("change",function (e) {
//   console.log("editor",editor.getValue(),e);
// });

editor.commands.addCommand({
    name: 'play',
    bindKey: {win: 'Shift-Space',  mac: 'Shift-Space'},
    exec: function(editor) {
      socket.emit("codeChange",{maxDeviceId: myDeviceId, code:editor.getValue()});
    },
    readOnly: true // false if this command should not apply in readOnly mode
});


var React = require('react');
var gens = [];

var ReactApp = React.createClass({
  getInitialState: function() {
    return {generators: []};
  },
  componentDidMount: function() {
    console.log(this.props.socket);
    var socket = this.props.socket;
    console.log("emitting requestgenerators")
    socket.emit("requestGenerators","yes");
    var self=this;
    socket.on("generators", function(genList) {
      console.log("recevied generators",genList);
      self.setState({generators: genList});
      gens = genList;
    });
  },
  render:function() {
    return React.DOM.div(null, GeneratorList({generators: this.state.generators}));
  }
})

var GeneratorList = React.createClass({
  render: function() {
    var createItem = function(generator) {
      //console.log("li",generator);

      return React.DOM.li(null, [React.DOM.div(null,generator)]);
    };
    return React.DOM.ul(null, this.props.generators.map(createItem))
  }
});


var reactApp = ReactApp({socket:socket});
React.renderComponent(reactApp,document.getElementById("nodeGenListContainer"));


// setTimeout(function() {
//   console.log(reactApp);
//   //reactApp.props.generators = [{name:"test"},{name:"test2"}];
// },2000);


var dgraphic = null;

$(document).ready(function() {
  console.log("reaady");
  var pitchFeedback = null;
  var automateFeedback = null;
  var automations = {};
var pitches = {};

  socket.on("sequenceEvent", function(e) {
    if (e.hasOwnProperty("automationVal"))
      return;
    //console.log("seqEvent",e);
    if (e.hasOwnProperty("time")) {
      var name = e.seqName;
      if (e.name)
        name += "_"+e.name;
      var epochTime = Math.floor(1000*e.time);
      //console.log("time", epochTime);

      if (e.hasOwnProperty("automationVal")) {
        var needsUpdate =  !automations[name];
        automations[name] = e.automationVal*100;
        // console.log("automations", automations);
        var epochVals = [];
        for (var k of Object.keys(automations)) {
          var vals = [];
          if (needsUpdate)
            vals.push({time:0, y:0});
          vals.push({time:epochTime, y: automations[k]});
          epochVals.push({
            label: k,
            values: vals
          });
        }
        // console.log("epochvals", epochVals);
        if (needsUpdate) {

          if (!automateFeedback) {
            automateFeedback = $('#visgraph-automation').epoch({
                  type: 'time.line',
                  data: epochVals,
                  axes: ['left', 'bottom', 'right'],
                  windowSize: 30
                //  tickFormats: { time: function(d) { return ""+d } }
              });
          }
          else {
            console.log("calling automatefeedback update", epochVals);
            automateFeedback.update(epochVals);
          }
        }
        else{
          // console.log("pushing epochVals.values",_.map(epochVals, function(epv) {return epv.values[0]}));
          automateFeedback.push(_.map(epochVals, function(epv) {return epv.values[0]}));
        }
      }




      if (e.hasOwnProperty("pitch")) {
        if (gens.length ==0)
          return;
        if (!e.velocity)
          return;
        var pneedsUpdate =  !pitches[name];
        pitches[name] = e.pitch;
        // console.log("automations", automations);

      //  console.log("epochvals", pepochVals);
        if (pneedsUpdate) {

          if (!pitchFeedback) {
            var hist={};
            hist[e.pitch] = e.velocity*100;
            console.log("initial:", _.map(gens, function(g) {return {label:g, values: [{time:epochTime, histogram:{}}]}}));
            pitchFeedback = $('#visgraph-notes').epoch({
                  type: 'time.heatmap',
                  data: _.map(gens, function(g) {return {label:g, values: [{time:epochTime, histogram:{0:0}}]}}),//[{label: name, values: [{time:epochTime, histogram:hist}]}],
                  axes: ['left', 'bottom', 'right'],
                  //paintZeroValues:true,
                  buckets:64,
                  bucketRange:[32,96],
                  windowSize: 5,
                  historySize:10,
                  queueSize:1
                //  tickFormats: { time: function(d) { return ""+d } }
              });
          }
          else {
          //   console.log("calling pitchfeedback update", _.map(Object.keys(pitches), function (name) {
          //     var hist={};
          //     hist[pitches[name]] = 0;
          //     return {label: name, values:[{time: epochTime, histogram: hist}]}
          //   } ));
          //
          //   pitchFeedback.update(_.map(Object.keys(pitches), function (name) {
          //     var hist={};
          //     hist[pitches[name]] = 0;
          //     return {label: name, values:[{time: epochTime, histogram: hist}]}
          //   } ));
          }
        }
        else{
          var hist = {};
          hist[e.pitch] = e.velocity*100;
          // console.log("pushing epochVals.values",_.map(Object.keys(pitches),function(n) {
          //   if (n != name)
          //     return {time:epochTime, histogram: {}};
          //   return {time: epochTime, histogram: hist};
          // }));


          pitchFeedback.push(_.map(gens,function(n) {
            console.log(n,name);
            if (n != name)
              return {time:epochTime, histogram: {}};
            return {time: epochTime, histogram: hist};
          }));
        }
      }

    }
  });


})
