var ace = require('brace');
require('brace/mode/javascript');
require('brace/theme/monokai');
require('brace/ext/searchbox');
// require('brace/ext/linking');
// require('brace/ext/split');
require('brace/ext/split');
 var Range =ace.acequire('ace/range').Range;
 var LineWidgets = ace.acequire('ace/line_widgets').LineWidgets;
 // window.LineWidgets = LineWidgets;
// var TokenIterator = require("ace/token_iterator").TokenIterator;

var _ = require("lodash");

window._ = _;


// var editor = ace.edit('javascript-editor');
// editor.getSession().setMode('ace/mode/javascript');
// editor.setTheme('ace/theme/monokai');


var React = require('react');


// var Draggable = require('react-draggable');

var exportFinder = require("./exportLineLocator");

var findExports = function(code) {
  var foundExports = exportFinder(code);
  console.log("foundExports",foundExports);
  return foundExports;
}


module.exports = React.createClass({
  componentDidMount: function () {
    this.props.unsubscribers = [];
    this.editor = ace.edit(this.getDOMNode());
    this.editSession = this.editor.getSession();

    this.editor.getSession().setMode('ace/mode/javascript');
    this.editor.setTheme('ace/theme/monokai');
    this.editor.getSession().widgetManager = new LineWidgets(this.editSession);
    this.editor.getSession().widgetManager.attach(this.editor);
    // this.editor.setOption("enableLineWidgets",true);
    // this.editor.setOption("enableLinking",true);
    window.aceEditor = this.editor;
    // window.lineWidgets=lineWidgets;
    this.editor.focus();
    this.setState({});
    this.props.unsubscribers.push(this.props.cursorToSeq.onValue(function(v) {
      if (v.error) {
        this.editor.getSession().setAnnotations([{
          row: v.errorPos[0]-1,
          column: v.errorPos[1],
          text: v.description,
          type: "error" // also warning and information
        }]);
        this.editor.moveCursorTo(v.errorPos[0]-1,v.errorPos[1]);
      }
      else
        this.setState({cursorToSeq: v});
    }.bind(this)));
    this.props.unsubscribers.push(this.props.setCode.onValue(function(v) {
      this.editor.setValue(v);
      var exported = findExports(v);
      if (this.state.cursorToSeq) {
        var seqName = this.state.cursorToSeq;
        var exportMatch = _.find(exported,function(e) {
          return e.name == seqName;
        });
        this.editor.moveCursorTo(exportMatch.loc.start.line-1,0);
      }
      this.setState({exportedSequences: exported});
      this.editor.focus();
      this.editor.clearSelection();
      this.editor.setHighlightActiveLine(true);

    }.bind(this)));
    this.props.unsubscribers.push(this.props.sequenceFeedback.onValue(function(v) {
        if (!v.velocity)
          return;
        var exported = this.state.exportedSequences;
        // console.log(exported);
        var exportMatch = _.find(exported,function(e) {
          return e.name == v.seqName;
        });
      //  console.log(exportMatch);
        if (exportMatch) {

          var range = new Range(exportMatch.loc.start.line-1, exportMatch.loc.start.column, exportMatch.loc.end.line-1, exportMatch.loc.end.column);
          // console.log(range);
          var marker = this.editor.getSession().addMarker(range,"sequenceFeedbackMarker","text");
          setTimeout(function() {
            this.editor.getSession().removeMarker(marker);
          }.bind(this),100);
        }
    }.bind(this)));

  //  this.editor.setValue(this.props.initialValue, -1);

  this.editor.session.on("changeScrollTop", function(s) {
    this.props.scrollFeedBack.push(s);
    // console.log("scrollFeedBack",s);
  }.bind(this));
  this.editor.commands.addCommand({
    name: 'play',
    bindKey: {win: 'Shift-Space',  mac: 'Shift-Space'},
    exec: function(editor) {
      // socket.emit("codeChange",{maxDeviceId: myDeviceId, code:editor.getValue()});
      this.props.codePlay.push(this.editor.getValue());
      this.setState({exportedSequences: findExports(this.editor.getValue())});
    }.bind(this),
    readOnly: true // false if this command should not apply in readOnly mode
  });
  },

  componentWillUnmount: function () {
    this.editor.destroy();
    this.props.unsubscribers.forEach(function (u) {u()});
  },
  render: function () {

    var style={width:"100%",height:"100%"};
    var res= (
      <div style={style} className="ace-editor-wrapper"></div>
    );
    // console.log("draggable res",res);
    return res;
  }
});
