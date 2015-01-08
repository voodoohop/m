var component = require('omniscient');
var React = require('react');
var mui = require('material-ui');
var Draggable = require('react-draggable');
var Paper = mui.Paper;
var immstruct = require("immstruct");
var holderStyle = {
  height: 120
};

var Popover = require("react-bootstrap").Popover;

var Tooltip = require("react-bootstrap").Tooltip;

// React.render(popoverInstance, mountNode);


// var setupListener = function(logFeed,deviceCursor) {
//     listener = logFeed.filter(function(msg) {
//       return msg.device==deviceCursor.get("id")
//     })
//     .map(n => _.extend({updateTime: Date.now()},n))
//     .scan({},function(prev,next) {
//       var res=_.clone(prev);
//       res[next.sourcePos[0]] = next;
//       return res;
//     })
//     .debounce(100)
//     .map(function (n){
//       return _.values(n);
//     })
//     .map(n => n.map(m => _.extend({timePassed: Date.now()-m.updateTime},m)).filter(m => m.timePassed<10000))
//     .onValue(function(v) {
//       deviceCursor.update(function(prev) {
//         prev.set("visibleLogs",v);
//       })
//     }.bind(this))
// }


module.exports = component("logger"
// {
//   getInitialState: function() {
//     console.log("called getinitialState");
//     allert("getinitialstate").
//     this.setState({scrollTop:0});
//     return {scrollTop:0};
//   },
//   componentWillMount: function() {
//     alert("componentWillMount");
//       console.log("willmount");
//     },
//   componentWillUnmount: function() {
//     alert("unmount");
//     this.setState({visible:[]});
//     if (listener)
//       listener();
//       listener=false;
//     }
//     ,souldComponentUpdate: function() {
//       alert("shouldupdate");
//     }
//
// }
// ,

,function(props) {

        console.log("popover initing",props);

        if (props.deviceLogs == null)
          return null;
        // setupListener(props.logFeed, props.device);
        // console.log(props.device.on("update", function() {console.log("update")}));

        // console.log("logView this", props, this);

        var style = {
          position: "absolute",
          width: "300px",
          //height: "300px",
          right: "100px",
          top: "0px",
          height:"100%",
          opacity: 0.9,
          zIndex: 100,
          pointerEvents: "none"
        }
        var scrollTop=this.props.editorState.get("scrollTop");
        // this.props.scrollFeedBack.onValue(function(v) {
        //   scrollTop = v;
        // });
        var self=this;
        function popOver(logMsg) {
          var msg = logMsg.msg;
          console.log("rendering popover for msg",logMsg);
          var tStyle = {
            pointerEvents: "auto",
            backgroundColor: "("+_.random(0,255)+","+_.random(0,255)+","+_.random(0,255)+","+_.random(0,255)+")"
          }
          // console.log("msg",logMsg);
          if (logMsg.sourcePos && logMsg.sourcePos[0]>0) {
            var coords = aceEditor.getSession().documentToScreenPosition(logMsg.sourcePos[0], 0);
            console.log("ace coords",coords, "from", logMsg.sourcePos);
          } else return null;
          var colorStyle={backgroundColor:"rgba("+_.random(127,255)+","+_.random(127,255)+","+_.random(127,255)+",0.8)"};
          var top = (coords.row-1)*aceEditor.renderer.lineHeight - scrollTop;
          console.log("top",top, scrollTop, aceEditor.renderer.lineHeight);
          var msgString = logMsg.msg.map(function(m) {return JSON.stringify(m,function(key, val) {
            return val !== null && val.toFixed ? Number(val.toFixed(3)) : val;
          }
          )});
          var visibility=(10000-logMsg.timePassed)/10000;
          if (visibility<0)
            return null;
          var disappear={opacity: visibility};
          return <div style={disappear}><Tooltip placement="right" style={tStyle} positionLeft={120} positionTop={top} title="log"><span style={colorStyle}>{msgString}</span></Tooltip></div>;
        }

        // if (!this.state || !this.state.visible)
        //   return <div />;
          // console.log("props",this.props);
        // console.log("hey from logFeedback");
        return <div style={style}>{props.deviceLogs.valueSeq().toJS().filter(function(l) {
          // console.log("filtering device", l.device, props.selectedDevice.toJS())
          return l.device==props.selectedDevice.get("id")
        }).map(popOver)}</div>;
      }
    );
