var component = require('omniscient');
var Inspector = require('react-json-inspector');
var React = require("react");
var messages=[];

module.exports = component("logWindow" ,function(props, statics) {
    statics.message.onValue(function(m) {
      messages.push(m);
      this.setState({messages:messages});
    }.bind(this));
    console.log("THIS",this);

    var ms= [];
    if (this.state && this.state.messages)
      ms = this.state.messages.map(function(m) {
        return <div key={Math.random()}> <Inspector data={m} /></div>
      });
    return <div>{ms}</div>;
});
