"use strict";
Object.defineProperties(exports, {
  t: {get: function() {
      return t;
    }},
  __esModule: {value: true}
});
var $__utils__;
var generatorize = ($__utils__ = require("./utils"), $__utils__ && $__utils__.__esModule && $__utils__ || {default: $__utils__}).generatorize;
var Bacon = require("baconjs");
var t = {
  beatsPerBar: 4,
  beats: generatorize((function(n) {
    return n * 480;
  })),
  bars: generatorize((function(n) {
    return n * t.beatsPerBar;
  })),
  nth: generatorize((function(n) {
    return 1.0 / n;
  }))
};
