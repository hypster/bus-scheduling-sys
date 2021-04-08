'use strict'

var logger = require('../common/logger')

var ModelsDAO = require('../models/bus_line')

exports.getBusLines = function (req, res) {
  ModelsDAO.getBusLines(function (err, data) {
    if (err) {
      logger.error('failed to get bus lines. url: ' + req.url, err)
      return res.fail(-99, '获取数据失败')
    }
    return res.success(data)
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