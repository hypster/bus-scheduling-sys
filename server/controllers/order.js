'use strict'

var xmlParser = require('xml2json')
var uuid = require('uuid')

var logger = require('../common/logger')
var userDAO = require('../models/user')
var orderDAO = require('../models/order')
var ticketDAO = require('../models/ticket')
var dispatchDAO = require('../models/dispatch')
var wechatApiHandler = require('../wechat/api_handler')
var appSettings = require('../app.settings')

exports.newOrder = function (req, res) {
  var userId = req.params.userId
  var dispatch = req.body.dispatch
  if (!userId) {
    return res.end(400, 'must provide userId')
  }
  var now = new Date()
  var endDepartureTime = new Date(dispatch.end_departure_time)
  // 发车前 `appSettings.aheadOfDeparture` 分钟会停止发售
  if (endDepartureTime - now < (appSettings.aheadOfDeparture * 60 * 1000)) {
    return res.fail(-1, '已停止发售')
  }

  var ticketPrice = (dispatch.use_full_price ? dispatch.schedule.full_price : dispatch.schedule.price)
  var order = {
    user_id: userId,
    status: 0,  // 已下单未支付
    total: ticketPrice,
    description: '',
    create_time: now
  }
  var tickets = []
  tickets.push({
    dispatch_detail_id: dispatch.id,
    price: ticketPrice,
    is_full_price: dispatch.use_full_price,
    count: 1,
    is_pre_order: (dispatch.type === 1),
    pre_order_status: 0,
    status: 0,
    description: '',
    create_time: now
  })
  // 生成新订单之前，先取消用户之前的未支付订单（主要用来解锁余票数）
  orderDAO.cancelUserUnpayOrders(userId, function (err) {
    if (err) {
      logger.error('failed to cancel user\'s unpay orders. url: ' + req.url, err)
      return res.fail(-99, '解锁用户的未支付订单失败')
    }
    ticketDAO.getUserBatchTickets(userId, dispatch.batch_id, function (err, userBatchTickets) {
      if (err) {
        logger.error('failed to get user\'s batch tickets. url: ' + req.url, err)
        return res.fail(-99, '获取用户当前批次车票失败')
      }
      // 车票数量不能超过限制张数
      var busLineType = dispatch.schedule.bus_line.type
      var typeTickets = userBatchTickets.filter(function (t) {
        return t.schedule.bus_line.type === busLineType
      })
      if (busLineType === 0 && (typeTickets.length >= appSettings.limitLeaveTicketPerBatch)) {  // 离校
        return res.fail(-21, `离校车票每人每周限购${appSettings.limitLeaveTicketPerBatch}张`)
      }
      if (busLineType === 1 && (typeTickets.length >= appSettings.limitBackTicketPerBatch)) {  // 返校
        return res.fail(-22, `返校车票每人每周限购${appSettings.limitBackTicketPerBatch}张`)
      }

      orderDAO.newOrder(order, tickets, function (err, result, newOrder, newTickets) {
        if (err) {
          logger.error('failed to create new order. url: ' + req.url, err)
          return res.fail(-99, '下单失败')
        }
        if (result && result.code < 0) {
          return res.fail(result.code, result.message)
        }

        newOrder.tickets = newTickets
        // 优先扣除余额，差额由用户微信或校园一卡通支付
        orderDAO.tryBalancePay(newOrder, function (err, margin, orderPayment) {
          if (err) {
            logger.error('failed to try to use balance pay.', err)
          }
          if (margin === 0) {  // 余额支付成功，并且差额=0
            newOrder.status = 1 // 订单已支付
          }
          var data = {newOrder, margin: Number(margin).toFixed(2)}
          return res.success(data)
        })
      })
    })
  })
}

/**
 * [团购]预订下单
 */
