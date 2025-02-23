const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const os = require('os-browserify');
const urlPolyfill = require('url');
const https = require('https-browserify');
const http = require('stream-http');
const constants = require('constants-browserify');
const pathBrowserify = require('path-browserify');
const zlib = require('browserify-zlib');
const querystring = require('querystring-es3');
const vmBrowserify = require('vm-browserify');
const assert = require('assert/build/assert.js');
const buffer = require('buffer/index.js');
const stream = require('stream-browserify');

module.exports = {
  mode: 'development',
  resolve: {
    fallback: {
      "os": require.resolve("os-browserify/browser"),
      "url": require.resolve("url"),
      "fs": false,
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "path": require.resolve("path-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "util": require.resolve('util/'),
      "querystring": require.resolve("querystring-es3"),
      "vm": require.resolve("vm-browserify"),
      "assert": require.resolve("assert/build/assert.js"),
      "buffer": require.resolve("buffer/index.js"),
      "stream": require.resolve("stream-browserify"),
      "crypto": require.resolve("crypto-browserify")
    },
  },
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader', 'postcss-loader'],
      },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'url-loader?limit=10000',
      },
      {
        test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
        use: 'file-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 8083,
    open: true,
    host: 'localhost', 
    hot: true, 
    liveReload: true, 
  },
};