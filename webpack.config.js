
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

const assetsDir = path.resolve(__dirname, 'assets');
const distDir = path.resolve(__dirname, 'dist');
const jsDir = path.resolve(distDir, 'js');

module.exports = {
  plugins: [
    new CopyWebpackPlugin([
      { from: assetsDir, to: distDir },
    ]),
    new WriteFilePlugin(),
  ],
  entry: ['whatwg-fetch', './src/index.js'],
  output: {
    path: jsDir,
    publicPath: '/js/',
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
      },
      {
        test:/\.css$/,
        use:['style-loader','css-loader']
      }
    ],
  },
  devtool: 'source-map',
  devServer: {
    contentBase: distDir,
    compress: true,
    open: false,
    port: 3000,
  },
};
