'use strict'

var http = require('http')
var https = require('https')
var urlUtil = require('url')
require('date-utils').language('es')
var _ = require('lodash')
var sha1 = require('sha1')
var md5 = require('md5')
var xmlParser = require('xml2json')
// var Promise = require('promise')

var logger = require('../common/logger')

var config = require('./config')

var store = {
  config: config,
  token: {
    access_token: '',
    expired_time: '1900/1/1 00:00:00'
  },
  jsapi_ticket: {
    ticket: '',
    expired_time: '1900/1/1 00:00:00'
  }
}

function getUserInfo (accessToken, code, cb) {
  // {
  //   "DeviceId": "15def1544ef98bf5e0027bf9422e996a",
  //   "OpenId": "oNwpSs2wRl1J4NKJruu8InTdcOQ4"  // 非企业成员授权时就返回OpenId
  //   "UserId": ""  // 企业成员授权时返回UserId
  // }
  // https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=-GECmslvkll5WveeGnoHDMGVcSYi-m_sN1k_UL-vBfUNnPVtgXrGPdY0KCJWIbHq&code=711acbfabadbbfe7f606ae57447351d7
  console.log('getUserInfo', `https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=${accessToken}&code=${code}`)
  httpGet(`https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=${accessToken}&code=${code}`, function (err, data) {
    if (err) {
      logger.error('failed to get wechat user info.', err)
      return cb(err)
    }
    console.log('userInfo', data)
    return cb(null, data)
  })
}
function getUserDetail (accessToken, userId, cb) {
  // {
  //   "errcode": 0,
  //   "errmsg": "ok",
  //   "userid": "zhangsan",
  //   "name": "李四",
  //   "department": [1, 2],
  //   "position": "后台工程师",
  //   "mobile": "15913215421",
  //   "gender": "1",
  //   "email": "zhangsan@gzdev.com",
  //   "weixinid": "lisifordev",
  //   "avatar": "http://wx.qlogo.cn/mmopen/ajNVdqHZLLA3WJ6DSZUfiakYe37PKnQhBIeOQBO4czqrnZDS79FH5Wm5m4X69TBicnHFlhiafvDwklOpZeXYQQ2icg/0",
  //   "status": 1,
  //   "extattr": {"attrs":[{"name":"爱好","value":"旅游"},{"name":"卡号","value":"1234567234"}]}
  // }
  // https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token=ACCESS_TOKEN&userid=USERID
  httpGet(`https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token=${accessToken}&userid=${userId}`, function (err, data) {
    if (err) {
      logger.error('failed to get wechat user detail.', err)
      return cb(err)
    }
    console.log('userDetail', data)
    return cb(null, data)
  })
}
function convertToOpenId (accessToken, userId, cb) {
  // 请求示例
  // POST:https://qyapi.weixin.qq.com/cgi-bin/user/convert_to_openid?access_token=ACCESS_TOKEN
  // {
  //   "userid": "zhangsan",
  //   "agentid": 1
  // }
  // 返回说明
  // {
  //   "errcode": 0,
  //   "errmsg": "ok",
  //   "openid": "oDOGms-6yCnGrRovBj2yHij5JL6E",
  //   "appid":"wxf874e15f78cc84a7"
  // }
  var postData = JSON.stringify({
    userid: userId
  })
  httpPost(`https://qyapi.weixin.qq.com/cgi-bin/user/convert_to_openid?access_token=${accessToken}`, postData, function (err, data) {
    if (err) {
      return cb(err)
    }
    return cb(err, data)
  })
}

