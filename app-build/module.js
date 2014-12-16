"use strict";
Object.defineProperties(exports, {
  test: {get: function() {
      return test;
    }},
  generate: {get: function() {
      return generate;
    }},
  __esModule: {value: true}
});
var test = 'es6!';
var generate = function*() {
  let res2 = "hey";
  yield {t: (function() {
      return 3;
    })};
  yield res2;
};
