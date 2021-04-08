'use strict'

var dbhelper = require('./dbhelper')

exports.getActiveSchedules = function (lineId, companyId, startTime, cb) {
  var sql = `SELECT S.* FROM schedule as S
              INNER JOIN bus_line as L ON S.bus_line_id=L.id
              INNER JOIN dispatch_detail AS DD ON S.id=DD.schedule_id
              INNER JOIN dispatch_batch AS DB ON DD.batch_id=DB.id 
              WHERE L.id=?`
  var values = [lineId]
  if (companyId) {
    sql += ' AND (S.company_id=?)'
    values.push(companyId)
  }
  if (startTime) {
    sql += ` AND (DB.start_time<=? AND DB.end_time>?)
             AND (DB.start_order_time<=? AND DB.end_order_time>?)`
    values.push(startTime)
  }
  sql += 'ORDER BY DD.start_time,S.begin_time'
  dbhelper.query({ sql: sql, values: values }, function (err, schedules, fields) {
    if (err) {
      return cb(err)
    }
    return cb(null, schedules)
  })
}

// exports.getSchedules = function (lineId, cb) {
//   var sql = `SELECT * FROM schedule WHERE bus_line_id='${lineId}'`
//   dbhelper.query()
// }