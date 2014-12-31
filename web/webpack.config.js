var webpack = require('webpack');


console.log("reading webpack config");

module.exports = {
  entry: [
    'webpack-dev-server/client?http://localhost:8000',
    'webpack/hot/dev-server',
    './web/js/index'
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
        test: /\.js.?$/,
        loaders: [
        //  '6to5-loader',
          'jsx-loader?harmony',
          'omniscient-hot-reload-loader'
        ]
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};