exports.newPreOrder = function (req, res) {
  var userId = req.params.userId
  var dispatch = req.body.dispatch
  if (!userId) {
    return res.end(400, 'must provide userId')
  }
  var now = new Date()
  var endDepartureTime = new Date(dispatch.end_departure_time)
  // 发车前 `appSettings.aheadOfDeparture` 分钟会停止发售
  if (endDepartureTime - now < (appSettings.aheadOfDeparture * 60 * 1000)) {
    return res.fail(-1, '已停止发售')
  }

  var ticketPrice = (dispatch.use_full_price ? dispatch.schedule.full_price : dispatch.schedule.price)
  var order = {
    user_id: userId,
    status: 3,  // 已预订、未支付
    total: ticketPrice,
    description: '',
    create_time: now
  }
  var tickets = []
  tickets.push({
    dispatch_detail_id: dispatch.id,
    price: ticketPrice,
    is_full_price: dispatch.use_full_price,
    count: 1,
    is_pre_order: true, // (dispatch.type === 1),
    pre_order_status: 0,
    status: 0,
    description: '',
    create_time: now
  })

  ticketDAO.getUserBatchTickets(userId, dispatch.batch_id, function (err, userBatchTickets) {
    if (err) {
      logger.error('failed to get user\'s batch tickets. url: ' + req.url, err)
      return res.fail(-99, '获取用户当前批次车票失败')
    }
    // 车票数量不能超过限制张数
    var busLineType = dispatch.schedule.bus_line.type
    var typeTickets = userBatchTickets.filter(function (t) {
      return t.schedule.bus_line.type === busLineType
    })
    if (busLineType === 0 && (typeTickets.length >= appSettings.limitLeaveTicketPerBatch)) {  // 离校
      return res.fail(-21, `离校车票每人每周限购${appSettings.limitLeaveTicketPerBatch}张`)
    }
    if (busLineType === 1 && (typeTickets.length >= appSettings.limitBackTicketPerBatch)) {  // 返校
      return res.fail(-22, `返校车票每人每周限购${appSettings.limitBackTicketPerBatch}张`)
    }

    orderDAO.newOrder(order, tickets, function (err, result, newOrder, newTickets, saleinfo) {
      if (err) {
        logger.error('failed to create new order. url: ' + req.url, err)
        return res.fail(-99, '下单失败')
      }
      if (result && result.code < 0) {
        return res.fail(result.code, result.message)
      }

      newOrder.tickets = newTickets

      // 优先扣除余额，差额由用户微信或校园一卡通支付
      orderDAO.tryBalancePay(newOrder, function (err, margin, orderPayment) {
        if (err) {
          logger.error('failed to try to use balance pay.', err)
        }
        if (margin === 0) {  // 余额支付成功，并且差额=0
          newOrder.status = 1 // 订单已支付
        }

        // 判断是否达到成团人数
        if ((saleinfo.sold_count + newTickets.length) >= dispatch.schedule.limit_count) {
          /** 调用校园一卡通支付接口，统一扣除费用
           * 1. 调用校园一卡通支付接口，为所有预订的学生扣款
           * 2. 生成支付记录`order_payment`
           * 3. 修改`order`.`status`=1 (已支付)
           * -------- 新需求确定为预订时支付，所以跳过前3步 ----------
           * 4. 修改`ticket`.`pre_order_status`=1 (成团)
           * 5. 修改`dispatch_detail`.`pre_order_completed`=1 (已成团)
           */
          dispatchDAO.completePreOrder(dispatch.id, function (err, result) {
            if (err) {
              logger.error('failed to complete pre order.', err)
            }
            logger.info(`pre order completed: dispatch.id=${dispatch.id}`)
          })
        }
        var data = {newOrder, margin: Number(margin).toFixed(2)}
        return res.success(data)
      })
    })
  })
}

exports.cancelOrder = function (req, res) {
  var id = req.params.id
  orderDAO.getOrder(id, function (err, order) {
    if (err) {
      logger.error('failed to get order. url: ' + req.url, err)
      return res.fail(-99, '订单支付失败')
    }

    if (order && (order.status === 1)) {
      return res.fail(1, '订单已支付，请去我的车票页面查看')
    }
    orderDAO.cancelOrder(id, function (err, affectedRows) {
      if (err) {
        logger.error('failed to cancel order. url: ' + req.url, err)
        return res.fail(-99, '取消订单失败')
      }
      return res.success({ orderId: id })
    })
  })
}

