const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack')
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const Visualizer = require('webpack-visualizer-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
    }),
    new Visualizer(),
    // new BundleAnalyzerPlugin()
  ],
  optimization: {
    // moduleIds: 'hashed',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
      chunks: 'all'
    },
      
  }
})