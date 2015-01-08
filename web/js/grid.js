

var ReactGridLayout = require('react-grid-layout');


var component = require('omniscient');
var React = require('react');

var _ = require("lodash");

module.exports = React.createClass("codeGrid", [React.addons.PureRenderMixin],function() {
  var divStyle={border: "1px solid black", backgroundColor:"rgba(255,0,0,0.7)"}
  return <ReactGridLayout cols={10} rowHeight={30}
    useCSSTransforms={true}
    autoSize={true}
    isDraggable={true}
    isResizable={true}
  >
  <div style={divStyle} key={1} _grid={{x: 0, y: 0, w: 1, h: 2}}>1</div>
  <div style={divStyle}  key={2} _grid={{x: 0, y: 3, w: 1, h: 2}}>2tom</div>
  <div style={divStyle}  key={3} _grid={{x: 4, y: 0, w: 1, h: 2}}>3</div>
  </ReactGridLayout>;
});
