var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app);
var EurecaServer = require('eureca.io').EurecaServer;

var eurecaServer = new EurecaServer();

eurecaServer.attach(server);


//functions under "exports" namespace will be exposed to client side
eurecaServer.exports.hello = function (args) {
    console.log('Hello from client',args);
}
//------------------------------------------

//see browser client side code for index.html content
app.get('/', function (req, res, next) {
    res.sendfile('browser/eureka.html');
});

server.listen(8000);
