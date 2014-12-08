var ace = require('brace');
require('brace/mode/javascript');
require('brace/theme/monokai');
require('brace/ext/searchbox');
// require('brace/ext/linking');
require('brace/ext/split');
// var TokenIterator = require("ace/token_iterator").TokenIterator;
var _ = require("lodash");

window._ = _;


// var editor = ace.edit('javascript-editor');
// editor.getSession().setMode('ace/mode/javascript');
// editor.setTheme('ace/theme/monokai');


var React = require('react');
// var Draggable = require('react-draggable');

module.exports = React.createClass({

  componentDidMount: function () {
    this.editor = ace.edit(this.getDOMNode());
    this.editSession = this.editor.getSession();

    this.editor.getSession().setMode('ace/mode/javascript');
    this.editor.setTheme('ace/theme/monokai');
    // this.editor.setOption("enableLinking",true);
    window.aceEditor = this.editor;
    this.editor.focus();
    this.props.setCode.onValue(function(v) {
      this.editor.setValue(v);
    }.bind(this));


  //  this.editor.setValue(this.props.initialValue, -1);
  this.editor.commands.addCommand({
    name: 'play',
    bindKey: {win: 'Shift-Space',  mac: 'Shift-Space'},
    exec: function(editor) {
      // socket.emit("codeChange",{maxDeviceId: myDeviceId, code:editor.getValue()});
      this.props.codePlay.push(this.editor.getValue());

    }.bind(this),
    readOnly: true // false if this command should not apply in readOnly mode
  });
  },

  componentWillUnmount: function () {
    this.editor.destroy();
  },
  render: function () {
    var style={width:"100%",height:"100%"};
    var res= (
      <div style={style} className="ace-editor-wrapper"></div>
    );
    console.log("draggable res",res);
    return res;
  }
});
