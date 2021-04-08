'use strict'

var dbhelper = require('./dbhelper')

exports.getBusLines = function (cb) {
  dbhelper.query('SELECT * FROM bus_line WHERE isDel=0', function (err, data, fields) {
    if (err) {
      return cb(err)
    }
    return cb(null, data)
  })
}


