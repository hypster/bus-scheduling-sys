'use strict'

var dbhelper = require('./dbhelper')

exports.getAll = function (tbName, data, cb) {
  data = data || {
    order: 'create_time desc'
  }
  var sqlData = dbhelper.selectFormat(data)
  dbhelper.query(`SELECT * FROM ${tbName} ${sqlData.where} ${sqlData.order}`, function (err, data, fields) {
    if (err) {
      return cb(err)
    }
    return cb(null, data)
  })
}

exports.getPage = function (tbName, data, cb) {
  var sqlData = dbhelper.selectFormat(data)
  var sqlCount = `SELECT count(id) from ${tbName} ${sqlData.where}`
  var sqlStr = `SELECT * FROM ${tbName} ${sqlData.where} ${sqlData.order} ${sqlData.limitStr}`
  dbhelper.queryParams(sqlCount, sqlData.Params, function (err, Count, fields) {
    if (err) {
      return cb(err)
    }
    dbhelper.queryParams(sqlStr, sqlData.Params, function (err, data, fields) {
      if (err) {
        return cb(err)
      }
      return cb(null, data, Count[0]['count(id)'])
    })
  })
}

exports.getModels = function (tbName, id, cb) {
  dbhelper.query(`SELECT * FROM ${tbName} where id='${id}'`, function (err, data, fields) {
    if (err) {
      return cb(err)
    }
    return cb(null, data[0] || {})
  })
}

exports.delete = function (tbName, id, cb) {
  dbhelper.query(`UPDATE ${tbName} SET isDel=1 where id='${id}'`, function (err, data, fields) {
    if (err) {
      return cb(err)
    }
    return cb(null, {Count:data.affectedRows})
  })
}

exports.insert = function (tbName, data, cb) {
    var sqlData = dbhelper.sqlFormat(data)
    var sql = `INSERT into ${tbName} set ${sqlData.insert.set}`
  dbhelper.queryParams(sql, sqlData.Params , function (err, data, fields) {
    if (err) {
      return cb(err)
    }
    return cb(null, {Count:data.affectedRows, id:sqlData.insert.id})
  })
}

exports.insertList = function (tbName, data, cb) {
    var sqlData = dbhelper.addListFormat(data)
    var sql = `INSERT into ${tbName} (${sqlData.insert.set}) VALUES ${sqlData.insert.vals}` 
  dbhelper.query(sql , function (err, data, fields) {
    if (err) {
      return cb(err)
    }
    return cb(null, {Count:data.affectedRows})
  })
}

exports.update = function (tbName, data, cb) {
    var sqlData = dbhelper.sqlFormat(data)
    var sql = `UPDATE ${tbName} SET ${sqlData.update.set} where id='${data.id}'`
  dbhelper.queryParams(sql, sqlData.Params , function (err, data, fields) {
    if (err) {
      return cb(err)
    }
    console.log(data)
    return cb(null, {Count:data.affectedRows})
  })
}