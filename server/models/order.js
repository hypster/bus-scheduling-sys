'use strict'

var dbhelper = require('./dbhelper')
var uuid = require('uuid')
var Promise = require('promise')
var util = require('../common/utilities')
var settings = require('../app.settings')

/**
 * 将超过 settings.orderPayTimeout 仍未支付的订单，设为已超时：释放余票
 */
exports.releaseTimeoutOrder = function (cb) {
  if (!cb) {
    cb = function () {}
  }
  dbhelper.beginTransaction(function (err, connection, commit, rollback) {
    if (err) {
      return rollback(() => cb(err))
    }
    connection.query({
      sql: 'SELECT * FROM `order` WHERE status=0 AND now()>DATE_ADD(create_time, INTERVAL ? MINUTE)',
      values: [settings.orderPayTimeout]
    }, function (err, timedoutOrders) {
      if (err) {
        return rollback(() => cb(err))
      }

      var affectedRows = 0
      if (!timedoutOrders.length) {
        return rollback(() => cb(null, affectedRows))
      }

      var counter = 0
      timedoutOrders.forEach(function (item) {
        cancelOrderInternal(item.id, 2, connection, function (err, row) { // status=2:超时订单
          if (err) {
            return rollback(() => cb(err))
          }
          counter++
          affectedRows += row
          if (counter === timedoutOrders.length) {
            return commit(() => cb(null, affectedRows))
          }
        })
      })
    })
  })
}

exports.newOrder = function (order, tickets, cb) {
  if (!tickets.length) {
    return cb(new Error('must provide tickets.'))
  }

  order.id = uuid.v1()
  dbhelper.beginTransaction(function (err, connection, commit, rollback) {
    if (err) {
      return rollback(() => cb(err))
    }

    var counter = 0
    tickets.forEach(function (item) {
      item.id = uuid.v1()
      item.serial_no = util.generateSerialNo()
      item.order_id = order.id

      // 检查余票
      connection.query({
        sql: 'SELECT * FROM v_dispatch_saleinfo WHERE id=?',
        values: [item.dispatch_detail_id]
      }, function (err, results) {
        if (err) {
          return rollback(() => cb(err))
        }

        var saleinfo = results.shift()
        if (!saleinfo) {
          return rollback(() => cb(null, {code: -1, message: '车次数据有误'}))
        } else if (item.is_full_price) {
          if (saleinfo.full_price_sold_count >= saleinfo.full_price_seat_count) {
            return rollback(() => cb(null, {code: -3, message: '临时票不足'}))
          }
        } else if (saleinfo.sold_count >= saleinfo.seat_count) {
          return rollback(() => cb(null, {code: -2, message: '余票不足'}))
        }
        connection.query('INSERT INTO `ticket` SET ?', item, function (err, newTicket) {
          if (err) {
            return rollback(() => cb(err))
          }

          counter++
          if (counter === tickets.length) {
            connection.query('INSERT INTO `order` SET ?', order, function (err, newOrder) {
              if (err) {
                return rollback(() => cb(err))
              }
              return commit(() => cb(null, 1, order, tickets, saleinfo))
            })
          }
        })
      })
    })
  })
}

/**
 * 取消用户所有未支付的订单
 */
