var graph = new joint.dia.Graph;
var Bacon = require("baconjs");
var _ = require("lodash");

// return;

var paper = new joint.dia.Paper({
  el: $('#graphWindow'),
  width: $(window).width(),
  height: $(window).height(),
  model: graph,
  gridSize: 5
});

var rect = new joint.shapes.basic.Rect({
  position: {
    x: 100,
    y: 30
  },
  size: {
    width: 100,
    height: 30
  },
  attrs: {
    rect: {
      fill: "rgba(255,255,255,0.7)"
    },
    text: {
      text: 'my box',
      fill: 'black'
    }
  }
});

var rect2 = rect.clone();
rect2.translate(300);

var link = new joint.dia.Link({
  source: {
    id: rect.id
  },
  target: {
    id: rect2.id
  }
});

// graph.addCells([rect, rect2, link]);;

exports.graph = graph;
exports.generatorInfo = new Bacon.Bus();


var nodes = {};

exports.generatorInfo.onValue(v => {
  if (!v.device || nodes[v.device])
    return
  console.log("jgraph geninfo", v);
  nodes[v.device] = {
    deviceDetails: v
  }
  var shorten = function(s) {return s.substring(0,8);};
  nodes[v.device].nodeVis = new joint.shapes.devs.Model({
    position: { x: Math.random()*$(window).width()*0.3+0.5, y: Math.random()*$(window).height() },
    size: { width: 100, height: 40 },
    inPorts: v.imports && Object.keys(v.imports).length ? ["in"] :[],
    outPorts: (v.exports.length ? v.exports.map(shorten)  : []),
    attrs: {
      '.label': { text: shorten(v.device), 'ref-x': .4, 'ref-y': .2 },
      rect: { fill: 'rgba(255,255,255,0.5)' },
      '.inPorts circle': { fill: 'lightgray', radius:'3' },
      '.outPorts circle': { fill: 'darkgray' },
      '.inPorts text': {fill: "white"},
      '.outPorts text': {fill: "white"}
    }
  });

  Object.keys(v.imports).forEach(function(dev) {
    if (nodes[dev]) {

      link = new joint.dia.Link({
        source: { id: nodes[v.device].nodeVis.id },
        target: { id: nodes[dev].nodeVis.id }
      });
      graph.addCell(link);
    }
  });

  // graph.addCell(nodes[v.device].nodeVis);
//  nodes[v.device].nodeVis.translate(Math.random() * 200-100, Math.random() * 200-100);
//  graph.addCell(nodes[v.device].nodeVis);
});
