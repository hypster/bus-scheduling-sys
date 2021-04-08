'use strict'

var appSettings = require('../app.settings')
var uuid = require('uuid')
var Promise = require('promise')
var dbhelper = require('./dbhelper')
var util = require('../common/utilities')

var ComBll = require('../controllers/dbCommon')
let ticketDAO = require('./ticket')

/**
 * 查询在售批次的班车列表
 *
 * @param {String} lineId 路线编号
 * @param {String} companyId 班车公司编号
 * @param {String} dispatchDate 派车时间（可选）
 * @param {Function} cb 查询完成回调函数
 */
exports.getActiveDispatches = function (lineId, companyId, dispatchDate, cb) {
  var sql = 'SELECT * FROM `v_dispatch`' +
              ' WHERE `BL.id`=?' +
              ' AND (`DB.isDel`=0 AND `DD.isDel`=0 AND `DB.status`=0' +
                ' AND (`DB.start_order_time`<>\'0000-00-00 00:00:00\' AND `DB.start_order_time`<=now())' +  // 已开启卖票（精确到时分秒）
                // 只判断开启卖票的时间，和批次结束时间 ' AND date_format(`DB.start_time`, \'%y/%m/%d\')<=date_format(now(), \'%y/%m/%d\')' + // 已开始
                ' AND date_format(`DB.end_time`, \'%y/%m/%d\')>=date_format(now(), \'%y/%m/%d\'))'  // 未结束

  var values = [lineId]
  if (companyId && companyId !== '00000000-0000-0000-0000-000000000000') {
    sql += ' AND `S.company_id`=?'
    values.push(companyId)
  }
  if (dispatchDate) {
    sql += ' AND date_format(`start_time`, \'%y/%m/%d\')=date_format(?, \'%y/%m/%d\')'
    values.push(dispatchDate)
  } else {
    sql += ' AND date_format(`start_time`, \'%y/%m/%d\')>=date_format(now(), \'%y/%m/%d\')'
  }
  sql += ' ORDER BY `DB.start_time`,`start_time`,`S.begin_time`'
  dbhelper.query({ sql: sql, values: values }, function (err, dispatches, fields) {
    if (err) {
      return cb(err)
    }

    dispatches = dispatches.map(function (item) {
      var dispatch = convert(item)
      return dispatch
    })

    return cb(null, dispatches)
  })
}

/**
 * 查询班车详细信息
 *
 * @param {String} id 派车明细编号
 * @param {Function} cb 查询完成回调函数
 */
exports.getDispatche = function (id, cb) {
  var sql = 'SELECT * FROM `v_dispatch`' +
              ' WHERE `id`=? LIMIT 1'
  dbhelper.query({
    sql: sql,
    values: [id]
  }, function (err, results, fields) {
    if (err) {
      return cb(err)
    }

    var dispatch = {}
    if (results.length) {
      var item = results.shift()
      dispatch = convert(item)
    }
    return cb(null, dispatch)
  })
}

function convert (item) {
  var now = new Date()
  var stopTime = item['S.begin_time']
  if (item['S.end_time'] !== '00:00:00') {
    stopTime = item['S.end_time']
  }
  var date = new Date(item.start_time)
  var time = new Date('1970-01-01T' + stopTime)
  var endDepartureTime = date.addMilliseconds(time.valueOf())

  var endOrderTime = new Date(item['DB.end_order_time'])
  var temp = new Date(endOrderTime.valueOf()).setHours(endOrderTime.getHours() + 24)
  var theSecondDay = new Date(new Date(temp).toDateString())    // 第二天凌晨开放购买临时票

  var departureTime = (new Date(item.start_time)).addMilliseconds((new Date('1970-01-01T' + item['S.begin_time'])).valueOf())
  item = {
    id: item.id,
    batch_id: item.batch_id,
    type: item.type,
    start_time: item.start_time,
    departure_time: departureTime,
    end_departure_time: endDepartureTime,
    openFullPrice: now > theSecondDay,
    stopOrder: (endDepartureTime - now < (appSettings.aheadOfDeparture * 60 * 1000)),
    use_full_price: !!item.use_full_price,
    full_price_seat_count: item.full_price_seat_count,
    seat_count: item.seat_count,
    full_price_sold_count: item.full_price_sold_count,
    sold_count: item.sold_count,
    pre_order_completed: item.pre_order_completed,
    pre_order_end_time: item.pre_order_end_time,
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
      company: {
        id: item['C.id'],
        name: item['C.name']
      },
      is_pre_order: item['S.is_pre_order'],
      limit_count: item['S.limit_count']
    }
  }
  // 计算团购截止时间
  if (item.schedule.is_pre_order && (!item.pre_order_end_time)) {
    let dayOfStartTime = (new Date(item.start_time)).getDay()
    let counter = 0
    if (appSettings.preOrderEndDayOfWeek === 0) { // 周日
      counter = (7 - dayOfStartTime)
    } else {
      counter = (appSettings.preOrderEndDayOfWeek - dayOfStartTime)
    }

    let tempEndDate = new Date(item.start_time.valueOf() + (counter * 24 * 60 * 60 * 1000))
    item.pre_order_end_time = new Date(`${tempEndDate.getFullYear()}-${tempEndDate.getMonth() + 1}-${tempEndDate.getDate()} ${appSettings.preOrderEndTime || '23:59:59'}`)
    if (!item.pre_order_completed && !item.stopOrder) {
      item.stopOrder = (item.pre_order_end_time < now)
    }
  }
  return item
}

