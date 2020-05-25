const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
module.exports = {
  entry: {
    index: './src/demo8/other_module.js',
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    // chunkFilename: '[name].[contenthash]bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new CleanWebpackPlugin()
  ],
  // optimization: {
  //   splitChunks: {
  //     chunks: 'all',
  //   },
  // }
}

