'use strict'

var uuid = require('uuid')
var util = require('../common/utilities')

var logger = require('../common/logger')
var dispatchDAO = require('../models/dispatch')
var ticketDAO = require('../models/ticket')
var ComBll = require('./dbCommon')

exports.getActiveDispatches = function (req, res) {
  var lineId = req.params.lineId
  var companyId = req.query.companyId
  var dispatchDate = req.query.dispatchDate
  dispatchDAO.getActiveDispatches(lineId, companyId, dispatchDate, function (err, dispatches) {
    if (err) {
      logger.error('failed to getActiveDispatches. url: ' + req.url, err)
      return res.fail(-99, '获取班车批次列表数据失败')
    }
    return res.success(dispatches)
  })
}

exports.getDispatche = function (req, res) {
  var dispatchId = req.params.dispatchId
  dispatchDAO.getDispatche(dispatchId, function (err, dispatch) {
    if (err) {
      logger.error('failed to getDispatche. url: ' + req.url, err)
      return res.fail(-99, '获取班车详情失败')
    }
    return res.success(dispatch)
  })
}

exports.getTemplateBatch = function (req, res) {
  dispatchDAO.getTemplateBatch(function (err, batch) {
    if (err) {
      logger.error('failed to getTemplateBatch. url: ' + req.url, err)
      return res.fail(-99, '获取批次模板详情失败')
    }
    return res.success(batch)
  })
}

exports.countEdit = function (req, res) {
  dispatchDAO.countEdit(req.body.data.seat_count, req.body.data.batch_id, function (err, dispatch) {
    if (err) {
      logger.error('failed to getDispatche. url: ' + req.url)
      return res.fail(-99, '获取班车详情失败')
    }
    return res.success(dispatch)
  })
}

exports.disAll = function (req, res) {
  dispatchDAO.disAll(req.body.id, function (err, dispatch) {
    if (err) {
      logger.error('failed to getDispatche. url: ' + req.url)
      return res.fail(-99, '获取班车详情失败')
    }
    return res.success(dispatch)
  })
}

exports.setCopyDetail = function (req, res, cb) {
  dispatchDAO.setCopyDetail(req.body.data, function (err, dispatch) {
    if (err) {
      logger.error('failed to getDispatche. url: ' + req.url)
      return res.fail(-99, '获取班车详情失败')
    }
    if (!dispatch.length) {
      return res.success({Count: 0})
    }
    for (let item of dispatch) {
      item['id'] = uuid.v1()
      item['create_time'] = ComBll.getNowFormatDate()
      item['isDel'] = '0'
    }

    dispatchDAO.setCopyDetailAdd(req.body.data, dispatch, function (err, dispatch) {
      if (err) {
        logger.error('failed to getDispatche. url: ' + req.url)
        return res.fail(-99, '获取班车详情失败')
      }
      return res.success(dispatch)
    })
  })
}

exports.getNewModels = function (req, res, cb) {
  dispatchDAO.getNewModels(function (err, dispatch) {
    if (err) {
      logger.error('failed to getDispatche. url: ' + req.url)
      return res.fail(-99, '获取班车详情失败')
    }
    return res.success(dispatch)
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
  var batchId = req.body.batch_id
  var dispatchId = req.body.dispatch_id
  if (batchId) {
    req.body.id = batchId
    ticketDAO.getBatchTicketCount(req.body.id, function (err, count) {
      if (err) {
        return res.fail(-99, '删除派车记录失败')
      }
      if (count) {
        return res.fail(-1, '当前批次已有学生买票，不能删除')
      }

      cb(req, res, function (resData) {
        return res.success(resData)
      })
    })
  } else if (dispatchId) {
    req.body.id = dispatchId
    ticketDAO.getDispatchTicketCount(req.body.id, function (err, count) {
      if (err) {
        return res.fail(-99, '删除派车记录失败')
      }
      if (count) {
        return res.fail(-1, '当前班次已有学生买票，不能删除')
      }

      cb(req, res, function (resData) {
        return res.success(resData)
      })
    })
  } else {
    return res.fail(-400, '参数错误')
  }
}

exports.setAdd = function (req, res, cb) {
  cb(req, res, function (resData) {
    res.success(resData)
  })
}
exports.setAddList = function (req, res, cb) {
  if (!req.body.data.rows.length) {
    return res.success({Count: 0})
  }
  var batchId = req.body.data.rows[0].batch_id
  dispatchDAO.getBatchDispatches(batchId, function (err, dispatches) {
    if (err) {
      logger.error('failed to get batch\'s dispatches.', err)
      return res.fail(-99, '派车失败')
    }

    // 过滤掉之前的派车记录（避免重复添加）
    req.body.data.rows = req.body.data.rows.filter((row) => {
      // 未删除、同一天、同一班次 视为重复数据
      return !dispatches.some(d => (!d.isDel && (Number(new Date(d.start_time)) === Number(new Date(row.start_time))) && (d.schedule_id === row.schedule_id)))
    })
    // 如果没有新增的派车，直接返回
    if (!req.body.data.rows.length) {
      return res.success({Count: 0})
    }

    // 避免生成重复的编号
    var serialNums = []
    for (let row of req.body.data.rows) {
      row['id'] = uuid.v1()
      row['create_time'] = ComBll.getNowFormatDate()
      row['isDel'] = '0'
      row['serial_no'] = util.generateSerialNo(3, serialNums)
    }
    cb(req, res, function (resData) {
      res.success(resData)
    })
  })
}

exports.setEdit = function (req, res, cb) {
  var batchId = req.body.data.id
  var isTemplate = req.body.data.is_template
  delete req.body.data.is_template
  cb(req, res, function (resData) {
    if (isTemplate) {
      dispatchDAO.setTemplateBatch(batchId, () => res.success(resData))
    } else {
      dispatchDAO.cancelTemplateBatch(batchId, () => res.success(resData))
    }
  })
}

exports.getBatchDispatches = function (req, res, next) {
  dispatchDAO.getBatchDispatches(req.params.id, function (err, dispatches) {
    if (err) {
      logger.error('failed to get batch\'s dispatches.', err)
      return res.fail(-99, '获取批次派车数据失败')
    }
    return res.success({rows: dispatches})
  })
}

