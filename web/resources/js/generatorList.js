
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

var GenPreview = require('./generatorPreview');

module.exports = component('GeneratorList', function (props) {

  var createItem = function(generator) {
    console.log("li",generator);
    var style={padding:"10px", position: "relative"};
    var floatRight = {position:"absolute", left:"15px"};
    return <div style={style}><span style={floatRight}>{generator.name}</span>{GenPreview(generator)}</div>;
  };
  console.log("GenListProps",props.cursor.toArray());
  return <div><h4>Generators</h4>{props.cursor.toArray().map(createItem)}</div>;

  // var self = this;
  // function onClick () {
  //   self.props.clicks.update(clicks => clicks + 1);
  // }
  // return <p>{this.props.clicks.deref()} -- dont  before <b>fabianafaleironanona</b> and doing nothing pressing 'up' a few times, the code reloads without a refresh -- <button onClick={onClick}>up</button></p>
});
