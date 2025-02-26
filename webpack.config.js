const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = (env) => {
  return {
    resolve: {
      fallback: {
        "querystring": require.resolve("querystring-es3"), // Добавлено
        "zlib": require.resolve("browserify-zlib"), // Добавлено
        "util": require.resolve("util/"), // Добавлено
        "crypto": require.resolve("crypto-browserify"), // Добавлено
        "stream": require.resolve("stream-browserify"), // Добавлено
        "path": require.resolve("path-browserify"), // Добавлено
        "vm": require.resolve("vm-browserify"), // Добавлено
        "assert": require.resolve("assert"), // Добавлено
        "url": require.resolve("url/"), // Добавлено
        "https": require.resolve("https-browserify"), // Добавлено
        "http": require.resolve("stream-http"), // Добавлено
        "buffer": require.resolve("buffer/"), // Добавлено
      },
    },
    mode: env.mode ?? 'development',
    entry: path.resolve(__dirname, 'src', 'index.js'),
    stats: {
      errorDetails: true, 
    },
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: '[name].[contenthash].js',
      clean: true,
    },
    plugins: [
      new HtmlWebpackPlugin({ template: path.resolve(__dirname, 'index.html') }),
      new webpack.ProgressPlugin(),
      new webpack.ProvidePlugin({  // Добавлено
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
    module: {
      rules: [
        { test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader', 'postcss-loader'],
        },
      ]
    },
    devServer: {
      open: true,
      port: 8083,
    }
  }
}