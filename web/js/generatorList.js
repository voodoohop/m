
// var React = require('react');
// var gens = [];
//
// var ReactApp = React.createClass({
//   getInitialState: function() {
//     return {generators: []};
//   },
//   componentDidMount: function() {
//     console.log(this.props.socket);
//     var socket = this.props.socket;
//     console.log("emitting requestgenerators")
//     socket.emit("requestGenerators","yes");
//     var self=this;
//     socket.on("generators", function(genList) {
//       console.log("recevied generators",genList);
//       self.setState({generators: genList});
//       gens = genList;
//     });
//   },
//   render:function() {
//     return React.DOM.div(null, GeneratorList({generators: this.state.generators}));
//   }
// })
//
// var GeneratorList = comp
//   render: function() {
//     var createItem = function(generator) {
//       //console.log("li",generator);
//
//       return React.DOM.li(null, [React.DOM.div(null,generator)]);
//     };
//     return React.DOM.ul(null, this.props.generators.map(createItem))
//   }
// });



var component = require('omniscient');
var React = require('react');
var TreeView = require('react-treeview');

var GenPreview = require('./generatorPreview');


module.exports = component('GeneratorList', function (props) {
  var createItem = function(treeNode, root, key) {
    if (!key)
      key="";
    // console.log("li",treeNode);
    var style={padding:"10px", position: "relative"};
    var floatRight = {position:"absolute", left:"15px"};
    // var keyOuter = generator.device;
    // return <TreeView key=generator.device
    if (typeof treeNode == "object" && treeNode != null && !treeNode.hasOwnProperty("isSequenceGenerator")) {
      var keys= Object.keys(treeNode).sort();
      return keys.map(function (nodeKey) { return <TreeView key={""+nodeKey+"_"+key} defaultCollapsed={root} nodeLabel={nodeKey}>{createItem(treeNode[nodeKey],false,key+"/"+nodeKey)}</TreeView>});
    }
    else {
      //return <div>{treeNode.name}</div>
      var handleClick = function() {
        // console.log("click",key,this,treeNode);
        this.props.statics.loadCode(key);
      }.bind(this);
      if (treeNode && treeNode.isSequenceGenerator)
        return <div onClick={handleClick}>{GenPreview(treeNode)}</div>;
      else
        return <div onClick={handleClick}>{key}</div>
    }
    return <div style={style}><span style={floatRight}><small>{generator.device}</small>/<b>{generator.name}</b></span>{GenPreview(generator)}</div>;
  }.bind(this);
  // console.log("GenListProps",props.cursor.toArray());
  var tree = {};

  // console.log("keysss",props.cursor.toJS());//keySeq().toJS());

  console.log(props);
  props.cursor.valueSeq().forEach(function(gen) {
    // console.log("genCursor",props.cursor.toJS());
    tree[gen.device] = gen.evaluatedDetails || gen.evaluatedError;
  }.bind(this));



  console.log("tree",tree);
  return <div>{createItem(tree, true)}</div>

  // return <div><h4>Generators</h4>{props.cursor.toArray().map(createItem)}</div>;

  // var self = this;
  // function onClick () {
  //   self.props.clicks.update(clicks => clicks + 1);
  // }
  // return <p>{this.props.clicks.deref()} -- dont  before <b>fabianafaleironanona</b> and doing nothing pressing 'up' a few times, the code reloads without a refresh -- <button onClick={onClick}>up</button></p>
});
