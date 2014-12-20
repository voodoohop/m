"use strict";
Object.defineProperties(exports, {
  t: {get: function() {
      return t;
    }},
  __esModule: {value: true}
});
var $__lib_47_utils__;
var generatorize = ($__lib_47_utils__ = require("./lib/utils"), $__lib_47_utils__ && $__lib_47_utils__.__esModule && $__lib_47_utils__ || {default: $__lib_47_utils__}).generatorize;
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
