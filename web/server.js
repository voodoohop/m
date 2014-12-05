var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var config = require('./webpack.config');

var options = {
  publicPath: config.output.publicPath,
  hot: true
};

var srv = new WebpackDevServer(webpack(config), options);

  srv.listen(8000, 'localhost', function (err, result) {
    if (err) console.error(err);
  });


module.exports = srv;


// console.log("SERVER",srv);
