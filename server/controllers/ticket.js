'use strict'

var logger = require('../common/logger')

var ticketDAO = require('../models/ticket')
var orderDAO = require('../models/order')
var busDAO = require('../models/bus')

exports.getUserTickets = function (req, res) {
  var userId = req.params.userId
  ticketDAO.getUserTickets(userId, function (err, tickets) {
    if (err) {
      logger.error('failed to getUserTickets. url: ' + req.url, err)
      return res.fail(-99, '获取用户车票列表数据失败')
    }
    return res.success(tickets)
  })
}

exports.getTicket = function (req, res) {
  var id = req.params.id
  ticketDAO.getTicket(id, function (err, ticket) {
    if (err) {
      logger.error('failed to getTicket. url: ' + req.url, err)
      return res.fail(-99, '获取用户车票详情失败')
    }
    return res.success(ticket)
  })
}

exports.checkTicket = function (req, res) {
  var id = req.params.id
  var busId = req.body.bus_id

  ticketDAO.getTicket(id, function (err, ticket) {
    if (err) {
      logger.error('failed to checkTicket. url: ' + req.url, err)
      return res.fail(-99, '核对车票失败')
    }
    if (!ticket || (ticket.status !== 0)) { // 必须是未使用状态
      return res.fail(-1, '无效的车票')
    } else if (!ticket.isUseDay) {
      return res.fail(-3, '不是当天的车票，无法使用')
    }
    if (!ticket.order || (ticket.order.status !== 1)) { // 必须是已支付订单
      return res.fail(-2, '订单未支付成功，无法使用')
    }

    busDAO.getBus(busId, function (err, bus) {
      if (err) {
        return res.fail(-99, '核对班车信息失败')
      }
      if (ticket.schedule.company.id !== bus.company_id) {
        return res.fail(-3, '班车信息不匹配，无法检票')
      }
      // 开始检票
      ticketDAO.checkTicket(id, busId, function (err, affectedRows) {
        if (err) {
          return res.fail(-99, '检票失败')
        }
        // （逻辑已过时）统计当前班次、当前班车上已检票多少人
        // ticketDAO.getDispatchCheckedTicketCount(ticket.dispatch.id, busId, function (err, count) {

        // 统计当前班车、当天已检票多少人
        ticketDAO.getBusCheckedTicketCount(busId, (new Date()), function (err, count) {
          if (err) {
            return res.fail(1, '检票成功')
          }
          return res.success({checkedCount: count})
        })
      })
    })
  })
}

exports.returnTicket = function (req, res) {
  var id = req.params.id

  ticketDAO.getTicket(id, function (err, ticket) {
    if (err) {
      logger.error('failed to returnTicket. url: ' + req.url, err)
      return res.fail(-99, '退票失败')
    }
    if (!ticket || (ticket.status !== 0 && ticket.status !== 2)) { // 未使用、已过期的车票才能退票
      return res.fail(-1, '无效的车票')
    }
    if (!ticket.order || (ticket.order.status !== 1)) { // 必须是已支付订单
      return res.fail(-2, '订单未支付成功，无法退票')
    }
    orderDAO.getOrderPayments(ticket.order.id, function (err, payments) {
      if (err) {
        logger.error('failed to returnTicket.', err)
        return res.fail(-99, '退票失败')
      }

      if (!payments.length) {
        return res.fail(-3, '订单缺少付款信息，无法完成退票')
      }
      var payment = payments.filter((item) => item.status === 1).shift()  // 支付成功
      if (!payment) {
        return res.fail(-5, '订单支付状态有误，无法完成退票')
      }

      /**
       * 0: 余额
       * 1: 微信
       * 2: 支付宝
       * 3: 校园一卡通
       */
      // 目前所有退票都退到余额
      if (payment.type === 0 || payment.type === 1 || payment.type === 3) {
        ticketDAO.returnTicketToBalance(ticket, function (err, affectedRows) {
          if (err) {
            logger.error('failed to returnTicket.', err)
            return res.fail(-99, '退票失败')
          }
          ticket.status = 3 // 已退票
          return res.success(ticket)
        })
      } else {
        return res.fail(-9, '暂不支持此退款方式')
      }
    })
  })
}

exports.getCheckedStatistics = function (req, res, next) {
  var dispatchDate = req.query.dispatchDate
  var companyId = req.query.companyId
  ticketDAO.getCheckedStatistics(dispatchDate, companyId, function (err, statistics) {
    if (err) {
      logger.error('faild to get ticket statistics.', err)
      return res.fail(-99, '统计车票数据失败')
    }
    return res.success(statistics)
  })
}

exports.getBusCheckedStatistics = function (req, res, next) {
  var dispatchDate = req.query.dispatchDate
  var companyId = req.query.companyId
  ticketDAO.getBusCheckedStatistics(dispatchDate, companyId, function (err, statistics) {
    if (err) {
      logger.error('faild to get ticket statistics group by bus.', err)
      return res.fail(-99, '统计车票数据失败')
    }
    return res.success(statistics)
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