exports.payOrder = function (req, res) {
  var orderId = req.params.id
  var orderPayment = req.body
  orderPayment.id = uuid.v1()
  orderPayment.order_id = orderId
  orderPayment.status = 0
  orderPayment.create_time = new Date()

  orderDAO.getOrder(orderId, function (err, order) {
    if (err) {
      logger.error('failed to get order. url: ' + req.url, err)
      return res.fail(-99, '订单支付失败')
    }
    if (!order) {
      return res.fail(-1, '订单不存在')
    } else if (order.status === 1) {
      return res.fail(-2, '订单已支付')
    } else if (order.status !== 0) {
      return res.fail(-3, '无效的订单状态')
    }

    orderDAO.getOrderPayments(orderId, function (err, payments) {
      if (err) {
        logger.error('', err)
      }

      // 求出差额
      orderPayment.amount = order.total
      if (payments.length) {
        payments.forEach(function (item) {
          // 如果已经使用余额支付了部分票价、则只需付差额
          if (item.type === 0 && item.status === 1 && item.amount) {
            orderPayment.amount -= item.amount
            orderPayment.amount = Number(orderPayment.amount.toFixed(2))  // 由于JavaScript计算精度问题
          }
        })
      }

      if (orderPayment.type === 0) {  // 余额支付
        payWithBalance(req, res, order, orderPayment)
      } else if (orderPayment.type === 1) { // 微信支付
        payWithWechat(req, res, order, orderPayment)
      } else if (orderPayment.type === 3) { // 校园一卡通支付
        return res.fail(-99, '暂不支持一卡通支付')
      } else {
        return res.fail(-99, '暂不支持')
        // orderDAO.payOrder(orderPayment, function (err, payResult, newOrderPayment) {
        //   if (err) {
        //     logger.error('failed to pay order. url: ' + req.url, err)
        //     return res.fail(-99, '订单支付失败')
        //   }
        //   if (payResult && payResult.code !== 0) {
        //     return res.fail(-5, payResult.message)
        //   }
        //   return res.success({newOrderPayment})
        // })
      }
    })
  })
}
function payWithBalance(req, res, order, orderPayment) {
  orderDAO.payOrderWithBalance(order, orderPayment, function (err, payResult, newOrderPayment) {
    if (err) {
      logger.error('failed to pay order with balance. url: ' + req.url, err)
      return res.fail(-99, '订单支付失败')
    }
    if (payResult && payResult.code !== 0) {
      return res.fail(-4, payResult.message)
    }
    return res.success({ newOrderPayment })
  })
}
function payWithECard(req, res, order, orderPayment) {

}
function payWithWechat(req, res, order, orderPayment) {
  userDAO.getUser(order.user_id, function (err, user) {
    if (err) {
      logger.error('failed to get user', err)
      return res.fail(-99, '订单支付失败')
    }
    // 获取订单明细
    ticketDAO.getOrderTickets(order.id, function (err, tickets) {
      if (err) {
        logger.error('failed to get order\'s tickets', err)
        return res.fail(-99, '订单支付失败')
      }

      var ipAddress = (req.ip === '::1' ? '127.0.0.1' : req.ip)
      var colonLastIndex = ipAddress.lastIndexOf(':')
      if (colonLastIndex > 0) {
        ipAddress = ipAddress.substr(colonLastIndex + 1)
      }
      var payload = {
        // openid: user.openid,  // 用户在商户appid下的唯一标识。
        sub_openid: user.openid,
        out_trade_no: order.id.replace(/-/g, ''), // 商户系统内部的订单号,32个字符内、可包含字母, 其他说明见商户订单号
        total_fee: orderPayment.amount * 10 * 10,  // 订单总金额，默认 人民币，单位：分
        spbill_create_ip: ipAddress,
        attach: JSON.stringify({ order_id: order.id, payment_id: orderPayment.id })  // 自定义附加信息
      }
      var goods = {
        goods_detail: []
      }
      tickets.forEach(function (ticket) {
        var startStation = ticket.schedule.bus_line.start_station
        var terminalStation = ticket.schedule.bus_line.terminal_station
        goods.goods_detail.push({
          goods_id: ticket.id.replace(/-/g, ''),  // String 必填 32 商品的编号
          goods_name: `${startStation.name}→${terminalStation.name}`, // String 必填 256 商品名称
          quantity: ticket.count, // Int 必填 商品数量
          price: Number(ticket.price)  // Int 必填 商品单价，单位为分
        })
      })

      // 生成支付记录
      orderPayment.api_request = JSON.stringify({
        payload, goods
      })
      orderDAO.payOrder(order, orderPayment, function (err, payResult, newOrderPayment) {
        if (err) {
          logger.error('failed to pay order. url: ' + req.url, err)
          return res.fail(-99, '订单支付失败')
        }
        if (payResult && payResult.code !== 0) {
          return res.fail(-5, payResult.message)
        }

        // 调用微信统一下单接口，获取预支付id(prepay_id)
        wechatApiHandler.unifiedOrder(req, payload, goods, function (err, result) {
          if (err) {
            logger.error('failed to call wechat unifiedOrder.', err)
            return res.fail(-99, '订单支付失败')
          }

          var resResult = {
            code: 0,
            message: 'SUCCESS'
          }
          if (result.return_code !== 'SUCCESS') {
            resResult.code = -10
            resResult.message = result.return_msg
          } else if (result.result_code !== 'SUCCESS') {
            resResult.code = -11
            resResult.message = `微信下单失败：${result.err_code_des}`
          }
          if (resResult.code !== 0) {
            newOrderPayment.status = 2 // 支付失败
            orderDAO.updatePayStatus(order.id, newOrderPayment.id, newOrderPayment.status, JSON.stringify(result), function (err, result) {
              if (err) {
                logger.error(err)
              }
              return res.fail(resResult.code, resResult.message)
            })
          } else {
            // 生成如下支付选项用于JSAPI调用微信支付接口
            // {
            //   "appId": "wx2421b1c4370ec43b",     //公众号名称，由商户传入
            //   "timeStamp":"1395712654",         //时间戳，自1970年以来的秒数
            //   "nonceStr": "e61463f8efa94090b1f366cccfbbb444", //随机串
            //   "package": "prepay_id=u802345jgfjsdfgsdg888",
            //   "signType": "MD5",         //微信签名方式：
            //   "paySign": "70EA570631E4BB79628FBCA90534C63FF7FADD89" //微信签名
            // }
            var payOptions = {
              appId: result.appid,
              timeStamp: parseInt(new Date().valueOf() / 1000).toString(), // 转成秒数
              nonceStr: result.nonce_str,
              package: `prepay_id=${result.prepay_id}`,
              signType: 'MD5'
            }
            var paySign = wechatApiHandler.generatePaySign(payOptions)
            payOptions.paySign = paySign
            return res.success({ payOptions, newOrderPayment })
          }
        })
      })
    })
  })
}

