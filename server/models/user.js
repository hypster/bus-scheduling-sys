'use strict'

var uuid = require('uuid')

var dbhelper = require('./dbhelper')

exports.getUser = function (id, cb) {
  dbhelper.query({
    sql: 'SELECT * FROM `user` WHERE id=?',
    values: [id]
  }, function (err, results, fields) {
    if (err) {
      return cb(err)
    }
    return cb(null, results.shift())
  })
}
exports.saveUser = function (id, name, phone, campus, cb) {
  dbhelper.query({
    sql: 'UPDATE `user` SET name=?, phone=?, campus=? WHERE id=?',
    values: [name, phone, campus, id]
  }, function (err, result) {
    if (err) {
      return cb(err)
    }
    return cb(null, result.affectedRows)
  })
}

exports.getUserByCardId = function (cardId, cb) {
  dbhelper.query({
    sql: 'SELECT * FROM user WHERE corp_user_id=?',
    values: [cardId]
  }, function (err, results, fields) {
    if (err) {
      return cb(err)
    }
    return cb(null, results[0] || {})
  })
}

var processingCorpUserIds = []
exports.syncWechatUser = function (userDetail, cb) {
  dbhelper.getConnection(function (err, connection, release) {
    if (err) {
      return release(() => cb(err))
    }
    if (processingCorpUserIds.indexOf(userDetail.userid) > -1) {
      return release(() => cb(new Error('user in processing...')))
    } else {
      processingCorpUserIds.push(userDetail.userid)
    }
    connection.query({
      sql: 'SELECT * FROM user WHERE corp_user_id=? LIMIT 1',
      values: [userDetail.userid]
    }, function (err, users) {
      var handler = function (err, value) {
        processingCorpUserIds.splice(processingCorpUserIds.indexOf(userDetail.userid), 1)
        return release(() => cb(err, value))
      }
      if (err) {
        return handler(err)
      }
      var user = users.shift()
      if (user) { // 用户已存在，仅更新
        user.openid = userDetail.openid // 学生有可能换微信号
        user.name = userDetail.name
        user.phone = userDetail.mobile
        connection.query('UPDATE `user` SET corp_user_detail=?,openid=?,name=?,phone=? WHERE id=?',
          [JSON.stringify(userDetail), user.openid, user.name, user.phone, user.id], function (err, result) {
            if (err) {
              return handler(err)
            }
            return handler(err, user)
          })
      } else {  // 创建新用户
        user = {
          id: uuid.v1(),
          type: 1,  // 微信企业号成员
          corp_user_id: userDetail.userid,
          corp_user_detail: JSON.stringify(userDetail),
          openid: userDetail.openid,
          unionid: '',
          name: userDetail.name,
          phone: userDetail.mobile,
          campus: '',
          balance: 0,
          status: 0,
          create_time: new Date()
        }
        connection.query('INSERT INTO `user` SET ?', user, function (err, result) {
          return handler(err, user)
        })
      }
    })
  })
}
