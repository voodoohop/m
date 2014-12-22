"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__wrapSequenceError__;
var Bacon = require("baconjs");
var traceur = require("traceur");
var depGraph = require('es-dependency-graph');
var convertSourceMap = require('convert-source-map');
var sourceMapper = require('source-map');
var _ = require("lodash");
var wrapError = ($__wrapSequenceError__ = require("./wrapSequenceError"), $__wrapSequenceError__ && $__wrapSequenceError__.__esModule && $__wrapSequenceError__ || {default: $__wrapSequenceError__}).default;
var $__default = function(seq) {
  try {
    var dependencies = depGraph(seq.code, {includeBindings: true});
    var compiled;
    compiled = traceur.compile(seq.code, {
      sourceMaps: "inline",
      modules: "register",
      generators: "parse",
      blockBinding: "parse",
      numericLiterals: "parse",
      forOf: true,
      classes: "parse",
      symbols: "parse"
    });
  } catch (exception) {
    console.log("code compile error".bold.red, seq, exception, exception.trace);
    return wrapError(exception, seq);
  }
  var sourceMap = convertSourceMap.fromSource(compiled);
  var mapPosition = undefined;
  if (sourceMap.sourcemap) {
    var smc = new sourceMapper.SourceMapConsumer(sourceMap.sourcemap);
    mapPosition = (function(line, column) {
      return smc.originalPositionFor({
        line: line,
        column: column
      });
    });
  }
  return _.extend({
    processedCode: compiled,
    sourceMap: sourceMap.sourcemap,
    sourcePos: mapPosition,
    imports: dependencies.imports,
    exports: dependencies.exports
  }, seq);
};
