'use strict'

var Promise = require('promise')
var logger = require('../common/logger')

var dbhelper = require('./dbhelper')
var busDAO = require('./bus')

exports.getOrderTickets = function (orderId, cb) {
  var sql = `SELECT T.* FROM v_ticket as T
              INNER JOIN \`order\` as O ON T.order_id=O.id
              WHERE O.id=?`
  dbhelper.query({ sql: sql, values: [orderId] }, function (err, tickets, fields) {
    if (err) {
      return cb(err)
    }

    tickets = tickets.map(function (item) {
      var ticket = convert(item)
      return ticket
    })
    return cb(null, tickets)
  })
}

exports.getUserTickets = function (userId, cb) {
  var sql = `SELECT T.* FROM v_ticket as T
              WHERE \`O.user_id\`=? AND (\`O.status\`=1 OR \`O.status\`=3)` // 已支付订单、或者已预订，未支付订单
  dbhelper.query({ sql: sql, values: [userId] }, function (err, tickets, fields) {
    if (err) {
      return cb(err)
    }

    tickets = tickets.map(function (item) {
      var ticket = convert(item)
      return ticket
    })
    return cb(null, tickets)
  })
}

exports.getUserBatchTickets = function (userId, batchId, cb) {
  var sql = `SELECT T.* FROM v_ticket as T
              WHERE T.status<>3 AND (\`O.status\`=1 OR \`O.status\`=3) AND \`O.user_id\`=? AND \`DD.batch_id\`=?` // 已支付或已预订订单，不包括已退票订单
  dbhelper.query({
    sql: sql,
    values: [userId, batchId]
  }, function (err, tickets, fields) {
    if (err) {
      return cb(err)
    }

    tickets = tickets.map(function (item) {
      var ticket = convert(item)
      return ticket
    })
    return cb(null, tickets)
  })
}

exports.getTicket = function (id, cb) {
  var sql = 'SELECT * FROM `v_ticket` WHERE id=?'
  dbhelper.query({ sql: sql, values: [id] }, function (err, results, fields) {
    if (err) {
      return cb(err)
    }

    var ticket
    if (results.length) {
      var item = results.shift()
      ticket = convert(item)
    }
    if (ticket && ticket.take_bus_id) {
      busDAO.getBus(ticket.take_bus_id, function (err, bus) {
        if (err) {
          // ignored
        }
        ticket.take_bus = bus
        return cb(null, ticket)
      })
    } else {
      return cb(null, ticket)
    }
  })
}

function convert (item) {
  var now = new Date()
  var dispatchDate = new Date(item['DD.start_time'])
  var isUseDay = (now.toLocaleDateString() === dispatchDate.toLocaleDateString())

  var canReturn = false
  if (item.is_pre_order[0] === 1) {
    canReturn = (item.pre_order_status === 0) // 未成团时才能退
  } else {
    if (item['S.is_pre_order'] === 1) {
      canReturn = false // 团购车次一律不能退票
    } else {
      var batchEndOrderTime = new Date(item['DB.end_order_time'])
      if (batchEndOrderTime.toString() !== 'Invalid Date') {
        canReturn = (now < batchEndOrderTime)
      }
    }
  }
  return {
    id: item.id,
    serial_no: item.serial_no,
    order_id: item.order_id,
    batch_id: item.batch_id,
    price: item.price,
    is_pre_order: !!item.is_pre_order[0],
    pre_order_status: item.pre_order_status,
    status: item.status,
    description: item.description,
    create_time: item.create_time,
    take_bus_id: item.take_bus_id,
    check_time: item.check_time,
    isUseDay: isUseDay,
    return_time: item.return_time,
    canReturn: canReturn,
    order: {
      id: item.order_id,
      user_id: item['O.user_id'],
      status: item['O.status'],
      create_time: item['O.create_time']
    },
    schedule: {
      id: item['S.id'],
      bus_line: {
        id: item['BL.id'],
        type: item['BL.type'],
        name: item['BL.name'],
        start_station: {
          id: item['SS.id'],
          name: item['SS.name']
        },
        terminal_station: {
          id: item['TS.id'],
          name: item['TS.name']
        }
      },
      begin_time: item['S.begin_time'],
      end_time: item['S.end_time'],
      price: item['S.price'],
      full_price: item['S.full_price'],
      is_pre_order: item['S.is_pre_order'],
      limit_count: item['S.limit_count'],
      company: {
        id: item['C.id'],
        name: item['C.name']
      }
    },
    dispatch: {
      id: item['DD.id'],
      batch_id: item['DD.batch_id'],
      batch: {
        id: item['DD.batch_id'],
        start_order_time: item['DB.start_order_time'],
        end_order_time: item['DB.end_order_time']
      },
      schedule_id: item['DD.schedule_id'],
      start_time: item['DD.start_time'],
      seat_count: item['DD.seat_count']
    }
  }
}

