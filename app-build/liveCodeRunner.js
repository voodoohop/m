"use strict";
Object.defineProperties(exports, {
  liveCodeRun: {get: function() {
      return liveCodeRun;
    }},
  __esModule: {value: true}
});
var $__time__,
    $__functionalMonads__,
    $__oscAbletonCommunication__;
var hotload = require("hotload");
var t = ($__time__ = require("./time"), $__time__ && $__time__.__esModule && $__time__ || {default: $__time__}).t;
var m = ($__functionalMonads__ = require("./functionalMonads"), $__functionalMonads__ && $__functionalMonads__.__esModule && $__functionalMonads__ || {default: $__functionalMonads__}).m;
var baconParam = ($__oscAbletonCommunication__ = require("./oscAbletonCommunication"), $__oscAbletonCommunication__ && $__oscAbletonCommunication__.__esModule && $__oscAbletonCommunication__ || {default: $__oscAbletonCommunication__}).baconParam;
var teoria = require("teoria");
var activeSequencers = [];
function liveCodeRun(path, sequencer) {
  console.log("livecoderun");
  var liveCode = hotload(path, function(newCode) {
    console.log("reloaded", newCode);
    console.log("stopping activeSequencers", activeSequencers);
    for (var $__3 = activeSequencers[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__4; !($__4 = $__3.next()).done; ) {
      let s = $__4.value;
      {
        s.stop();
      }
    }
    firstTime = null;
    let sequences = newCode.run(m, t, baconParam, teoria);
    activeSequencers = sequences.map((function(s) {
      return sequencer(s);
    }));
    console.log("activeSequencers", activeSequencers.length);
  });
}
