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

  if (codeLoaded)
    window.setTimeout( function() {
      socket.emit("codeChange",{maxDeviceId: myDeviceId, code:editor.getValue()});
    },100);
});

console.log("editor",editor);

var codeLoaded = false;
socket.on("code", function(code) {
  console.log(editor);
//  console.log(edit.getValue());
  editor.setValue(code);
  codeLoaded = true;
//  socket.emit("codeChange",{maxDeviceId:myDeviceId, code:editor.getValue()});
});

socket.on("consoleMessage", function(message) {
  console.log(message);
})

$(document).ready(function() {
//  $(".ace_text-layer").jrumble({opacity:true, rotation: 0, x:0, y:0, speed:3, opacityMin:0.3});
  socket.emit("getCode", {maxDeviceId: myDeviceId});
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


function timeSeries(windowSize) {
  var valueStore = {};
  var startTime=-1;
  var filled = false;
  return {
    push: function(time, val) {
      time = Number(time).valueOf();
      if (!valueStore[time])
        valueStore[time] = [];
      valueStore[time].push(val);
      if (time>startTime+windowSize) {
        startTime = time - windowSize;
        for (var t of Object.keys(valueStore))
          if (t<startTime) {
            delete valueStore[t];
            filled = true;
          }
      }
    },
    current: function() {
      return _.clone(valueStore);
    },
    ordered: function() {
      return _.map(_.sortBy(Object.keys(valueStore)), function(k) {return {time:Number(k).valueOf() , values: valueStore[k] }});
    },
    hasFilled: function() {
      return filled;
    },
    startTime: function() {
      return startTime;
    }
  }
}

var dgraphic = null;

$(document).ready(function() {
  console.log("reaady");
  var pitchFeedback = null;
  var automateFeedback = null;
  var automations = {};
  var pitchTimeSeriesCollection = {};
  socket.on("sequenceEvent", function(e) {
    // if (e.hasOwnProperty("automationVal"))
    //   return;
    //console.log("seqEvent",e);
    if (e.hasOwnProperty("time")) {
      var name = e.seqName;
      if (e.name)
        name += "_"+e.name;
      var epochTime = Math.floor(1000*e.time);
      //console.log("time", epochTime);

      if (e.hasOwnProperty("automationVal")) {
        var needsUpdate =  !automations[name];
        automations[name] = e.automationVal;
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

      var noteRange = 8;
      if (e.hasOwnProperty("pitch")) {
        if (gens.length ==0)
          return;
        if (!e.velocity)
          return;
        if (!pitchTimeSeriesCollection.hasOwnProperty(e.seqName)) {
          pitchTimeSeriesCollection[e.seqName] = timeSeries(noteRange);
        }
        var pitchTimeSeries = pitchTimeSeriesCollection[e.seqName];
        pitchTimeSeries.push(e.time, {pitch:e.pitch, velocity:e.velocity})
        console.log("pitches",pitchTimeSeriesCollection);
        console.log("pitches",pitchTimeSeriesCollection[e.seqName].ordered());
        console.log("filled", pitchTimeSeries.hasFilled());
        //return;
        if (!pitchTimeSeries.hasFilled())
          return;
        // var hist=pitchTimeSeries.ordered().map(function(notes) {
        //   return {
        //     time: Math.floor(10*notes.time),
        //     values: _.object(_.map(notes.values, function(note) { return [note.pitch, note.velocity*100]}))
        //   }
        // } );

        function getHist(tSeries) {
          return _.flatten(tSeries.ordered().map(function(notes) {
            return notes.values.map(function (note) {return {x: notes.time/*-tSeries.startTime()*/, y: note.pitch, r: note.velocity*10}});
          } ));
        }
        var allHists = Object.keys(pitchTimeSeriesCollection).map(function(k) {
        //  console.log("label",k);
          return {
            label: k,
            values: getHist(pitchTimeSeriesCollection[k])
          }
        });

        var minTime = _.min(_.map(_.values(pitchTimeSeriesCollection), function (tSeries) { return tSeries.startTime() }));
        console.log("got histograms",minTime);

        //return;
        if (!pitchFeedback) {

          //console.log("initial:", _.map(gens, function(g) {return {label:g, values: [{time:epochTime, histogram:{}}]}}));
          pitchFeedback = $('#visgraph-notes').epoch({
                type: 'scatter',
                data: allHists,//[{label: name, values: [{time:epochTime, histogram:hist}]}],
                axes: ['left', 'bottom', 'right'],
                domain: [minTime, minTime+noteRange]
                //paintZeroValues:true,
                // buckets:64,
                // bucketRange:[32,96],
                // windowSize: 5,
                // historySize:10,
                // queueSize:1
              //  tickFormats: { time: function(d) { return ""+d } }
            });
          window.pitchFeedback = pitchFeedback;
        }
        else {
          pitchFeedback.options.domain = [minTime, minTime+noteRange];
          pitchFeedback.update(allHists);
        }
      }

    }
  });


})
