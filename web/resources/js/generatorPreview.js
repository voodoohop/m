
var seedrandom = require('seedrandom');

function stringToColour(str) {
  var rng = seedrandom(str);
  //console.log("seed",str,rng());

  var rand = Math.floor(rng()*360);
  //for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((rand >> i++ * 8) & 0xFF).toString(16)).slice(-2));
  return "hsl("+rand+",100%,50%)";
}

var component = require('omniscient');
var React = require('react');

var _ = require("lodash");

var noteRect = component("noteRect", function(note) {
  if (note.evt)
    return noteRect(note.evt);
  var timeScale=1/16;
  var col = note.color || "rgba(255,255,255,1)";
  var opacity=note.velocity/1.7+0.1;
  if (note.duration < 0) {
    // note.duration =0;
    console.log("Negative Duration Error"+JSON.stringify(note));
  }
  return <rect  opacity={opacity} fill={col} x={note.time * timeScale} y={1-Math.min(Math.max(note.pitch-20,0)/87,1)} width={note.duration * timeScale} height={1/16}/>
});
//
var noteLine = component("noteAutomation", function(props) {
  if (props.index == 0)
    return null;
  // console.log("props",props);
  var prevNote=props.notes[props.index-1];
  var timeScale=1/16;
  var col = stringToColour(props.name);//props.note.color || "rgba(255,255,255,1)";
;
  var coords = {
    x1: props.note.time * timeScale,
    x2: prevNote.time * timeScale,
    y1: 1-props.note.automationVal,
    y2: 1-prevNote.automationVal
  };
  return <line {...coords} stroke={col} strokeDasharray="0.04 0.01" opacity="0.8" strokeWidth="0.006"/>
});

var gridLine = component("gridLines", function(props) {
    var gridLines = [];
    for (var i=0;i<16;i++) {
      var coords = {
        x1: i/16, x2:i/16, y1:0, y2:1,
      };
      var opacity = i % 8 == 0 ? 0.8 : ( i%4==0 ? 0.4 : (i % 2 == 0 ? 0.2 : 0.1) );
      gridLines.push(<line {...coords} strokeWidth="0.004" stroke="rgba(255,255,255,1)" opacity={opacity} />);
    }
    return <g>{gridLines}</g>;
});


module.exports = component("generatorPreview", function(gens) {
  console.log("genPreview",gens);
  var evts = gens.eventSample;
  var style={display:"inline-block", width:"100%", height:"80px", border: "1px solid white"};
  var SIZE = 1;
  var svgAttrs = {
    preserveAspectRatio: 'none', // stretch to fill container
    viewBox: '0 0 ' + SIZE + ' ' + SIZE,
    style: { height: '100%', width: '100%', display: 'block', padding: "3px"}
  };
  var notes = evts.filter(function(event) {
    return event.hasOwnProperty("pitch") && event.hasOwnProperty("velocity") && event.velocity;
  });
  var automationsGrouped= evts.filter(function(event) {
    return event.hasOwnProperty("automationVal");
  });

  // .map(function(note,index,notes) {
  //   return {note:note, index:index, notes:notes};
  // });
  automations = _.groupBy(automationsGrouped,function(a) {return a.name;});
  // console.log(automations);
  var noteLines = Object.keys(automations).map(function(automationName) {
    return automations[automationName].map(function(note,index,notes) {
        return {note:note, index:index, notes:notes, name: note.name};
    }).map(noteLine)
  });
  // var code = gens
  console.log("gens",gens);
  return <div style={style}>
  <svg className="noteView" {...svgAttrs}>{notes.map(noteRect)}{noteLines}{gridLine()}
  </svg>
  {gens.sequenceAsString}
  </div>;
});
