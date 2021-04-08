'use strict'

var logger = require('../common/logger')
var ModelsDAO = require('../models/dbCommon')

exports.getAll = function (req, res, cb) {
  ModelsDAO.getAll(req.params.tbName, req.body.data, function (err, data) {
    if (err) {
      logger.error('failed to get company. url: ' + req.url, err)
      return res.fail(-99, '获取数据失败')
    }
    let resData = {
      rows: data
    }
    cb(resData)
  })
}

exports.getPage = function (req, res, cb) {
  ModelsDAO.getPage(req.params.tbName, req.body.data, function (err, data, Count) {
    if (err) {
      logger.error('failed to get company. url: ' + req.url, err)
      return res.fail(-99, '获取数据失败')
    }
    let resData = {
      rows: data,
      count: Count
    }
    cb(resData)
  })
}

exports.getModels = function (req, res, cb) {
  ModelsDAO.getModels(req.params.tbName, req.body.id, function (err, data) {
    if (err) {
      logger.error('failed to get company. url: ' + req.url, err)
      return res.fail(-99, '获取数据失败')
    }
    cb(data)
  })
}

exports.setDel = function (req, res, cb) {
  ModelsDAO.delete(req.params.tbName, req.body.id, function (err, data) {
    if (err) {
      logger.error('failed to get company. url: ' + req.url, err)
      return res.fail(-99, '获取数据失败')
    }
    cb(data)
  })
}

exports.setAdd = function (req, res, cb) {
  req.body.data['create_time'] = getNowFormatDate()
  req.body.data['isDel'] = '0'
  ModelsDAO.insert(req.params.tbName, req.body.data, function (err, data) {
    if (err) {
      logger.error('failed to get company. url: ' + req.url, err)
      return res.fail(-99, '获取数据失败')
    }
    cb(data)
  })
}

exports.setAddList = function (req, res, cb) {
  ModelsDAO.insertList(req.params.tbName, req.body.data, function (err, data) {
    if (err) {
      logger.error('failed to get company. url: ' + req.url, err)
      return res.fail(-99, '获取数据失败')
    }
    cb(data)
  })
}

exports.setEdit = function (req, res, cb) {
  ModelsDAO.update(req.params.tbName, req.body.data, function (err, data) {
    if (err) {
      logger.error('failed to get company. url: ' + req.url, err)
      return res.fail(-99, '获取数据失败')
    }
    cb(data)
  })
}

function getNowFormatDate () {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();
    return currentdate;
}

function getNowSerial_no () {
    var date = new Date();
    var seperator1 = "";
    var seperator2 = "";
    var month = date.getMonth() + 1;
    var mathsum = Math.floor(Math.random()*899)+100
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds()+mathsum;
    return currentdate;
}

exports.getNowFormatDate = getNowFormatDate
exports.getNowSerial_no = getNowSerial_no