//var System = require('systemjs');

// require('nodetime').profile({
//     accountKey: 'f6554c48283af492abfcd07d5ad45f584e1fa3e5',
//     appName: 'GenMusic',
//     debug:true
//   });
// require("long-stack-traces");
// console.log(Symbol);
var dispName = require('stack-displayname');

require('source-map-support').install();
require('traceur/bin/traceur-runtime');

Error.stackTraceLimit = 200;


console.log("requiring main");
require('./app-build/main');



  //

  // var fs = require("fs");
// var agent = require('strong-agent');
// agent.metrics.startCpuProfiling();
// setTimeout(function() {
//      var filename = 'CPU-' + Date.now() + '.cpuprofile';
//      var data = agent.metrics.stopCpuProfiling();
//      fs.writeFileSync(filename, data);
// },10000);
