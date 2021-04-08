'use strict'

var fs = require('fs')
var https = require('https')

var express = require('express')
var session = require('express-session')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var logger = require('./common/logger')
var _ = require('lodash')

var app = express()

app.use(cookieParser())
app.use(session({
  secret: 'campus-bus',
  name: 'session_id',
  path: '/'
}))
app.use(bodyParser.json({ limit: '1mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }))

app.use(function (req, res, next) {
  res.success = function (data) {
    res.response(0, 'success', data)
  }
  res.fail = function (code, message) {
    res.response(code, message)
  }
  res.response = function (code, message, data) {
    res.json({code: code, message: message, data: data, now: new Date()})
  }
  res.error = function (data) {
    res.json({code: '-99', message: 'error', data: data})
  }
  next()
})
// 默认跳转到pc管理后台
app.use('/', function (req, res, next) {
  if (req.url === '/') {
    return res.json({
      status: 'ok'
    })
    // return res.redirect('/admin-pc/dashboard.html')
  }
  next()
})
app.use('/api', require('./apiRouter'))
app.use('/api/web', require('./apiWebRouter'))
app.use('/api/wechat', require('./wechat/router'))
process.on('uncaughtException', function (err) {
  logger.fatal('uncaughtException: ' + err.stack)
})

app.use('/admin-pc', function (req, res, next) {
  if (!_.startsWith(req.url, '/signin.html')) {
    if (!req.session.signedAdmin) {
      return res.redirect(`./signin.html?returnUrl=${encodeURIComponent('/admin-pc/' + _.trimStart(req.url, '/'))}`)
    }
  }
  next()
})

// 启动定时任务
require('./jobs')

if (module.parent) {
  module.exports = app
} else {
  var config = require('../config')
  app.use(express.static(config.build.assetsRoot))

  var gSettings = require('../global.settings')
  if (!gSettings.onlyHttps) {
    var port = gSettings.port || config.build.port
    module.exports = app.listen(port, function (err) {
      if (err) {
        console.log(err)
        return
      }
      console.log('Listening at http://localhost:' + port + '\n')
    })
  }

  var credentials = {
    key: fs.readFileSync(gSettings.sslKeyPath, 'utf-8'),
    cert: fs.readFileSync(gSettings.sslCertPath, 'utf-8'),
    ca: fs.readFileSync(gSettings.sslCaPath, 'utf-8')
  }
  var sslPort = gSettings.sslPort || 443
  var httpsServer = https.createServer(credentials, app)
  httpsServer.listen(sslPort, function (err) {
    if (err) {
      console.log(err)
      return
    }
    console.log('Listening at https://localhost:' + sslPort + '\n')
  })
}
