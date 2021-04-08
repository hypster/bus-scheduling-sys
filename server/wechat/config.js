'use strict'

var gSettings = require('../../global.settings')

var config = {
  dev: {
    corpid: 'wx376ba433d3711289',
    corpsecret: 'twoZxNM_ZLBoY0lE_huJs3Vhv5O_REpQakjI3E_Dz9OP-n11scvke22c0YbXhfME',
    redirect_uri: 'https://qclouddev.shnu.edu.cn:8443/api/wechat/auth'
  },
  test: {
    corpid: 'wx376ba433d3711289',
    corpsecret: 'twoZxNM_ZLBoY0lE_huJs3Vhv5O_REpQakjI3E_Dz9OP-n11scvke22c0YbXhfME',
    redirect_uri: 'https://qclouddev.shnu.edu.cn:8443/api/wechat/auth',
    // 支付相关
    pay: {
      appid: 'wx6df13e8f887238fa',
      mch_id: '1236600802',
      nonce_str: 'e442cfbc7d7b8c6939bbd7e4cb50e341',
      sub_appid: 'wx730c1aa34cf616dc',
      sub_mch_id: '1398608802',
      notify_url: 'https://qclouddev.shnu.edu.cn:8443/api/orders/pay_notify',
      key: 'e442cfbc7d7b8c6939bbd7e4cb50e341'
    }
  },
  prod: {
    corpid: 'wx730c1aa34cf616dc',
    corpsecret: 'g50-KIlUZw3VYRcprXwD9QD5OMPU_F_NdXCZEA2S6UL_BiHfwpFlBbyqAXvFu5u9',
    redirect_uri: 'http://qcloud.shnu.edu.cn/api/wechat/auth',
    // 支付相关
    pay: {
      appid: 'wx6df13e8f887238fa',
      mch_id: '1236600802',
      nonce_str: 'e442cfbc7d7b8c6939bbd7e4cb50e341',
      sub_appid: 'wx730c1aa34cf616dc',
      sub_mch_id: '1398608802',
      notify_url: 'http://qcloud.shnu.edu.cn/api/orders/pay_notify',
      key: 'e442cfbc7d7b8c6939bbd7e4cb50e341'
    }
  }
}

module.exports = config[gSettings.env]