exports.updateExpiredTickts = function (cb) {
  var sql = 'UPDATE ticket T1' +
             ' INNER JOIN v_ticket T2 ON T1.id=T2.id' +
             ' SET T1.status=2' +
             ' WHERE ((T2.is_pre_order=0 AND T2.status=0) OR (T2.is_pre_order=1 AND T2.pre_order_status=1 AND T2.status=0))' +
             ' AND T2.`O.status`=1' +
             ' AND date_format(date_add(T2.`DD.start_time`, interval 1 day), \'%y/%m/%d\')<=date_format(now(), \'%y/%m/%d\')'
  dbhelper.query(sql, function (err, result) {
    if (err) {
      logger.error('failed to update expired tickets.', err)
    }
    return cb(err, result.affectedRows)
  })
}

exports.getTicketSaleInfo = function (dispatchDetailId, cb) {
  var sql = `SELECT T.dispatch_detail_id,SUM(IFNULL(T.count,0)) as sold_count FROM ticket as T  
              INNER JOIN \`order\` as O ON T.order_id=O.id 
              WHERE T.dispatch_detail_id=? AND (T.status=0 OR (T.is_pre_order=1 AND T.pre_order_status=0)) AND (O.status=1 OR O.status=0) 
              GROUP BY T.dispatch_detail_id`  // 已下单未支付、已支付的订单票数
  dbhelper.query({
    sql: sql,
    values: [dispatchDetailId]
  }, function (err, results, fields) {
    if (err) {
      return cb(err)
    }
    var saleInfo = results.shift()
    if (!saleInfo) {
      saleInfo = {
        dispatch_detail_id: dispatchDetailId,
        sold_count: 0
      }
    }
    return cb(null, saleInfo)
  })
}

exports.checkTicket = function (id, busId, cb) {
  dbhelper.query({
    sql: 'UPDATE `ticket` SET status=1,check_time=now(),take_bus_id=? WHERE id=? AND status=0',
    values: [busId, id]
  }, function (err, result) {
    if (err) {
      return cb(err)
    }
    return cb(null, result.affectedRows)
  })
}

exports.returnTicketToBalance = function (ticket, cb) {
  dbhelper.beginTransaction(function (err, connection, commit, rollback) {
    if (err) {
      return rollback(() => cb(err))
    }

    Promise.all([
      new Promise(function (resolve, reject) {
        connection.query({
          sql: 'UPDATE `ticket` SET status=3,' + (ticket.is_pre_order ? 'pre_order_status=3,' : '') + 'return_time=now() WHERE id=? AND (status=0 || status=2)',  // 未使用、已过期
          values: [ticket.id]
        }, function (err, result) {
          if (err) {
            return reject(err.message)
          }
          return resolve(result.affectedRows)
        })
      }),
      new Promise(function (resolve, reject) {
        connection.query({
          sql: 'UPDATE `order_payment` SET status=4,last_update_time=now() WHERE order_id=? AND (status=1)',
          values: [ticket.order_id]
        }, function (err, result) {
          if (err) {
            return reject(err.message)
          }
          return resolve(result.affectedRows)
        })
      }),
      new Promise(function (resolve, reject) {
        connection.query({
          sql: 'UPDATE `user` SET balance=(balance+?) WHERE id=?',
          values: [ticket.price, ticket.order.user_id]
        }, function (err, result) {
          if (err) {
            return reject(err.message)
          }
          return resolve(result.affectedRows)
        })
      })
    ]).then(function (values) {
      return commit(() => cb(null, {code: 0}, ticket))
    }).catch(function (reason) {
      return rollback(() => cb(new Error(reason)))
    })
  })
}

exports.getBatchTicketCount = function (batchId, cb) {
  var sql = `SELECT COUNT(1) as count FROM v_ticket as T
              WHERE \`O.status\`=1 AND \`DD.batch_id\`=?`
  dbhelper.query({
    sql: sql,
    values: [batchId]
  }, function (err, rows) {
    if (err) {
      return cb(err)
    }
    return cb(null, rows[0].count)
  })
}

exports.getDispatchTicketCount = function (dispatchId, status, cb) {
  cb = arguments[arguments.length - 1]
  var options = {
    sql: 'SELECT COUNT(1) as count FROM `ticket` WHERE dispatch_detail_id=?',
    values: [dispatchId]
  }
  if (typeof status === 'number') {
    options.sql += ' AND status=?'
    options.values.push(status)
  }
  dbhelper.query(options, function (err, rows) {
    if (err) {
      return cb(err)
    }
    return cb(null, rows[0].count)
  })
}

exports.getDispatchCheckedTicketCount = function (dispatchId, takeBusId, cb) {
  cb = arguments[arguments.length - 1]
  var options = {
    sql: 'SELECT COUNT(1) as count FROM `ticket` WHERE dispatch_detail_id=?',
    values: [dispatchId]
  }
  if (typeof takeBusId === 'string') {
    options.sql += ' AND take_bus_id=?'
    options.values.push(takeBusId)
  }
  dbhelper.query(options, function (err, rows) {
    if (err) {
      return cb(err)
    }
    return cb(null, rows[0].count)
  })
}