exports.getTemplateBatch = function (cb) {
  dbhelper.query('SELECT * FROM dispatch_batch WHERE is_template=1 ORDER BY create_time DESC limit 1', function (err, batches) {
    if (err) {
      return cb(err)
    }
    return cb(null, batches.shift())
  })
}

exports.setTemplateBatch = function (id, cb) {
  dbhelper.beginTransaction(function (err, connection, commit, rollback) {
    if (err) {
      return rollback(() => cb(err))
    }

    connection.query('UPDATE dispatch_batch SET is_template=0', function (err, result) {
      if (err) {
        return rollback(() => cb(err))
      }
      connection.query('UPDATE dispatch_batch SET is_template=1 WHERE id=?', id, function (err, result) {
        if (err) {
          return rollback(() => cb(err))
        }
        return commit(() => cb(null, result.affectedRows))
      })
    })
  })
}

exports.cancelTemplateBatch = function (id, cb) {
  dbhelper.query({
    sql: 'UPDATE dispatch_batch SET is_template=0 WHERE id=?',
    values: [id]
  }, (err, result) => {
    if (err) {
      return cb(err)
    }
    return cb(null, result.affectedRows)
  })
}

exports.generateNextWeekDispatch = function (cb) {
  this.getTemplateBatch(function (err, templateBatch) {
    if (err) {
      return cb(err)
    }
    if (!templateBatch) {
      return cb(null, 0)
    }
    dbhelper.beginTransaction(function (err, connection, commit, rollback) {
      if (err) {
        return rollback(() => cb(err))
      }

      var intervalDays = 0
      var now = new Date()
      var dayOfNextWeek = now.getDay()
      var templateDayOfWeek = templateBatch.start_time.getDay()
      if (dayOfNextWeek <= templateDayOfWeek) { // 如果模板批次的开始时间是本周，跳过本周（避免重复）而生成下周批次
        intervalDays += 7
      }
      while (dayOfNextWeek !== templateDayOfWeek) {
        intervalDays++
        if (dayOfNextWeek < 6) {  // 0-6 (周日-周六)
          dayOfNextWeek++
        } else {
          dayOfNextWeek = 0
        }
      }

      var newStartTime = new Date(now.valueOf() + (intervalDays * 24 * 60 * 60 * 1000))
      newStartTime = new Date(newStartTime).setHours(templateBatch.start_time.getHours())
      newStartTime = new Date(newStartTime).setMinutes(templateBatch.start_time.getMinutes())
      newStartTime = new Date(newStartTime).setSeconds(templateBatch.start_time.getSeconds())

      var newBatch = Object.assign({}, templateBatch)
      newBatch.id = uuid.v1()
      newBatch.serial_no = util.generateSerialNo(3)
      newBatch.start_time = new Date(newStartTime)
      newBatch.end_time = new Date(newBatch.start_time.valueOf() + (templateBatch.end_time - templateBatch.start_time))
      newBatch.start_order_time = new Date(newBatch.start_time.valueOf() + (templateBatch.start_order_time - templateBatch.start_time))
      newBatch.end_order_time = new Date(newBatch.start_time.valueOf() + (templateBatch.end_order_time - templateBatch.start_time))
      newBatch.status = 0 // 默认开启购票
      newBatch.is_template = 0
      newBatch.status_update_time = null
      newBatch.create_time = now

      Promise.all([new Promise((resolve, reject) => {
        connection.query('INSERT INTO dispatch_batch SET ?', newBatch, function (err, result) {
          if (err) {
            return reject(err)
          }
          return resolve(result)
        })
      }), new Promise((resolve, reject) => {
        connection.query('SELECT * FROM dispatch_detail WHERE batch_id=?', templateBatch.id, function (err, dispatches) {
          if (err) {
            return reject(err)
          }

          // 避免生成重复的编号
          var serialNums = []
          var newDispatches = []
          dispatches.forEach(d => {
            var newItem = Object.assign({}, d)
            newItem.id = uuid.v1()
            newItem.batch_id = newBatch.id
            newItem.serial_no = util.generateSerialNo(3, serialNums)
            newItem.start_time = new Date(newBatch.start_time.valueOf() + (d.start_time - templateBatch.start_time))
            newItem.create_time = now
            newItem.pre_order_completed = 0
            if (d.pre_order_end_time) {
              newItem.pre_order_end_time = new Date(newBatch.start_time.valueOf() + (d.pre_order_end_time - templateBatch.start_time))
            }
            newDispatches.push(newItem)
          })

          if (!newDispatches.length) {
            return resolve()
          }
          var sql = 'INSERT INTO dispatch_detail (id, batch_id, schedule_id, type, start_time, seat_count, full_price_seat_count, create_time, serial_no, isDel, pre_order_completed, pre_order_end_time)'
          var values = ' VALUES '
          newDispatches.forEach(d => {
            values += `('${d.id}','${d.batch_id}','${d.schedule_id}',${d.type},'${util.dateToString(d.start_time)}',${d.seat_count},${d.full_price_seat_count},'${util.dateToString(d.create_time)}', '${d.serial_no}', ${d.isDel}, ${d.pre_order_completed}, '${d.pre_order_end_time}'),`
          })
          sql += values.replace(/,$/, '')
          connection.query(sql, function (err, result) {
            if (err) {
              return reject(err)
            }
            return resolve(result)
          })
        })
      })]).then(values => {
        var affectedRows = values.reduce((prev, curr) => {
          if (prev) {
            return prev + curr.affectedRows
          }
          return curr.affectedRows
        }, 0)
        return commit(() => cb(null, affectedRows))
      }).catch(reason => {
        return rollback(() => cb(reason))
      })
    })
  })
}

