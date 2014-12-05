var webpack = require('webpack');


console.log("reading webpack config");

module.exports = {
  entry: [
    'webpack-dev-server/client?http://localhost:8000',
    'webpack/hot/dev-server',
    './web/resources/js/index'
  ],

  output: {
    path: __dirname,
    filename: 'bundle.js',
    publicPath: '/js/'
  },

  resolve: {
    extensions: ['', '.js', '.jsx']
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: [
          'jsx-loader?harmony',
          'omniscient-hot-reload-loader' // when using, change this for 'omniscient-hot-reload-loader' from npm
        ]
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};
