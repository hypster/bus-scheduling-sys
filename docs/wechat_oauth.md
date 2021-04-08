
[微信企业号开发者文档](http://qydev.weixin.qq.com/wiki/index.php)

## 测试环境：

**corp_id**: `wx376ba433d3711289` *corp_id可以当appId使用*    
**secret**: `twoZxNM_ZLBoY0lE_huJs3Vhv5O_REpQakjI3E_Dz9OP-n11scvke22c0YbXhfME`

## 接口调试
### 获取AccessToken
[参考文档](http://qydev.weixin.qq.com/wiki/index.php?title=%E4%B8%BB%E5%8A%A8%E8%B0%83%E7%94%A8)

示例：
```
GET: https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=wx376ba433d3711289&corpsecret=twoZxNM_ZLBoY0lE_huJs3Vhv5O_REpQakjI3E_Dz9OP-n11scvke22c0YbXhfME
{
    "access_token": "-GECmslvkll5WveeGnoHDMGVcSYi-m_sN1k_UL-vBfUNnPVtgXrGPdY0KCJWIbHq",
    "expires_in": 7200
}
```

### 授权 - 企业获取code

[参考文档](http://qydev.weixin.qq.com/wiki/index.php?title=OAuth%E9%AA%8C%E8%AF%81%E6%8E%A5%E5%8F%A3)

示例：
```
GET: 
https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx376ba433d3711289&redirect_uri=qclouddev.shnu.edu.cn%2fapi%2fwechat%2fauth&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect

Will Redirect To: http://baidu.com/?code=6b096e3ab1189f7cef9247f520b9f904&state=STATE

```

### 根据code获取成员信息(UserId)
示例：
```
GET: 
https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=-GECmslvkll5WveeGnoHDMGVcSYi-m_sN1k_UL-vBfUNnPVtgXrGPdY0KCJWIbHq&code=711acbfabadbbfe7f606ae57447351d7
{
    "DeviceId": "15def1544ef98bf5e0027bf9422e996a",
    "OpenId": "oNwpSs2wRl1J4NKJruu8InTdcOQ4"  // 非企业成员授权时就返回OpenId
    "UserId": ""  // 企业成员授权时返回UserId
}
```

### userid转换成openid接口
[参考文档](http://qydev.weixin.qq.com/wiki/index.php?title=Userid%E4%B8%8Eopenid%E4%BA%92%E6%8D%A2%E6%8E%A5%E5%8F%A3)

示例：
```
POST:
https://qyapi.weixin.qq.com/cgi-bin/user/convert_to_openid?access_token=ACCESS_TOKEN
{
   "userid": "zhangsan",
   "agentid": 1
}
Response:
{
   "errcode": 0,
   "errmsg": "ok",
   "openid": "oDOGms-6yCnGrRovBj2yHij5JL6E",
   "appid":"wxf874e15f78cc84a7"
}
```

### 获取成员详情
示例：
```
GET:
https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token=ACCESS_TOKEN&userid=USERID
{
   "errcode": 0,
   "errmsg": "ok",
   "userid": "zhangsan",
   "name": "李四",
   "department": [1, 2],
   "position": "后台工程师",
   "mobile": "15913215421",
   "gender": "1",
   "email": "zhangsan@gzdev.com",
   "weixinid": "lisifordev",  
   "avatar": "http://wx.qlogo.cn/mmopen/ajNVdqHZLLA3WJ6DSZUfiakYe37PKnQhBIeOQBO4czqrnZDS79FH5Wm5m4X69TBicnHFlhiafvDwklOpZeXYQQ2icg/0",
   "status": 1,
   "extattr": {"attrs":[{"name":"爱好","value":"旅游"},{"name":"卡号","value":"1234567234"}]}
}
```

### 公众号、企业号微信支付

[参考文档](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=7_1)
[支付流程](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=7_4)
[微信JS-SDK文档(企业号)](http://qydev.weixin.qq.com/wiki/index.php?title=%E5%BE%AE%E4%BF%A1JS-SDK%E6%8E%A5%E5%8F%A3#.E9.99.84.E5.BD.951-JS-SDK.E4.BD.BF.E7.94.A8.E6.9D.83.E9.99.90.E7.AD.BE.E5.90.8D.E7.AE.97.E6.B3.95)




### 支付成功微信通知参数：
<xml>
    <appid><![CDATA[wx6df13e8f887238fa]]></appid>
    <attach><![CDATA[学生班车票支付]]></attach>
    <bank_type><![CDATA[COMM_CREDIT]]></bank_type>
    <cash_fee><![CDATA[1]]></cash_fee>
    <fee_type><![CDATA[CNY]]></fee_type>
    <is_subscribe><![CDATA[N]]></is_subscribe>
    <mch_id><![CDATA[1236600802]]></mch_id>
    <nonce_str><![CDATA[e442cfbc7d7b8c6939bbd7e4cb50e341]]></nonce_str>
    <openid><![CDATA[oFDNowDYyl1KFVWD757Souh52UFw]]></openid>
    <out_trade_no><![CDATA[3b13c6c096ce11e68eb9af054806eeac]]></out_trade_no>
    <result_code><![CDATA[SUCCESS]]></result_code>
    <return_code><![CDATA[SUCCESS]]></return_code>
    <sign><![CDATA[4F06B02FA2048BF3D56FE2ADB861C22B]]></sign>
    <sub_appid><![CDATA[wx730c1aa34cf616dc]]></sub_appid>
    <sub_is_subscribe><![CDATA[Y]]></sub_is_subscribe>
    <sub_mch_id><![CDATA[1398608802]]></sub_mch_id>
    <sub_openid><![CDATA[orN5pszX26PmxvQiPA-_gFHMoFtQ]]></sub_openid>
    <time_end><![CDATA[20161020220527]]></time_end>
    <total_fee>1</total_fee>
    <trade_type><![CDATA[JSAPI]]></trade_type>
    <transaction_id><![CDATA[4006522001201610207247131526]]></transaction_id>
</xml>


*************************
<xml><appid><![CDATA[wx6df13e8f887238fa]]></appid>
<attach><![CDATA[[object Object]]]></attach>
<bank_type><![CDATA[COMM_CREDIT]]></bank_type>
<cash_fee><![CDATA[1]]></cash_fee>
<fee_type><![CDATA[CNY]]></fee_type>
<is_subscribe><![CDATA[N]]></is_subscribe>
<mch_id><![CDATA[1236600802]]></mch_id>
<nonce_str><![CDATA[e442cfbc7d7b8c6939bbd7e4cb50e341]]></nonce_str>
<openid><![CDATA[oFDNowDYyl1KFVWD757Souh52UFw]]></openid>
<out_trade_no><![CDATA[92977bb0973911e6adf1f1e249b2d2fa]]></out_trade_no>
<result_code><![CDATA[SUCCESS]]></result_code>
<return_code><![CDATA[SUCCESS]]></return_code>
<sign><![CDATA[FC3C6660A30CD2C0F877F7C3930C3B07]]></sign>
<sub_appid><![CDATA[wx730c1aa34cf616dc]]></sub_appid>
<sub_is_subscribe><![CDATA[Y]]></sub_is_subscribe>
<sub_mch_id><![CDATA[1398608802]]></sub_mch_id>
<sub_openid><![CDATA[orN5pszX26PmxvQiPA-_gFHMoFtQ]]></sub_openid>
<time_end><![CDATA[20161021105349]]></time_end>
<total_fee>1</total_fee>
<trade_type><![CDATA[JSAPI]]></trade_type>
<transaction_id><![CDATA[4006522001201610217276800533]]></transaction_id>
</xml>
{"xml":{"appid":"wx6df13e8f887238fa","attach":"[object Object]","bank_type":"COMM_CREDIT","cash_fee":"1","fee_type":"CNY","is_subscribe":"N","mch_id":"1236600802","nonce_str":"e442cfbc7d7b8c6939bbd7e4cb50e341","openid":"oFDNowDYyl1KFVWD757Souh52UFw","out_trade_no":"92977bb0973911e6adf1f1e249b2d2fa","result_code":"SUCCESS","return_code":"SUCCESS","sign":"FC3C6660A30CD2C0F877F7C3930C3B07","sub_appid":"wx730c1aa34cf616dc","sub_is_subscribe":"Y","sub_mch_id":"1398608802","sub_openid":"orN5pszX26PmxvQiPA-_gFHMoFtQ","time_end":"20161021105349","total_fee":"1","trade_type":"JSAPI","transaction_id":"4006522001201610217276800533"}}