exports.countEdit = function (seat_count, batch_id, cb) {
  var sql = `UPDATE dispatch_detail SET seat_count = ${seat_count} where batch_id='${batch_id}'`
  dbhelper.query(sql, function (err, data, fields) {
    if (err) {
      return cb(err)
    }
    return cb(null, {Count:data.affectedRows})
  })
}

exports.disAll = function (id, cb) {
  var sql = `SELECT * FROM dispatch_batch where id <> '${id}' AND isDel=0`
  dbhelper.query(sql, function (err, data, fields) {
    if (err) {
      return cb(err)
    }
    return cb(null, data)
  })
}

exports.setCopyDetail = function (date, cb) {
  var where = ''
  for (let item of date.rows) {
    where += ' (batch_id = \'' + item.jbatch_id + '\' and date_format(start_time, \'%y/%m/%d\') = date_format(\'' + item.jstart_time + '\', \'%y/%m/%d\')) or'
  }
  where = dbhelper.lastStrDel('or', where)
  var sql = `select * from dispatch_detail where isDel=0 and (${where})`
  dbhelper.query(sql, function (err, data, fields) {
    if (err) {
      return cb(err)
    }
    return cb(null, data)
  })
}

exports.setCopyDetailAdd = function (data, copyData, cb) {
  var addData = {
    rows: []
  }
  for (let item of copyData) {
    item.start_time = dbhelper.dateFormat(item.start_time, 'yyyy-mm-dd hh:mm:ss')
    item.batch_id = data.rows[0].batch_id
  }

  // 避免生成重复的编号
  var serialNums = []
  for (var item of copyData) {
    for (var d of data.rows) {
      if (new Date(item.start_time).toDateString() == new Date(d.jstart_time).toDateString()) {
        var copyItem = JSON.stringify(item)
        copyItem = JSON.parse(copyItem)
        copyItem.start_time = d.start_time
        copyItem['serial_no'] = util.generateSerialNo(3, serialNums)
        copyItem.id = uuid.v1()
        addData.rows.push(copyItem)
      }
    }
  }
  var sqlData = dbhelper.addListFormat(addData)
  var sql = `INSERT into dispatch_detail (${sqlData.insert.set}) VALUES ${sqlData.insert.vals}`
  dbhelper.query(sql, function (err, data, fields) {
    if (err) {
      return cb(err)
    }
    return cb(null, {Count: data.affectedRows})
  })
}