function generateAuthUrl (req, state, cb) {
  return cb(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.corpid}&redirect_uri=${encodeURIComponent(config.redirect_uri)}&response_type=code&scope=snsapi_base&state=${encodeURIComponent(state)}#wechat_redirect`)
}
function getAccessToken (cb) {
  var tokenExpiredTime = new Date(store.token.expired_time)
  if ((new Date()).getMinutesBetween(tokenExpiredTime) > 5) { // 过期时间大于5分钟，直接返回缓存，否则重新获取 access token
    return cb(null, store.token.access_token)
  }
  httpGet(`https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${config.corpid}&corpsecret=${config.corpsecret}`, function (err, token) {
    if (err) {
      logger.error('failed to get wechat access token.', err)
      return cb(err)
    }
    store.token.access_token = token.access_token
    store.token.expired_time = (new Date()).addSeconds(token.expires_in)
    return cb(null, store.token.access_token)
  })
}
function getJSApiTicket (cb) {
  var ticketExpiredTime = new Date(store.jsapi_ticket.expired_time)
  if ((new Date()).getMinutesBetween(ticketExpiredTime) > 5) { // 过期时间大于5分钟，直接返回缓存，否则重新获取 jsapi_ticket
    return cb(null, store.jsapi_ticket.ticket)
  }
  getAccessToken(function (err, accessToken) {
    if (err) {
      return cb(err)
    }
    httpGet(`https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket?access_token=${accessToken}`, function (err, result) {
      if (err) {
        logger.error('failed to get wechat jsapi_ticket.', err)
        return cb(err)
      }
      store.jsapi_ticket.ticket = result.ticket
      store.jsapi_ticket.expired_time = (new Date()).addSeconds(result.expires_in)
      return cb(null, store.jsapi_ticket.ticket)
    })
  })
}
function generateJSApiConfig (url, cb) {
  var jsApiConfig = {
    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
    appId: config.corpid, // 必填，公众号的唯一标识
    timestamp: parseInt(new Date().valueOf() / 1000).toString(), // 必填，生成签名的时间戳
    nonceStr: 'shnu.campus-bus', // 必填，生成签名的随机串
    signature: '' // ,// 必填，签名，见附录1
    // jsApiList: [] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
  }

  // 签名算法
  // 签名生成规则如下：参与签名的字段包括noncestr（随机字符串）, 有效的jsapi_ticket, timestamp（时间戳）, url（当前网页的URL，不包含#及其后面部分） 。对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序）后，使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串string1。这里需要注意的是所有参数名均为小写字符。对string1作sha1加密，字段名和字段值都采用原始值，不进行URL 转义。
  getJSApiTicket(function (err, ticket) {
    if (err) {
      return cb(err)
    }

    // 步骤1. 对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序）后，使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串string1：
    var string1 = `jsapi_ticket=${ticket}&noncestr=${jsApiConfig.nonceStr}&timestamp=${jsApiConfig.timestamp}&url=${url}`
    // 步骤2. 对string1进行sha1签名，得到signature：
    jsApiConfig.signature = sha1(string1)
    return cb(null, jsApiConfig)
  })
}

function generatePaySign (payload) {
  // 第一步：对参数按照key=value的格式，并按照参数名ASCII字典序排序如下：
    // stringA="appid=wxd930ea5d5a258f4f&body=test&device_info=1000&mch_id=10000100&nonce_str=ibuaiVcKdpRxkhJA";
  // 第二步：拼接API密钥：
    // stringSignTemp="stringA&key=192006250b4c09247ec02edce69f6a2d"
    // sign=MD5(stringSignTemp).toUpperCase()="9A0A8659F005D6984697E2CA0A9CF3B7"
  var keys = Object.keys(payload).sort()
  var pairs = []
  keys.forEach(function (key) {
    pairs.push(`${key}=${payload[key]}`)
  })
  var signTemp = `${pairs.join('&')}&key=${config.pay.key}`
  return md5(signTemp).toUpperCase()
}
function unifiedOrder (req, payload, goods, cb) {
  // 示例
  // <xml>
  //   <appid>wx2421b1c4370ec43b</appid>  // 微信分配的公众账号ID（企业号corpid即为此appId）
  //   <attach>支付测试</attach>  // 附加数据，在查询API和支付通知中原样返回，该字段主要用于商户携带订单的自定义数据
  //   <body>JSAPI支付测试</body> // 商品简单描述，该字段须严格按照规范传递，具体请见参数规定：https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=4_2
  //   <mch_id>10000100</mch_id>  // 微信支付分配的商户号
  //   <detail><![CDATA[{ "goods_detail":[ { "goods_id":"iphone6s_16G", "wxpay_goods_id":"1001", "goods_name":"iPhone6s 16G", "quantity":1, "price":528800, "goods_category":"123456", "body":"苹果手机" }, { "goods_id":"iphone6s_32G", "wxpay_goods_id":"1002", "goods_name":"iPhone6s 32G", "quantity":1, "price":608800, "goods_category":"123789", "body":"苹果手机" } ] }]]></detail> // 商品详细列表，使用Json格式，传输签名前请务必使用CDATA标签将JSON文本串保护起来。
                                                                                // goods_detail []：
                                                                                // └ goods_id String 必填 32 商品的编号
                                                                                // └ wxpay_goods_id String 可选 32 微信支付定义的统一商品编号
                                                                                // └ goods_name String 必填 256 商品名称
                                                                                // └ quantity Int 必填 商品数量
                                                                                // └ price Int 必填 商品单价，单位为分
                                                                                // └ goods_category String 可选 32 商品类目ID
                                                                                // └ body String 可选 1000 商品描述信息
  //   <nonce_str>1add1a30ac87aa2db72f57a2375d8fec</nonce_str>  // 随机字符串，不长于32位。商户自定义，推荐随机数生成算法
  //   <notify_url>http://wxpay.weixin.qq.com/pub_v2/pay/notify.v2.php</notify_url>
  //   <openid>oUpF8uMuAJO_M2pxb1Q9zNjWeS6o</openid>  // trade_type=JSAPI，此参数必传，用户在商户appid下的唯一标识。
  //   <out_trade_no>1415659990</out_trade_no>  // 商户系统内部的订单号,32个字符内、可包含字母, 其他说明见商户订单号
  //   <spbill_create_ip>14.23.150.211</spbill_create_ip> // APP和网页支付提交用户端ip，Native支付填调用微信支付API的机器IP。
  //   <total_fee>1</total_fee> // 订单总金额：交易金额默认为人民币交易，接口中参数支付金额单位为【分】，参数值不能带小数。对账单中的交易金额单位为【元】。外币交易的支付金额精确到币种的最小单位，参数值不能带小数点。
  //   <trade_type>JSAPI</trade_type> // 交易类型：取值如下：JSAPI，NATIVE，APP，详细说明见参数规定
  //   <sign>0CB01533B8C1EF103065174F50BCA001</sign>  // 签名，详见签名生成算法
  // </xml>

  // 服务商模式文档：https://pay.weixin.qq.com/wiki/doc/api/jsapi_sl.php?chapter=9_1
  payload.appid = config.pay.appid
  payload.sub_appid = config.pay.sub_appid
  payload.mch_id = config.pay.mch_id
  payload.sub_mch_id = config.pay.sub_mch_id
  payload.nonce_str = config.pay.nonce_str
  payload.notify_url = config.pay.notify_url
  payload.body = '学生班车-车票支付'
  payload.trade_type = 'JSAPI'
  payload.detail = `${JSON.stringify(goods)}`

  var postData = `
    <xml>
      <appid>${payload.appid}</appid>
      <sub_appid>${payload.sub_appid}</sub_appid>
      <attach>${payload.attach}</attach>
      <body>${payload.body}</body>
      <mch_id>${payload.mch_id}</mch_id>
      <sub_mch_id>${payload.sub_mch_id}</sub_mch_id>
      <detail><![CDATA[${payload.detail}]]></detail>
      <nonce_str>${payload.nonce_str}</nonce_str>
      <notify_url>${payload.notify_url}</notify_url>
      <sub_openid>${payload.sub_openid}</sub_openid>
      <out_trade_no>${payload.out_trade_no}</out_trade_no>
      <spbill_create_ip>${payload.spbill_create_ip}</spbill_create_ip>
      <total_fee>${payload.total_fee}</total_fee>
      <trade_type>${payload.trade_type}</trade_type>
      <sign>${generatePaySign(payload)}</sign>
    </xml>`
  console.log(postData)
  httpPost('https://api.mch.weixin.qq.com/pay/unifiedorder', postData, function (err, xmlResult) {
    console.log(xmlResult)
    if (err) {
      return cb(err)
    }
    // 返回示例
    // <xml>
    //   <return_code><![CDATA[SUCCESS]]></return_code>
    //   <return_msg><![CDATA[OK]]></return_msg>
    //   <appid><![CDATA[wx2421b1c4370ec43b]]></appid>
    //   <mch_id><![CDATA[10000100]]></mch_id>
    //   <nonce_str><![CDATA[IITRi8Iabbblz1Jc]]></nonce_str>
    //   <sign><![CDATA[7921E432F65EB8ED0CE9755F0E86D72F]]></sign>
    //   <result_code><![CDATA[SUCCESS]]></result_code>
    //   <prepay_id><![CDATA[wx201411101639507cbf6ffd8b0779950874]]></prepay_id>
    //   <trade_type><![CDATA[JSAPI]]></trade_type>
    // </xml>
    var result = JSON.parse(xmlParser.toJson(xmlResult)).xml
    console.log(result)
    return cb(null, result)
  })
}

