'use strict'

var http = require('http')
var url = require('url')
var express = require('express')
var router = express.Router()
var Promise = require('promise')
var _ = require('lodash')

var logger = require('../common/logger')

var handler = require('./api_handler')
var userDAO = require('../models/user')

router.get('/getAuthUrl', function (req, res) {
  var state = req.query.state
  handler.generateAuthUrl(req, state, function (authUrl) {
    return res.success({
      authUrl: authUrl
    })
  })
})

router.get('/auth', function (req, res) {
  var code = req.query.code
  var state = req.query.state
  console.log(`code: ${code}, state: ${state}`)
  handler.getAccessToken(function (err, accessToken) {
    if (err) {
      return res.fail(-99, '获取AccessToken出错，授权失败')
    }
    handler.getUserInfo(accessToken, code, function (err, userInfo) {
      console.log('auth --> getUserInfo')
      if (err) {
        return res.fail(-1, '获取用户信息出错，授权失败')
      }
      if (userInfo.OpenId) {
        return res.fail(-2, '非企业成员请求，授权失败')
      }

      var userid = userInfo.UserId
      Promise.all([new Promise(function (resolve, reject) {
        handler.convertToOpenId(accessToken, userid, function (err, data) {
          if (err) {
            return reject(err.message)
          }
          return resolve(data)
        })
      }), new Promise(function (resolve, reject) {
        handler.getUserDetail(accessToken, userid, function (err, data) {
          if (err) {
            return reject(err.message)
          }
          return resolve(data)
        })
      })]).then(function (values) {
        var openIdData = values[0]
        var userDetail = values[1]
        userDetail.openid = openIdData.openid
        if (userDetail.errcode !== 0) {
          return res.fail(-3, '获取用户详情有误，授权失败')
        }
        userDAO.syncWechatUser(userDetail, function (err, user) {
          if (err) {
            logger.error('failed to sync wechat user.', err)
            return res.fail(-4, '同步用户信息出错，授权失败')
          }
          // 不返回敏感数据
          // delete user.corp_user_detail
          // delete user.balance
          // res.success(user)
          res.cookie('authed_user', JSON.stringify(user), { path: '/', maxAge: 10 * 60 * 1000 })
          var redirectUrl = '/user/entry.html'
          if (state && (_.startsWith(state, '/'))) {
            redirectUrl = state
          }
          res.redirect(redirectUrl)
        })
      }, function (reason) {
        logger.error('获取用户详情出错. reason: ' + reason)
        return res.fail(-3, '获取用户详情出错，授权失败')
      })
    })
  })
})

router.get('/getWXConfig', function (req, res) {
  handler.generateJSApiConfig(req.query.currentUrl, function (err, config) {
    if (err) {
      logger.error('failed to generate JSApi config.', err)
      return res.fail(-99, '生成微信js-sdk config出错')
    }
    return res.success(config)
  })
})

exports.callback = function (req, res) {

}

exports.getUserId = function (req, res) {

}

exports.getUser = function (req, res) {

}

exports.convertToOpenId = function (req, res) {

}

module.exports = router
