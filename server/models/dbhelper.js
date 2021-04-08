'use strict'

var gSettings = require('../../global.settings')

var uuid = require('uuid')
var mysql = require('mysql')
var pool = mysql.createPool({
  dev: {
    host: '10.10.243.30', // 10.10.243.30',
    // port: 3760,
    connectionLimit: 60,
    queueLimit: 5,
    user: 'root', // 'root',
    password: '654321', // '654321',
    database: 'campus_bus' // 'campus_bus'
  },
  test: {
    host: '57e1d54841ad2.sh.cdb.myqcloud.com',
    port: 3760,
    connectionLimit: 60,
    queueLimit: 5,
    user: 'devtest',
    password: 'dev@test!@#',
    database: 'devtest'
  },
  prod: {
    host: '10.66.100.5',  // 内网访问地址和端口
    port: 3306,
    connectionLimit: 600,
    queueLimit: 50,
    user: 'StuBus',
    password: 'ibK56b!0',
    database: 'StuBus'
  }
}[gSettings.env])

exports.getConnection = function (cb) {
  pool.getConnection(function (err, connection) {
    return cb(err, connection, function (releaseCallback) {
      connection.release()
      return releaseCallback()
    })
  })
}

exports.beginTransaction = function (cb) {
  pool.getConnection(function (err, connection) {
    if (err) {
      return cb(err)
    }
    connection.beginTransaction(function (err) {
      if (err) {
        connection.release()
        return cb(err)
      }

      return cb(null, connection, function (commitCallback) {
        return connection.commit(function (err) {
          if (err) {
            return connection.rollback(function () {
              connection.release()
              return commitCallback()
            })
          } else {
            connection.release()
            return commitCallback()
          }
        })
      }, function (rollbackCallback) {
        return connection.rollback(function () {
          connection.release()
          return rollbackCallback()
        })
      })
    })
  })
}

function lastStrDel(key, val) {
  let reg="/" + key + "$/gi"
  reg = eval(reg)
  return val.replace(reg, '')
}

function nTos (m) {
  return (m < 10) ? '0' + String(m) : String(m)
}

function dateFormat(val, key) {
  let d = new Date(val)
  if (key === 'yyyy-mm-dd hh:mm:ss') {
    var hours = d.getHours()
    if (hours < 10) {
      hours = '0' + hours
    }
    var minutes = d.getMinutes()
    if (minutes < 10) {
      minutes = '0' + minutes
    }
    var seconds = d.getSeconds()
    if (seconds < 10) {
      seconds = '0' + seconds
    }
    return d.getFullYear() + '-' + nTos(d.getMonth() + 1) + '-' + nTos(d.getDate()) + ' ' + hours + ':' + minutes + ':' + seconds
  }
}

exports.dateFormat = dateFormat
exports.lastStrDel = lastStrDel

exports.query = function (options, cb) {
  console.log(options)
  pool.query(options, function (err, rows, fields) {
    cb(err, rows, fields)
  })
}

exports.queryParams = function (sql, Params, cb) {
  console.log(sql)
  pool.query(sql, Params, function (err, rows, fields) {
    cb(err, rows, fields)
  })
}

var operator = {
  begin_time: ' >? ',
  end_time: ' <? ',
  start_time: ' >? ',
  start_order_time: ' >? ',
  end_order_time: ' <? ',
  name: ' like ?',
  description: 'like ?',
  start_create_time: ' >? ',
  end_create_time: ' <? ',
  start_detail_time:' >? ',
  end_detail_time:' <? ',
  start_check_time:' >? ',
  end_check_time:' <? '
}

var colName = {
  start_create_time: 'create_time',
  end_create_time: 'create_time',
  start_detail_time:'start_time',
  end_detail_time:'start_time',
  start_check_time: 'check_time',
  end_check_time: 'check_time'
}

exports.selectFormat = function (data) {
  let str = {
    order: data['order'] ? 'order by ' + data.order : ' order by create_time desc  ',
    limit: data.limit || '',
    offset: data.offset || '',
    where: ' where isDel=0 ',
    limitStr: '',
    Params: []
  }
  delete data['order']
  delete data['limit']
  delete data['offset']
  console.log(colName)
  for (let item in data) {
    var col = colName[item] || item
    str.where += ' and ' + (operator[item] ? col + operator[item] : col + '=?')
    if (item == 'name' || item == 'description') {
      str.Params.push('%' + data[item] + '%')
    } else {
      str.Params.push(data[item])
    }
  }
  if (str.where.length > 0) str.where = '  ' + str.where
  if (str.limit.toString().length > 0 && str.offset.toString().length > 0) str.limitStr = ' limit ' + (str.limit * str.offset) + ',' + str.limit
  return str
}

exports.sqlFormat = function (data) {
  let id = uuid.v1()
  let sqlForm = {
    insert: {
      id: id,
      set: 'id=\'' + id + '\','
    },
    update: {
      set: ''
    },
    Params: []
  }
  for (let item in data) {
    if (item !== 'id') {
      sqlForm.insert.set += (item + '=?,')
      sqlForm.update.set += (item + '=?,')
      sqlForm.Params.push(data[item])
    }
  }
  if (sqlForm.insert.set.length > 0) sqlForm.insert.set = lastStrDel(",", sqlForm.insert.set)
  if (sqlForm.update.set.length > 0) sqlForm.update.set = lastStrDel(",", sqlForm.update.set)
  return sqlForm
}

exports.addListFormat = function (data) {
  let sqlForm = {
    insert: {
      set: '',
      vals: ''
    }
  }
  for (let row in data.rows) {
    let val = ''
    for (let item in data.rows[row]) {
      if (row == 0) sqlForm.insert.set += (item + ',')
      val += '\'' + data.rows[row][item] + '\','
    }
    if (val.length > 0) val = lastStrDel(",", val)
    sqlForm.insert.vals += '(' + val + '),'
  }
  if (sqlForm.insert.set.length > 0) sqlForm.insert.set = lastStrDel(",", sqlForm.insert.set)
  if (sqlForm.insert.vals.length > 0) sqlForm.insert.vals = lastStrDel(",", sqlForm.insert.vals)
  return sqlForm
}


pool.on('connection', function (connection) {
  console.log(`new connection. \r\n
                this._acquiringConnections.length=${this._acquiringConnections.length}
                this._allConnections.length=${this._allConnections.length}
                this._freeConnections.length=${this._freeConnections.length}
                this._connectionQueue.length=${this._connectionQueue.length}`)
})

pool.on('enqueue', function () {
  console.log(`connection enqueue. \r\n
                this._acquiringConnections.length=${this._acquiringConnections.length} \r\n
                this._allConnections.length=${this._allConnections.length} \r\n
                this._freeConnections.length=${this._freeConnections.length} \r\n
                this._connectionQueue.length=${this._connectionQueue.length}`)
})

setInterval(function () {
  console.log(`pool connection status: \r\n
                pool._acquiringConnections.length=${pool._acquiringConnections.length} \r\n
                pool._allConnections.length=${pool._allConnections.length} \r\n
                pool._freeConnections.length=${pool._freeConnections.length} \r\n
                pool._connectionQueue.length=${pool._connectionQueue.length}`)
}, 10 * 60 * 1000)
