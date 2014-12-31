var component = require('omniscient');
var React = require('react');


var Eq = component(function (props) {
  var mic = props.cursor;

  if (!mic.get('running')) {
    return d.div({},
                 d.p({}, "This example shows an svg equalizer for your microphone (chrome only) "),
                 d.button({ onClick: run }, 'Run it!'));
  }

  var audio = mic.cursor('audio');
  var rects = [svgAttrs].concat(audio.map(function (value, i, parent) {
    return Rect('rect-'+i, { sample: parent.cursor(i), statics: { i: i } });
  }).toArray());
  return d.div({ className: 'eq' }, d.svg.apply(d.svg, rects));
});


module.exports = component('Clicks', function (props) {
  var self = this;
  function onClick () {
    self.props.clicks.update(clicks => clicks + 1);
  }
  return <p>{this.props.clicks.deref()} -- dont  before <b>fabianafaleironanona</b> and doing nothing pressing 'up' a few times, the code reloads without a refresh -- <button onClick={onClick}>up</button></p>
});