exports.getNewModels = function (cb) {
  dbhelper.query(`SELECT * FROM dispatch_batch order by create_time desc limit 0,1 `, function (err, data, fields) {
    if (err) {
      return cb(err)
    }
    return cb(null, data[0] || {})
  })
}

exports.deleteDispatches = function (batchId, cb) {
  dbhelper.query({
    sql: 'UPDATE dispatch_detail SET isDel=1 WHERE batch_id=?',
    values: [batchId]
  }, function (err, result) {
    return cb(err, result)
  })
}

exports.getBatchDispatches = function (batchId, cb) {
  dbhelper.query({
    sql: 'SELECT * FROM v_Ddetail WHERE batch_id=?',
    values: [batchId]
  }, function (err, dispatches) {
    return cb(err, dispatches)
  })
}

exports.completePreOrder = function (dispatchId, cb) {
  dbhelper.beginTransaction((err, connection, commit, rollback) => {
    if (err) {
      return rollback(() => cb(err))
    }
    connection.query({
      sql: 'UPDATE `ticket` SET pre_order_status=1 WHERE dispatch_detail_id=? AND pre_order_status=0',
      values: [dispatchId]
    }, function (err, result) {
      if (err) {
        return rollback(() => cb(err))
      }
      connection.query({
        sql: 'UPDATE `dispatch_detail` SET pre_order_completed=1 WHERE id=?',
        values: [dispatchId]
      }, function (err, result) {
        if (err) {
          return rollback(() => cb(err))
        }
        return commit(() => cb(null, result.affectedRows))
      })
    })
  })
}

exports.expiredPreOrder = function (cb) {
  /**
   * 1. 将所有`ticket`设置成未成团`pre_order_status=2`
   * 2. 将`ticket`对应的`order_payment`状态设置成已退款`status=4`
   * 3. 给已预订`user`退款`balance+=price`
   * 4. 删除`dispatch_detail`，`isDel=1` [不能删除，以免后台数据显示有误]
   */
  dbhelper.beginTransaction((err, connection, commit, rollback) => {
    if (err) {
      return rollback(() => cb(err))
    }
    // 查询在售批次[未成团]的团购车次列表
    var sql = 'SELECT * FROM `v_dispatch`' +
              ' WHERE `S.is_pre_order`=1 AND pre_order_completed=0' + // 团购车次，并且未成团
                ' AND (`DB.isDel`=0 AND `DD.isDel`=0 AND `DB.status`=0' +
                ' AND (`DB.start_order_time`<>\'0000-00-00 00:00:00\' AND `DB.start_order_time`<=now())' +  // 已开启卖票（精确到时分秒）
                // 只判断开启卖票的时间，和批次结束时间 ' AND date_format(`DB.start_time`, \'%y/%m/%d\')<=date_format(now(), \'%y/%m/%d\')' + // 已开始
                ' AND date_format(`DB.end_time`, \'%y/%m/%d\')>=date_format(now(), \'%y/%m/%d\'))'  // 未结束
    sql += ' ORDER BY `DB.start_time`,`start_time`,`S.begin_time`'
    connection.query(sql, function (err, dispatches, fields) {
      if (err) {
        return rollback(() => cb(err))
      }

      let tasks = []
      dispatches.forEach((item) => {
        tasks.push(new Promise((resolve, reject) => {
          ticketDAO.getDispatchTickets(item.id, (err, tickets) => {
            if (err) {
              return reject(err)
            }
            let subTasks = []
            tickets.forEach(ticket => {
              subTasks.push(Promise.all([
                new Promise(function (resolve, reject) {
                  connection.query({
                    sql: 'UPDATE `ticket` SET status=3,pre_order_status=2,return_time=now() WHERE id=? AND (status=0 || status=2)',  // 未使用、已过期
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
                    if (!result.affectedRows) {
                      return resolve(result.affectedRows)
                    }
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
                })
              ]))
            })
            Promise.all(subTasks).then(values => {
              // connection.query({
              //   sql: 'UPDATE dispatch_detail SET isDel=1 WHERE id=?',
              //   values: [item.id]
              // }, function (err, result) {
              //   if (err) {
              //     return rollback(() => cb(err))
              //   }
              resolve((values.shift() || [0]).shift())
              // })
            }).catch(reason => {
              reject(reason)
            })
          })
        }))
      })

      Promise.all(tasks).then(values => {
        let affectedRows = values.reduce((prev, curr) => {
          return prev + curr
        }, 0)
        return commit(() => cb(null, affectedRows))
      }).catch(reason => {
        return rollback(() => cb(reason))
      })
    })
  })
}