exports.cancelUserUnpayOrders = function (userId, cb) {
  dbhelper.beginTransaction(function (err, connection, commit, rollback) {
    if (err) {
      return rollback(() => cb(err))
    }
    connection.query({
      sql: 'SELECT * FROM `order` WHERE user_id=? AND status=0',
      values: [userId]
    }, function (err, unpayOrders) {
      if (err) {
        return rollback(() => cb(err))
      }

      var affectedRows = 0
      if (!unpayOrders.length) {
        return rollback(() => cb(null, affectedRows))
      }

      var counter = 0
      unpayOrders.forEach(function (item) {
        cancelOrderInternal(item.id, 9, connection, function (err, row) { // status=9:取消订单
          if (err) {
            return rollback(() => cb(err))
          }
          counter++
          affectedRows += row
          if (counter === unpayOrders.length) {
            return commit(() => cb(null, affectedRows))
          }
        })
      })
    })
  })
}
function cancelOrderInternal (id, newStatus, connection, cb) {
  connection.query({
    sql: 'SELECT * FROM order_payment WHERE order_id=? AND type=0 AND status=1 AND amount is not null',
    values: [id]
  }, function (err, payments) {
    if (err) {
      return cb(err)
    }
    var sql = 'UPDATE `order` SET status=? WHERE id=? AND status=0'
    if (payments.length) {  // 如果有余额支付记录，则退至用户余额
      sql = 'UPDATE `order` O' +
            ' INNER JOIN `order_payment` OP ON O.id=OP.order_id' +
            ' INNER JOIN `user` U ON O.user_id=U.id' +
            ' SET O.status=?, OP.status=4, U.balance=(U.balance+OP.amount)' +
            ' WHERE (O.id=? AND O.status=0) AND (OP.type=0 AND OP.status=1 AND amount is not null)'
    }
    connection.query({
      sql: sql,  // 只能取消未支付的订单
      values: [newStatus, id]
    }, function (err, result) {
      if (err) {
        return cb(err)
      }
      return cb(err, result.affectedRows)
    })
  })
}
exports.cancelOrder = function (id, cb) {
  dbhelper.beginTransaction(function (err, connection, commit, rollback) {
    if (err) {
      return rollback(() => cb(err))
    }
    return cancelOrderInternal(id, 9, connection, function (err, affectedRows) {
      return commit(() => cb(err, affectedRows))
    }) // status=9:取消订单
  })
}

exports.getOrder = function (id, cb) {
  dbhelper.query({
    sql: 'SELECT * FROM `order` WHERE id=?',
    values: [id]
  }, function (err, results) {
    if (err) {
      return cb(err)
    }
    return cb(null, results.shift())
  })
}

exports.payOrder = function (order, orderPayment, cb) {
  if (!orderPayment.id) {
    orderPayment.id = uuid.v1()
  }
  dbhelper.beginTransaction(function (err, connection, commit, rollback) {
    if (err) {
      return rollback(() => cb(err))
    }
    Promise.all([new Promise(function (resolve, reject) {
      connection.query('INSERT INTO `order_payment` SET ?', orderPayment, function (err, result) {
        if (err) {
          return reject(err.message)
        }
        return resolve(result)
      })
    }), new Promise(function (resolve, reject) {
      if (orderPayment.status !== 1) {  // 未支付成功
        return resolve(null)
      } else {
        connection.query({
          sql: 'UPDATE `order` SET status=1 WHERE id=?',
          values: [order.id]
        }, function (err, result) {
          if (err) {
            return reject(err.message)
          }
          return resolve(result)
        })
      }
    })]).then(function (values) {
      return commit(() => cb(null, {code: 0}, orderPayment))
    }).catch(function (reason) {
      return rollback(() => cb(new Error(reason)))
    })
  })
}
exports.payOrderWithBalance = function (order, orderPayment, cb) {
  if (!orderPayment.id) {
    orderPayment.id = uuid.v1()
  }
  dbhelper.beginTransaction(function (err, connection, commit, rollback) {
    if (err) {
      return rollback(() => cb(err))
    }
    connection.query({
      sql: 'SELECT * FROM `user` WHERE id=?',
      values: [order.user_id]
    }, function (err, results) {
      if (err) {
        return rollback(() => cb(err))
      }
      var user = results.shift()
      if (user.balance < orderPayment.amount) {
        return rollback(() => cb(null, {code: -1, message: '余额不足，请选择其他支付方式'}))
      }
      orderPayment.status = 1 // 支付成功状态
      Promise.all([new Promise(function (resolve, reject) {
        connection.query({
          sql: 'UPDATE `user` SET balance=(balance-?) WHERE id=?',
          values: [orderPayment.amount, order.user_id]
        }, function (err, result) {
          if (err) {
            return reject(err.message)
          }
          return resolve(result)
        })
      }), new Promise(function (resolve, reject) {
        connection.query('INSERT INTO `order_payment` SET ?', orderPayment, function (err, result) {
          if (err) {
            return reject(err.message)
          }
          return resolve(result)
        })
      }), new Promise(function (resolve, reject) {
        connection.query({
          sql: 'UPDATE `order` SET status=1 WHERE id=?',
          values: [order.id]
        }, function (err, result) {
          if (err) {
            return reject(err.message)
          }
          return resolve(result)
        })
      })]).then(function (values) {
        return commit(() => cb(null, {code: 0}, orderPayment))
      }).catch(function (reason) {
        return rollback(() => cb(new Error(reason)))
      })
    })
  })
}
exports.tryBalancePay = function (order, cb) {
  var orderPayment = {
    id: uuid.v1(),
    type: 0, // 余额支付
    amount: order.total,
    order_id: order.id,
    status: 0,
    create_time: new Date()
  }
  dbhelper.beginTransaction(function (err, connection, commit, rollback) {
    if (err) {
      return rollback(() => cb(err))
    }
    connection.query({
      sql: 'SELECT * FROM `user` WHERE id=?',
      values: [order.user_id]
    }, function (err, results) {
      if (err) {
        return rollback(() => cb(err))
      }
      var user = results.shift()
      if (user.balance <= 0) {
        return rollback(() => cb(null, order.total, null))
      }
      var margin = 0
      orderPayment.amount = Math.min(user.balance, order.total)
      if (user.balance < order.total) {
        margin = Number(order.total - user.balance).toFixed(2)
      }
      orderPayment.status = 1 // 支付成功状态
      Promise.all([new Promise(function (resolve, reject) {
        connection.query({
          sql: 'UPDATE `user` SET balance=(balance-?) WHERE id=?',
          values: [orderPayment.amount, order.user_id]
        }, function (err, result) {
          if (err) {
            return reject(err.message)
          }
          return resolve(result)
        })
      }), new Promise(function (resolve, reject) {
        connection.query('INSERT INTO `order_payment` SET ?', orderPayment, function (err, result) {
          if (err) {
            return reject(err.message)
          }
          if (margin === 0) {
            connection.query({
              sql: 'UPDATE `order` SET status=1 WHERE id=?',
              values: [order.id]
            }, function (err, result) {
              if (err) {
                return reject(err.message)
              }
              return resolve(result)
            })
          } else {
            return resolve(result)
          }
        })
      })]).then(function (values) {
        return commit(() => cb(null, margin, orderPayment))
      }).catch(function (reason) {
        return rollback(() => cb(new Error(reason)))
      })
    })
  })
}
exports.getOrderPayments = function (orderId, cb) {
  dbhelper.query({
    sql: 'SELECT * FROM `order_payment` WHERE order_id=? ORDER BY create_time DESC',
    values: [orderId]
  }, function (err, payments) {
    if (err) {
      return cb(err)
    }
    return cb(null, payments)
  })
}

