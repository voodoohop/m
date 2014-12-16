//var System = require('systemjs');

// require('nodetime').profile({
//     accountKey: 'f6554c48283af492abfcd07d5ad45f584e1fa3e5',
//     appName: 'GenMusic',
//     debug:true
//   });
require('source-map-support').install();
require('traceur/bin/traceur-runtime');

var agent = require('strong-agent');

var fs = require("fs");
agent.metrics.startCpuProfiling();

console.log("requiring main");
require('./app-build/main');

setTimeout(function() {
     var filename = 'CPU-' + Date.now() + '.cpuprofile';
     var data = agent.metrics.stopCpuProfiling();
     fs.writeFileSync(filename, data);
},10000);
