"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var Bacon = require("baconjs");
var traceur = require("traceur");
var depGraph = require('es-dependency-graph');
var _ = require("lodash");
var $__default = function(seq) {
  try {
    var dependencies = depGraph(seq.code, {includeBindings: true});
    var compiled = traceur.compile(seq.code, {
      modules: "register",
      generators: "parse",
      blockBinding: "parse"
    });
    return _.extend({
      processedCode: compiled,
      imports: dependencies.imports,
      exports: dependencies.exports
    }, seq);
  } catch (exception) {
    console.log("code process error".bold.red, seq, exception, exception.trace);
    return new Bacon.Error({
      msg: "code process error",
      exception: exception
    });
  }
};

//# sourceMappingURL=sequenceCodeProcessor.map