function httpGet (urlStr, cb) {
  var agent = (_.startsWith(urlStr, 'https://') ? https : http)
  agent.get(urlStr, function (res) {
    // res.setEncoding('utf8')  // if setEncoding, then will No more data response in 'end' event
    var data = ''
    res.on('data', function (chunk) {
      data += chunk
    })
    res.on('error', function (err) {
      logger.error('failed to get url: ' + urlStr, err)
      return cb(err)
    })
    res.on('end', function () {
      try {
        return cb(null, JSON.parse(data))
      } catch (err) {
        return cb(null, data)
      }
    })
  })
}
function httpPost (urlStr, postData, cb) {
  var url = urlUtil.parse(urlStr, true)
  var isHttps = (url.protocol === 'https:')
  var options = {
    hostname: url.hostname,
    port: isHttps ? 443 : 80,
    path: url.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }
  var agent = (isHttps ? https : http)
  var req = agent.request(options, (res) => {
    var data = ''
    // res.setEncoding('utf8');
    res.on('data', (chunk) => {
      data += chunk
    })
    res.on('end', () => {
      try {
        return cb(null, JSON.parse(data))
      } catch (err) {
        return cb(null, data)
      }
    })
  })

  req.on('error', (e) => {
    logger.error(`problem with request: ${e.message}`)
    return cb(e)
  })

  // write data to request body
  req.write(postData)
  req.end()
}

// // 初始化
// getAccessToken(function () {
// })

exports.corpId = store.config.corpid
exports.generateAuthUrl = generateAuthUrl
exports.getAccessToken = getAccessToken
exports.getJSApiTicket = getJSApiTicket
exports.generateJSApiConfig = generateJSApiConfig
exports.getUserInfo = getUserInfo
exports.getUserDetail = getUserDetail
exports.convertToOpenId = convertToOpenId

// 支付
exports.unifiedOrder = unifiedOrder
exports.generatePaySign = generatePaySign