exports.JSAPICallback = function (req, res) {
  var orderId = req.params.orderId
  var paymentId = req.params.paymentId
  var status = req.body.status
  var apiResponse = req.body.api_response

  // 安全考虑，本接口仅处理非支付成功的结果。  支付成功统一由微信主动通知来更新支付状态
  if (status === 1) {
    return res.success({})
  }

  orderDAO.updatePayStatus(orderId, paymentId, status, JSON.stringify(apiResponse), function (err, result) {
    if (err) {
      logger.error('failed to handle JSAPICallback.', err)
    }
    return res.success(result)
  })
}
exports.payNotify = function (req, res) {
  var data = ''
  req.on('data', function (chunk) {
    data += chunk
  })
  req.on('end', function () {
    //   <xml>
    //     <appid><![CDATA[wx6df13e8f887238fa]]></appid>
    //     <attach><![CDATA[{order_id:'',payment_id:''}]]></attach>
    //     <bank_type><![CDATA[COMM_CREDIT]]></bank_type>
    //     <cash_fee><![CDATA[1]]></cash_fee>
    //     <fee_type><![CDATA[CNY]]></fee_type>
    //     <is_subscribe><![CDATA[N]]></is_subscribe>
    //     <mch_id><![CDATA[1236600802]]></mch_id>
    //     <nonce_str><![CDATA[e442cfbc7d7b8c6939bbd7e4cb50e341]]></nonce_str>
    //     <openid><![CDATA[oFDNowDYyl1KFVWD757Souh52UFw]]></openid>
    //     <out_trade_no><![CDATA[3b13c6c096ce11e68eb9af054806eeac]]></out_trade_no>
    //     <result_code><![CDATA[SUCCESS]]></result_code>
    //     <return_code><![CDATA[SUCCESS]]></return_code>
    //     <sign><![CDATA[4F06B02FA2048BF3D56FE2ADB861C22B]]></sign>
    //     <sub_appid><![CDATA[wx730c1aa34cf616dc]]></sub_appid>
    //     <sub_is_subscribe><![CDATA[Y]]></sub_is_subscribe>
    //     <sub_mch_id><![CDATA[1398608802]]></sub_mch_id>
    //     <sub_openid><![CDATA[orN5pszX26PmxvQiPA-_gFHMoFtQ]]></sub_openid>
    //     <time_end><![CDATA[20161020220527]]></time_end>
    //     <total_fee>1</total_fee>
    //     <trade_type><![CDATA[JSAPI]]></trade_type>
    //     <transaction_id><![CDATA[4006522001201610207247131526]]></transaction_id>
    // </xml>
    // <xml><appid><![CDATA[wx6df13e8f887238fa]]></appid> <attach><![CDATA[{"order_id":"cece0c80-9765-11e6-9ab9-5b46ff8e56c6","payment_id":"e16b5e60-9765-11e6-9ab9-5b46ff8e56c6"}]]></attach> <bank_type><![CDATA[CFT]]></bank_type> <cash_fee><![CDATA[1]]></cash_fee> <fee_type><![CDATA[CNY]]></fee_type> <is_subscribe><![CDATA[N]]></is_subscribe> <mch_id><![CDATA[1236600802]]></mch_id> <nonce_str><![CDATA[e442cfbc7d7b8c6939bbd7e4cb50e341]]></nonce_str> <openid><![CDATA[oFDNowDYyl1KFVWD757Souh52UFw]]></openid> <out_trade_no><![CDATA[cece0c80976511e69ab95b46ff8e56c6]]></out_trade_no> <result_code><![CDATA[SUCCESS]]></result_code> <return_code><![CDATA[SUCCESS]]></return_code> <sign><![CDATA[08A4D6926BB93CA5C1FA3043D66BEF90]]></sign> <sub_appid><![CDATA[wx730c1aa34cf616dc]]></sub_appid> <sub_is_subscribe><![CDATA[Y]]></sub_is_subscribe> <sub_mch_id><![CDATA[1398608802]]></sub_mch_id> <sub_openid><![CDATA[orN5pszX26PmxvQiPA-_gFHMoFtQ]]></sub_openid> <time_end><![CDATA[20161021161118]]></time_end> <total_fee>1</total_fee> <trade_type><![CDATA[JSAPI]]></trade_type> <transaction_id><![CDATA[4006522001201610217306670212]]></transaction_id> </xml>

    var result = JSON.parse(xmlParser.toJson(data)).xml
    var attachJSON = JSON.parse(result.attach)

    var payStatus = 2 // 支付失败
    if (result.result_code === 'SUCCESS') {
      payStatus = 1 // 支付成功
    }
    orderDAO.updatePayStatus(attachJSON.order_id, attachJSON.payment_id, payStatus, data, function (err) {
      if (err) {
        logger.error('failed to update payment status.', err)
      }
      res.send(`<xml>
                  <return_code><![CDATA[SUCCESS]]></return_code>
                  <return_msg><![CDATA[OK]]></return_msg>
                </xml>`)
    })
  })
}

exports.getStatistics = function (req, res) {
  orderDAO.getStatistics(req.body.data, function (err, dispatch) {
    if (err) {
      logger.error('failed to getStatistics. url: ' + req.url)
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
