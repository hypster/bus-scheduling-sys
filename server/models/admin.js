'use strict'

var dbhelper = require('./dbhelper')

exports.signin = function (username, password, cb) {
  dbhelper.query({
    sql: 'SELECT * FROM `admin` WHERE `username`=? AND `password`=?',
    values: [username, password]
  }, function (err, results, fields) {
    if (err) {
      return cb(err)
    }
    return cb(null, results[0])
  })
}

exports.getAdmin = function (id, cb) {
  dbhelper.query({
    sql: 'SELECT * FROM `admin` WHERE `id`=?',
    values: [id]
  }, function (err, results, fields) {
    if (err) {
      return cb(err)
    }
    return cb(null, results[0])
  })
}

exports.changePassword = function (id, newPassword, cb) {
  dbhelper.query({
    sql: 'UPDATE `admin` SET `password`=? WHERE `id`=?',
    values: [newPassword, id]
  }, function (err, result) {
    if (err) {
      return cb(err)
    }
    return cb(null, result.affectedRows)
  })
}