exports.getStatistics = function (data, cb) {
  var where = ''
  var sqlData = dbhelper.selectFormat(data)
  where = sqlData.where
  where = where.replace('where isDel=0', '')
  console.log(where)
  var sql = `select companyId,companyName,count(corp_user_id) as count,sum(total) as money  from v_order where status = 1 AND Tstatus=1 ${where} group by companyId `
  dbhelper.queryParams(sql, sqlData.Params, function (err, data, fields) {
    if (err) {
      return cb(err)
    }
    return cb(null, data)
  })
}

exports.updatePayStatus = function (orderId, paymentId, newStatus, apiResponse, cb) {
  dbhelper.beginTransaction(function (err, connection, commit, rollback) {
    if (err) {
      return rollback(() => cb(err))
    }
    Promise.all([new Promise(function (resolve, reject) {
      connection.query({
        sql: 'UPDATE `order_payment` SET status=?, api_response=?, last_update_time=now() WHERE id=?',  // 仅允许从 正在支付 状态更新到 其他状态
        values: [newStatus, apiResponse, paymentId, newStatus]
      }, function (err, result) {
        if (err) {
          return reject(err.message)
        }
        return resolve(result)
      })
    }), new Promise(function (resolve, reject) {
      if (newStatus !== 1) {  // 未支付成功
        return resolve(null)
      } else {
        connection.query({
          sql: 'UPDATE `order` SET status=1 WHERE id=?',
          values: [orderId]
        }, function (err, result) {
          if (err) {
            return reject(err.message)
          }
          return resolve(result)
        })
      }
    })]).then(function (values) {
      return commit(() => cb(null, {code: 0}))
    }).catch(function (reason) {
      return rollback(() => cb(new Error(reason)))
    })
  })
}
