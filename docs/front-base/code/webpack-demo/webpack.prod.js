const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack')
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = merge(common, {
  devtool: 'source-map',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("./src/demo6/styles.css"),
    new webpack.DefinePlugin({
      'precess.env.NODE_ENV': JSON.stringify('production')
    })
  ]
})