var fs = require('fs');
var path = require('path')
var config = require('../config')
var utils = require('./utils')
var projectRoot = path.resolve(__dirname, '../')

var config = {
  entry: {
    common: [],
    vendors: ["assets/weui.css"]
  },
  output: {
    path: config.build.assetsRoot,
    publicPath: process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : config.dev.assetsPublicPath,
    filename: '[name].js'
  },
  resolve: {
    extensions: ['', '.js', '.vue'],
    fallback: [path.join(__dirname, '../node_modules')],
    alias: {
      'src': path.resolve(__dirname, '../src'),
      'assets': path.resolve(__dirname, '../src/common/assets'),
      'components': path.resolve(__dirname, '../src/common/components')
    }
  },
  resolveLoader: {
    fallback: [path.join(__dirname, '../node_modules')]
  },
  module: {
    preLoaders: [
      // {
      //   test: /\.vue$/,
      //   loader: 'eslint',
      //   include: projectRoot,
      //   exclude: /node_modules/
      // },
      {
        test: /\.js$/,
        loader: 'eslint',
        include: projectRoot,
        exclude: /node_modules/
      }
    ],
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.js$/,
        loader: 'babel',
        include: projectRoot,
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.html$/,
        loader: 'vue-html'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  eslint: {
    formatter: require('eslint-friendly-formatter')
  },
  vue: {
    loaders: utils.cssLoaders()
  }
}

var rootPath = path.resolve(__dirname, '../src')
var apps = ['user', 'admin', 'admin-pc'];
apps.forEach(function(dir, index) {
  var pages = fs.readdirSync(path.resolve(rootPath, dir))
  pages.forEach(function(file) {
    if (path.extname(file) === '.vue') {
      var page = path.basename(file, '.vue').toLowerCase()
      var scripts = fs.readFileSync(path.resolve(rootPath, dir, 'template.entry.js'), 'utf8').replace('{{Page}}', `../${file}`)
      var binFolder = path.resolve(rootPath, dir, 'bin')
      try {
        fs.existsSync(binFolder) || fs.mkdirSync(binFolder)
      } catch (error) {
        console.error(error)
        if (error.code != 'EEXIST') throw error;
      }
      var entryFile = path.resolve(rootPath, dir, `bin/${page}.entry.js`)
      fs.writeFileSync(entryFile, scripts, 'utf8')
      config.entry[`${dir}.${page}`] = `./src/${dir}/bin/${page}.entry.js`
    }
  });
});

module.exports = config;
