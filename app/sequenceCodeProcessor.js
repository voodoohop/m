var Bacon = require("baconjs");

// var traceur = require("traceur");

var to5 = require("6to5");

var depGraph = require('es-dependency-graph');

var convertSourceMap = require('convert-source-map');

var sourceMapper = require('source-map');

var _ = require("lodash");

import log from "./lib/logger";

import wrapError from "./wrapSequenceError";

export default function(seq) {

  try {
    var dependencies = depGraph(seq.code, {
      includeBindings: true
    });
    var compiled;

    compiled = to5.transform(seq.code , _.extend(require("../6to5options")));
    // traceur.compile(seq.code, {
    //   sourceMaps: "inline",
    //   modules: "register",
    //   generators: "parse",
    //   blockBinding: "parse",
    //   numericLiterals: "parse",
    //   forOf: true,
    //   classes: "parse",
    //   symbols: "parse"
    // });
    // --numeric-literals=parse --block-binding=parse --generators=parse --for-of=parse --classes=parse
    log.info("compiled code using 6to5", compiled);
  } catch (exception) {
    console.log("code compile error".bold.red, seq, exception, exception.trace);
    return wrapError(exception, seq);
  }
  var sourceMap = compiled.map;// convertSourceMap.fromSource(compiled.code);
  // console.log("compiledCode",compiled.bgYellow.black, sourceMap);

  var mapPosition = undefined;
  if (sourceMap) {
    var smc = new sourceMapper.SourceMapConsumer(sourceMap);
    mapPosition = (line, column) => {
        // console.log("getting source pos for ",line,column);
        return smc.originalPositionFor({
          line: Math.max(1, line - 2),
          column: column
        });
      }
      // console.log("mapPos",mapPosition(3,3));
  }
  return _.extend({
    processedCode: compiled.code,
    sourceMap: sourceMap,
    sourcePos: mapPosition,
    imports: dependencies.imports,
    exports: dependencies.exports
  }, seq);

}
