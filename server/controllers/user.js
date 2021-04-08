'use strict'

var logger = require('../common/logger')
var userDAO = require('../models/user')

exports.getUser = function (req, res) {
  var id = req.params.id
  userDAO.getUser(id, function (err, user) {
    if (err) {
      logger.error('failed to get user. url: ' + req.url, err)
      return res.fail(-99, '获取用户信息失败')
    }
    if (!user) {
      return res.fail(-1, '用户不存在')
    }
    delete user.corp_user_detail
    return res.success(user)
  })
}

exports.saveUser = function (req, res) {
  var id = req.params.id
  var uesr = req.body
  if (id === 'undefined') {
    return res.fail(-400, '参数错误，请刷新页面后重试')
  }
  userDAO.saveUser(id, uesr.name, uesr.phone, uesr.campus, function (err, affectedRows) {
    if (err) {
      logger.error('failed to save user. url: ' + req.url, err)
      return res.fail(-99, '更新用户信息失败')
    }
    return res.success({id})
  })
}
