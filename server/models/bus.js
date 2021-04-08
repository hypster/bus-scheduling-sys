'use strict'

var dbhelper = require('./dbhelper')

exports.getBus = function (id, cb) {
  dbhelper.query({
    sql: 'SELECT * FROM `bus` WHERE `id`=?',
    values: [id]
  }, function (err, buses) {
    if (err) {
      return cb(err)
    }
    return cb(null, buses[0])
  })
}

exports.getBuses = function (companyId, cb) {
  dbhelper.query({
    sql: 'SELECT * FROM `bus` WHERE `company_id`=?',
    values: [companyId]
  }, function (err, buses) {
    if (err) {
      return cb(err)
    }
    return cb(null, buses)
  })
}

exports.batchAdd = function (buses, cb) {
  var sql = 'INSERT INTO `bus` (`id`,`company_id`,`name`,`seat_count`,`license_plate`,`description`,`create_time`,`serial_no`,`buscol`,`isDel`) VALUES '
  buses.forEach((b, index) => {
    sql += ` (uuid(), '${b.company_id}', '${b.name}', ${b.seat_count}, '${b.license_plate}', '${b.description}', now(), '${b.serial_no}', null, 0)`
    if (index < (buses.length - 1)) {
      sql += ','
    }
  })
  dbhelper.query(sql, function (err, result) {
    return cb(err, result.affectedRows)
  })
}

exports.getByLicensePlate = function (licensePlate, cb) {
  dbhelper.query({
    sql: 'SELECT B.*,C.name as \'C.name\' FROM `bus` as B INNER JOIN `company` as C ON B.company_id=C.id WHERE B.license_plate=?',
    values: [licensePlate]
  }, function (err, results) {
    if (err) {
      return cb(err)
    }
    var bus
    if (results.length) {
      var item = results.shift()
      bus = {
        id: item.id,
        name: item.name,
        seat_count: item.seat_count,
        license_plate: item.license_plate,
        description: item.description,
        create_time: item.create_time,
        company: {
          id: item.company_id,
          name: item['C.name']
        }
      }
    }
    return cb(null, bus)
  })
}

exports.isLicense_plate = function (license_plate, cb) {
  console.log(cb)
  dbhelper.query(`SELECT * FROM bus where license_plate='${license_plate}' and isDel=0 `, function (err, data, fields) {
    if (err) {
      return cb(err)
    }
    cb(data)
  })
}
