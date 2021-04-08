'use strict'

var dbhelper = require('./dbhelper')

exports.getCompanies = function (cb) {
  dbhelper.query('SELECT * FROM company WHERE isDel=0', function (err, data, fields) {
    if (err) {
      return cb(err)
    }
    return cb(null, data)
  })
}
