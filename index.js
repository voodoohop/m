//var System = require('systemjs');

// require('nodetime').profile({
//     accountKey: 'f6554c48283af492abfcd07d5ad45f584e1fa3e5',
//     appName: 'GenMusic',
//     debug:true
//   });

require('traceur/bin/traceur-runtime');
console.log("requiring main");
require('./app-build/main');
