var fs = require('fs')
var path = require('path')
var config = require('../config')
var webpack = require('webpack')
var merge = require('webpack-merge')
var utils = require('./utils')
var baseWebpackConfig = require('./webpack.base.conf')
var HtmlWebpackPlugin = require('html-webpack-plugin')

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
})

var webpackConfig = merge(baseWebpackConfig, {
  module: {
    loaders: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  },
  // eval-source-map is faster for development
  devtool: '#eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.dev.env
    }),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    // // https://github.com/ampedandwired/html-webpack-plugin
    // new HtmlWebpackPlugin({
    //   filename: 'index.html',
    //   template: 'index.html',
    //   inject: true
    // })
  ]
})

var rootPath = path.resolve(__dirname, '../src')
var apps = ['user', 'admin', 'admin-pc']
apps.forEach(function(dir, index) {
  var template = path.resolve(rootPath, `${dir}/template.html`)
  var pages = fs.readdirSync(path.resolve(rootPath, dir))
  pages.forEach(function(file) {
    if (path.extname(file) === '.vue') {
      var basename = path.basename(file, '.vue').toLowerCase()
      var chunks = ['vendors','common', dir, `${dir}.${basename}`]
      webpackConfig.plugins.push(new HtmlWebpackPlugin({
        filename: `${dir}/${basename}.html`,
        template: template,
        inject: true,
        chunks: chunks
      }))
    }
  })
})

module.exports = webpackConfig