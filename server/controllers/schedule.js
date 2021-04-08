'use strict'

var logger = require('../common/logger')
var scheduleDAO = require('../models/schedule')

exports.getActiveSchedules = function (req, res) {
  var lineId = req.params.lineId
  var companyId = req.query.companyId
  var startTime = req.query.startTime
  scheduleDAO.getActiveSchedules(lineId, companyId, startTime, function (err, schedules) {
    if (err) {
      logger.error('failed to getActiveSchedules. url: ' + req.url)
      return res.fail(-99, '获取班车列表数据失败')
    }
    return res.success(schedules)
  })
}

exports.getAll = function (req, res, cb) {
  cb(req, res, function (resData) {
    res.success(resData)
  })
}

exports.getPage = function (req, res, cb) {
  cb(req, res, function (resData) {
    res.success(resData)
  })
}

exports.getModels = function (req, res, cb) {
  cb(req, res, function (resData) {
    res.success(resData)
  })
}

exports.setDel = function (req, res, cb) {
  cb(req, res, function (resData) {
    res.success(resData)
  })
}

exports.setAdd = function (req, res, cb) {
  cb(req, res, function (resData) {
    res.success(resData)
  })
}

exports.setEdit = function (req, res, cb) {
  cb(req, res, function (resData) {
    res.success(resData)
  })
}