exports.getBusCheckedTicketCount = function (takeBusId, checkDate, cb) {
  cb = arguments[arguments.length - 1]
  var options = {
    sql: 'SELECT COUNT(1) as count FROM `ticket` WHERE take_bus_id=?',
    values: [takeBusId]
  }
  if (typeof checkDate !== 'function') {
    options.sql += ' AND date_format(`check_time`, \'%y/%m/%d\')=date_format(?, \'%y/%m/%d\')'
    options.values.push(checkDate)
  }
  dbhelper.query(options, function (err, rows) {
    if (err) {
      return cb(err)
    }
    return cb(null, rows[0].count)
  })
}

exports.getCheckedStatistics = function (dispatchDate, companyId, cb) {
  var sql = 'SELECT `C.id`, `C.name`, `DD.id`, `DD.batch_id`, `DD.schedule_id`, `DD.start_time`, `DD.seat_count`,' +
              '`S.id`, `S.bus_line_id`, `S.begin_time`, `S.end_time`, `BL.id`, `BL.type`, `BL.name`,' +
              'B.id as `B.id`, B.name as `B.name`, B.license_plate as `B.license_plate`, count(1) as checkedCount FROM v_ticket AS VT' +
              ' INNER JOIN bus AS B ON VT.`C.id`=B.company_id AND VT.`take_bus_id`=B.id' +
              ' WHERE VT.status=1'
  var values = []
  if (dispatchDate) {
    sql += ' AND date_format(`DD.start_time`, \'%y/%m/%d\')=date_format(?, \'%y/%m/%d\')'
    values.push(dispatchDate)
  }
  if (companyId) {
    sql += ' AND B.company_id=?'
    values.push(companyId)
  }
  sql += ' GROUP BY VT.`S.id`, VT.`take_bus_id` ORDER BY VT.`take_bus_id`'
  dbhelper.query({ sql, values }, function (err, rows) {
    if (err) {
      return cb(err)
    }
    var statistics = []
    rows.forEach(item => {
      var dispatchId = item['DD.id']
      var temp = statistics.filter(s => s.id === dispatchId).shift()
      if (temp) {
        temp.buses.push({
          id: item['B.id'],
          name: item['B.name'],
          license_plate: item['B.license_plate'],
          checkedCount: item.checkedCount
        })
      } else {
        statistics.push({
          id: dispatchId,
          batch_id: item['DD.batch_id'],
          start_time: item['DD.start_time'],
          seat_count: item['DD.seat_count'],
          schedule_id: item['DD.schedule_id'],
          schedule: {
            id: item['S.id'],
            bus_line: {
              id: item['BL.id'],
              type: item['BL.type'],
              name: item['BL.name']
            },
            begin_time: item['S.begin_time'],
            end_time: item['S.end_time'],
            company: {
              id: item['C.id'],
              name: item['C.name']
            }
          },
          buses: [{
            id: item['B.id'],
            name: item['B.name'],
            license_plate: item['B.license_plate'],
            checkedCount: item.checkedCount
          }]
        })
      }
    })
    return cb(null, statistics)
  })
}

exports.getBusCheckedStatistics = function (dispatchDate, companyId, cb) {
  var sql = 'SELECT `C.id`, `C.name`,' +
              'B.id as `B.id`, B.name as `B.name`, B.license_plate as `B.license_plate`, count(1) as checkedCount FROM v_ticket AS VT' +
              ' INNER JOIN bus AS B ON VT.`C.id`=B.company_id AND VT.`take_bus_id`=B.id' +
              ' WHERE VT.status=1'
  var values = []
  if (dispatchDate) {
    sql += ' AND date_format(`DD.start_time`, \'%y/%m/%d\')=date_format(?, \'%y/%m/%d\')'
    values.push(dispatchDate)
  }
  if (companyId) {
    sql += ' AND B.company_id=?'
    values.push(companyId)
  }
  sql += ' GROUP BY VT.`take_bus_id` ORDER BY VT.`take_bus_id`'
  dbhelper.query({ sql, values }, function (err, rows) {
    if (err) {
      return cb(err)
    }
    var statistics = []
    rows.forEach(item => {
      var id = item['C.id'] // 按公司分组
      var temp = statistics.filter(s => s.id === id).shift()
      if (temp) {
        temp.buses.push({
          id: item['B.id'],
          name: item['B.name'],
          license_plate: item['B.license_plate'],
          checkedCount: item.checkedCount
        })
      } else {
        statistics.push({
          id: id,
          name: item['C.name'],
          buses: [{
            id: item['B.id'],
            name: item['B.name'],
            license_plate: item['B.license_plate'],
            checkedCount: item.checkedCount
          }]
        })
      }
    })
    return cb(null, statistics)
  })
}

exports.getDispatchTickets = function (dispatchId, cb) {
  var sql = 'SELECT * FROM `v_ticket` WHERE dispatch_detail_id=?'
  dbhelper.query({ sql: sql, values: [dispatchId] }, function (err, tickets, fields) {
    if (err) {
      return cb(err)
    }

    tickets = tickets.map(function (item) {
      var ticket = convert(item)
      return ticket
    })
    return cb(null, tickets)
  })
}

