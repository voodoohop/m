//
// declare class ErrorStatic {
//   stackTraceLimit: number;
// }
//
// declare var Error: ErrorStatic;

//var System = require('systemjs');

// require('nodetime').profile({
//     accountKey: 'f6554c48283af492abfcd07d5ad45f584e1fa3e5',
//     appName: 'GenMusic',
//     debug:true
//   });
// require("long-stack-traces");
// console.log(Symbol);

console.log("start");
var dispName = require('stack-displayname');

require("6to5/register")(require("./6to5options"));

require('source-map-support').install();
// require('traceur/bin/traceur-runtime');

Error.stackTraceLimit = 100;


console.log("requiring main3");
require('./app/main');



  //
//
//   var fs = require("fs");
// var agent = require('strong-agent');
// agent.metrics.startCpuProfiling();
// setTimeout(function() {
//      var filename = 'CPU-' + Date.now() + '.cpuprofile';
//      var data = agent.metrics.stopCpuProfiling();
//      fs.writeFileSync(filename, data);
// },100000);
