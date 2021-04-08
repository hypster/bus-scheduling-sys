'use strict'

var crypto = require('crypto')
var logger = require('../common/logger')
var settings = require('../app.settings')

var adminDAO = require('../models/admin')

exports.signin = function (req, res) {
  var username = req.body.username
  var password = encryptPassword(req.body.password)
  var returnUrl = req.query.returnUrl
  adminDAO.signin(username, password, function (err, admin) {
    if (err) {
      logger.error('failed to sign in portal. url: ' + req.url, err)
      return res.fail(-99, '登录失败')
    }
    if (!admin) {
      return res.fail(-1, '用户名或密码不正确')
    }
    delete admin.password
    req.session.signedAdmin = admin
    if (!returnUrl) {
      returnUrl = '/admin-pc/dashboard.html'
    }

    var menu = []
    settings.dashboard_menu.forEach(m => {
      var newMenu = renewMenu(admin.type, m)
      if (newMenu) {
        menu.push(newMenu)
      }
    })
    res.success({returnUrl, admin, menu})
  })
}
function encryptPassword (password) {
  return crypto.createHash('md5').update(password).digest('hex')
}
function renewMenu (type, menu) {
  var newMenu = Object.assign({}, menu)
  if (!newMenu.roles || newMenu.roles.some(r => r === type)) {
    if (newMenu.subMenu) {
      var newSubMenu = []
      newMenu.subMenu.forEach(sm => {
        var newItem = renewMenu(type, sm)
        if (newItem) {
          newSubMenu.push(newItem)
        }
      })
      newMenu.subMenu = newSubMenu
    }
    return newMenu
  }
  return undefined
}

exports.signout = function (req, res) {
  req.session.signedAdmin = null
  res.success({})
}

exports.changePassword = function (req, res) {
  let id = req.params.id
  let oldPassword = req.body.oldPassword
  let newPassword = req.body.newPassword
  oldPassword = encryptPassword(oldPassword)
  newPassword = encryptPassword(newPassword)

  adminDAO.getAdmin(id, function (err, admin) {
    if (err) {
      logger.error('failed to get admin with url: ' + req.url, err)
      return res.fail(-99, '系统错误，请重试')
    }

    if (admin.password !== oldPassword) {
      return res.fail(-1, '原始密码不正确')
    } else if (newPassword === oldPassword) {
      return res.fail(-2, '新密码不能与原始密码相同')
    }
    adminDAO.changePassword(id, newPassword, function (err, affectedRows) {
      if (err) {
        logger.error('failed to change password.', err)
        return res.fail(-99, '系统错误，请重试')
      }
      return res.success({})
    })
  })
}
