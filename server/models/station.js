'use strict'

var dbhelper = require('./dbhelper')

exports.getStations = function (cb) {
  dbhelper.query('SELECT * FROM station WHERE isDel=0', function (err, data, fields) {
    if (err) {
      return cb(err)
    }
    return cb(null, data)
  })
}
