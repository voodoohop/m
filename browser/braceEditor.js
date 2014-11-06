var ace = require('brace');
require('brace/mode/javascript');
require('brace/theme/monokai');

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
  socket.emit("getCode", {maxDeviceId: myDeviceId});
  if (codeLoaded)
    window.setTimeout( function() {
      socket.emit("codeChange",{maxDeviceId: myDeviceId, code:editor.getValue()});
    },100);
});

console.log("editor",editor);

var codeLoaded = false;
socket.on("code", function(code) {
  console.log(editor);
  editor.setValue(code);
  codeLoaded = true;
//  socket.emit("codeChange",{maxDeviceId: myDeviceId, code:editor.getValue()});
});



$(document).ready(function() {
  $(".ace_text-layer").jrumble({opacity:true, rotation: 0, x:5, y:5, speed:15, opacityMin:0.6});

  socket.on("beat",function (beatInfo)  {
    return;
    $("#beatIndicator").text(""+beatInfo);
    if (beatInfo % 4 ==0) {

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
      return React.DOM.li(null, generator);
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
