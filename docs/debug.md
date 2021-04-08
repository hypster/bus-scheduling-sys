## xml2json 安装失败：Failed at the node-expat@2.3.15 install script 'node-gyp rebuild'.
```
解决方法：
make: cc：命令未找到：
yum -y install gcc automake autoconf libtool make

make: g++：命令未找到：
yum install gcc-c++
```


document.cookie = "auth_url=https%3A//open.weixin.qq.com/connect/oauth2/authorize%3Fappid%3Dwx376ba433d3711289%26redirect_uri%3Dqclouddev.shnu.edu.cn%252fapi%252fwechat%252fauth%26response_type%3Dcode%26scope%3Dsnsapi_base%26state%3D/user/entry.html%23wechat_redirect";
document.cookie = "authed_user=%7B%22id%22%3A%22996dcdd0-92a8-11e6-87a3-cb75492e58ea%22%2C%22type%22%3A1%2C%22corp_user_id%22%3A%221000010721%22%2C%22corp_user_detail%22%3A%22%7B%5C%22errcode%5C%22%3A0%2C%5C%22errmsg%5C%22%3A%5C%22ok%5C%22%2C%5C%22userid%5C%22%3A%5C%221000010721%5C%22%2C%5C%22name%5C%22%3A%5C%22%E9%BB%84%E4%BF%8A%E9%93%AD%5C%22%2C%5C%22department%5C%22%3A%5B12%5D%2C%5C%22mobile%5C%22%3A%5C%2218616864521%5C%22%2C%5C%22gender%5C%22%3A%5C%221%5C%22%2C%5C%22avatar%5C%22%3A%5C%22http%3A%2F%2Fshp.qpic.cn%2Fbizmp%2Fs2XiajN9hH4RwLon5h4YGZYXovibOWHb9bOD0YRoicLkNfTtZuyHiaZmWw%2F%5C%22%2C%5C%22status%5C%22%3A1%2C%5C%22extattr%5C%22%3A%7B%5C%22attrs%5C%22%3A%5B%5D%7D%2C%5C%22openid%5C%22%3A%5C%22oNwpSs2wRl1J4NKJruu8InTdcOQ4%5C%22%7D%22%2C%22openid%22%3A%22oNwpSs2wRl1J4NKJruu8InTdcOQ4%22%2C%22unionid%22%3A%22%22%2C%22name%22%3A%22%E9%BB%84%E4%BF%8A%E9%93%AD%22%2C%22phone%22%3A%2218616864521%22%2C%22campus%22%3A%22%22%2C%22balance%22%3A0%2C%22status%22%3A0%2C%22create_time%22%3A%222016-10-15T07%3A25%3A51.000Z%22%7D";

{"errcode":60011,"errmsg":"no privilege to access\/modify contact\/party\/agent "}

postData
"\n    <xml>\n      <appid>wx730c1aa34cf616dc</appid>\n      <attach>undefined</attach>\n      <body>undefined</body>\n      <mch_id>1236600802</mch_id>\n      <detail><![CDATA[{\"goods_detail\":[{\"goods_id\":\"c149f75096a111e68ba26928402cae27\",\"goods_name\":\"徐汇校区→人民广场\",\"price\":12}]}]]></detail>\n      <nonce_str>e442cfbc7d7b8c6939bbd7e4cb50e341</nonce_str>\n      <notify_url>http://qclouddev.shnu.edu.cn/api/orders/pay_notify</notify_url>\n      <openid>orN5pszX26PmxvQiPA-_gFHMoFtQ</openid>\n      <out_trade_no>c1405a6096a111e68ba26928402cae27</out_trade_no>\n      <spbill_create_ip>undefined</spbill_create_ip>\n      <total_fee>1200</total_fee>\n      <trade_type>undefined</trade_type>\n      <sign>D8FD4747BD822BF1EA2C106FCAE433A4</sign>\n    </xml>"
data
"<xml><return_code><![CDATA[FAIL]]></return_code>\n<return_msg><![CDATA[trade_type参数格式错误]]></return_msg>\n</xml>"
<xml><return_code><![CDATA[FAIL]]></return_code>\n<return_msg><![CDATA[受理机构必须传入sub_mch_id]]></return_msg>\n</xml>
"<xml><return_code><![CDATA[FAIL]]></return_code>\n<return_msg><![CDATA[商户号mch_id与appid不匹配]]></return_msg>\n</xml>"



"appid=wx6df13e8f887238fa&attach=学生班车票支付&body=学生班车-车票支付&mch_id=1236600802&nonce_str=e442cfbc7d7b8c6939bbd7e4cb50e341&notify_url=http://qclouddev.shnu.edu.cn/api/orders/pay_notify&openid=orN5pszX26PmxvQiPA-_gFHMoFtQ&out_trade_no=7182c51096a311e6a4817d871123f583&spbill_create_ip=::1&sub_mch_id=1398608802&total_fee=1200&trade_type=JSAPI&key=e442cfbc7d7b8c6939bbd7e4cb50e341"
<sign>C841CE78ECAEDCB8E46EFE2693F14835</sign>

# 微信支付 签名校验
#1.对参数按照key=value的格式，并按照参数名ASCII字典序排序生成字符串：
appid=wx6df13e8f887238fa&attach=学生班车票支付&body=学生班车-车票支付&detail={"goods_detail":[{"goods_id":"718731e096a311e6a4817d871123f583","goods_name":"徐汇校区→人民广场","price":12}]}&mch_id=1236600802&nonce_str=e442cfbc7d7b8c6939bbd7e4cb50e341&notify_url=http://qclouddev.shnu.edu.cn/api/orders/pay_notify&openid=orN5pszX26PmxvQiPA-_gFHMoFtQ&out_trade_no=7182c51096a311e6a4817d871123f583&spbill_create_ip=::1&sub_mch_id=1398608802&total_fee=1200&trade_type=JSAPI
我的：（原来detail里面的xml注释不需要。。。）
appid=wx6df13e8f887238fa&attach=学生班车票支付&body=学生班车-车票支付&detail=<![CDATA[{\"goods_detail\":[{\"goods_id\":\"718731e096a311e6a4817d871123f583\",\"goods_name\":\"徐汇校区→人民广场\",\"price\":12}]}]]>&mch_id=1236600802&nonce_str=e442cfbc7d7b8c6939bbd7e4cb50e341&notify_url=http://qclouddev.shnu.edu.cn/api/orders/pay_notify&openid=orN5pszX26PmxvQiPA-_gFHMoFtQ&out_trade_no=7182c51096a311e6a4817d871123f583&spbill_create_ip=::1&sub_mch_id=1398608802&total_fee=1200&trade_type=JSAPI&key=e442cfbc7d7b8c6939bbd7e4cb50e341

#2.连接商户key：
appid=wx6df13e8f887238fa&attach=学生班车票支付&body=学生班车-车票支付&detail={"goods_detail":[{"goods_id":"718731e096a311e6a4817d871123f583","goods_name":"徐汇校区→人民广场","price":12}]}&mch_id=1236600802&nonce_str=e442cfbc7d7b8c6939bbd7e4cb50e341&notify_url=http://qclouddev.shnu.edu.cn/api/orders/pay_notify&openid=orN5pszX26PmxvQiPA-_gFHMoFtQ&out_trade_no=7182c51096a311e6a4817d871123f583&spbill_create_ip=::1&sub_mch_id=1398608802&total_fee=1200&trade_type=JSAPI&key=e442cfbc7d7b8c6939bbd7e4cb50e341

#3.md5编码并转成大写：
sign=CCC952E1045FDD40D322FDE638500431

#4.md5校验结果：
原sign值:DBA74FECAAEE2313DE7CC286C911CE29
新sign值:CCC952E1045FDD40D322FDE638500431

校验不通过,请按步骤校验签名过程

# 统一下单返回成功
<xml><return_code><![CDATA[SUCCESS]]></return_code>
<return_msg><![CDATA[OK]]></return_msg>
<appid><![CDATA[wx6df13e8f887238fa]]></appid>
<mch_id><![CDATA[1236600802]]></mch_id>
<sub_mch_id><![CDATA[1398608802]]></sub_mch_id>
<nonce_str><![CDATA[VEmPIHdY0FfzjNtV]]></nonce_str>
<sign><![CDATA[E581E5A32A61FB3E2FABAD124E4E2548]]></sign>
<result_code><![CDATA[SUCCESS]]></result_code>
<prepay_id><![CDATA[wx201610201743347300edf11c0651115876]]></prepay_id>
<trade_type><![CDATA[JSAPI]]></trade_type>
<sub_appid><![CDATA[wx730c1aa34cf616dc]]></sub_appid>
</xml>
{ 
  return_code: 'SUCCESS',
  return_msg: 'OK',
  appid: 'wx6df13e8f887238fa',
  mch_id: '1236600802',
  sub_mch_id: '1398608802',
  nonce_str: 'VEmPIHdY0FfzjNtV',
  sign: 'E581E5A32A61FB3E2FABAD124E4E2548',
  result_code: 'SUCCESS',
  prepay_id: 'wx201610201743347300edf11c0651115876',
  trade_type: 'JSAPI',
  sub_appid: 'wx730c1aa34cf616dc' 
}





// 清除用户数据
-- SET SQL_SAFE_UPDATES=0;
-- DELETE FROM devtest.`schedule`;
-- DELETE FROM devtest.`dispatch_batch`;
-- DELETE FROM devtest.`dispatch_detail`;
-- DELETE FROM devtest.`order`;
-- DELETE FROM devtest.`ticket`;
-- DELETE FROM devtest.`order_payment`;

-- SET SQL_SAFE_UPDATES=0;
-- DELETE FROM devtest.`bus`;
-- DELETE FROM devtest.`bus_line`;
-- DELETE FROM devtest.`company`;
-- DELETE FROM devtest.`dispatch_batch`;
-- DELETE FROM devtest.`dispatch_detail`;
-- DELETE FROM devtest.`info`;
-- DELETE FROM devtest.`order`;
-- DELETE FROM devtest.`order_payment`;
-- DELETE FROM devtest.`schedule`;
-- DELETE FROM devtest.`station`;
-- DELETE FROM devtest.`ticket`;

SELECT * FROM devtest.`user`;
SELECT * FROM devtest.`order`;
SELECT * FROM devtest.`ticket`;
SELECT * FROM devtest.`order_payment`;



corpid: 'wx730c1aa34cf616dc',
corpsecret: 'g50-KIlUZw3VYRcprXwD9QD5OMPU_F_NdXCZEA2S6UL_BiHfwpFlBbyqAXvFu5u9',
redirect_uri: 'qclouddev.shnu.edu.cn%2fapi%2fwechat%2fauth',

https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=wx730c1aa34cf616dc&corpsecret=g50-KIlUZw3VYRcprXwD9QD5OMPU_F_NdXCZEA2S6UL_BiHfwpFlBbyqAXvFu5u9
https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx730c1aa34cf616dc&redirect_uri=qclouddev.shnu.edu.cn%2fapi%2fwechat%2fauth&response_type=code&scope=snsapi_base&state=state#wechat_redirect

2QB-YyyG3quYg870WZGKf8vMxH2OhJ5ntvbFQeTUdOmF-slbd999l2KrVv1BLNJ7
57c900d2128bc330bd9b3054a27ef3c4
https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=2QB-YyyG3quYg870WZGKf8vMxH2OhJ5ntvbFQeTUdOmF-slbd999l2KrVv1BLNJ7&code=57c900d2128bc330bd9b3054a27ef3c4



锁表：
| 2704748 | StuBus | 10.154.58.58:48126  | StuBus | Query   |   31 | updating     | UPDATE `order` SET status=1 WHERE id='df84bdb0-aae5-11e6-a1f0-670ff0898726'                          |
| 2704804 | StuBus | 10.154.58.58:48141  | StuBus | Query   |   19 | Sending data | UPDATE ticket T1 INNER JOIN v_ticket T2 ON T1.id=T2.id SET T1.status=2 WHERE ((T2.is_pre_order=0 AND |



-- SHOW ENGINE INNODB STATUS;


查看未提交的事务：

USE INFORMATION_SCHEMA;
SELECT * FROM INNODB_TRX
ORDER BY trx_started;




-- 查询重复账号
SELECT id,openid,name,balance,create_time FROM StuBus.user WHERE openid in (
	SELECT openid FROM StuBus.user
	GROUP BY openid
	HAVING count(1)>1
	ORDER BY count(1) DESC
) ORDER BY openid,create_time;


-- 查询重复账号有订单数据的账号信息
SELECT * FROM (
	SELECT U.id,U.openid,U.name,U.balance,U.create_time,(SELECT COUNT(1) FROM StuBus.`order` WHERE user_id=U.id) as order_count FROM StuBus.user as U
	WHERE openid in (
		SELECT openid FROM StuBus.user
		GROUP BY openid
		HAVING count(1)>1
		ORDER BY count(1) DESC
	)-- ORDER BY openid,create_time;
) AS U ORDER BY order_count DESC;


-- 查看重复账号中、是用哪条用户数据买票的
SELECT U.id,U.openid,U.name,U.balance,U.create_time,(SELECT COUNT(1) FROM StuBus.`order` WHERE user_id=U.id) as order_count FROM StuBus.user as U 
WHERE U.openid IN (
	SELECT openid FROM (
		SELECT U.id,U.openid,U.name,U.balance,U.create_time,(SELECT COUNT(1) FROM StuBus.`order` WHERE user_id=U.id) as order_count FROM StuBus.user as U
		WHERE openid in (
			SELECT openid FROM StuBus.user
			GROUP BY openid
			HAVING count(1)>1
			ORDER BY count(1) DESC
		)-- ORDER BY openid,create_time;
	) AS U 
	WHERE order_count>0
) ORDER BY openid;


id, openid, name, balance, create_time, order_count
'8ca8f640-aad8-11e6-8f42-016943dd18d6','orN5ps-9rGgNP4r7VKQ3RTO2EFMw','赵涵璐','0.00','2016-11-15 10:09:33','1'
'8cb63cb0-aad8-11e6-8f42-016943dd18d6','orN5ps-9rGgNP4r7VKQ3RTO2EFMw','赵涵璐','0.00','2016-11-15 10:09:33','0'
'dd2328e0-ac57-11e6-a14a-253289feacfd','orN5ps2riIPAVSO50ZpgrMpsgD5I','韩家洛','0.00','2016-11-17 07:53:25','0'
'dd31cee0-ac57-11e6-a14a-253289feacfd','orN5ps2riIPAVSO50ZpgrMpsgD5I','韩家洛','0.00','2016-11-17 07:53:25','1'
'207ae300-aa0d-11e6-9587-47d978a1bbf8','orN5ps3cpCex_Mdiw9vDAJbz1vac','高淑君','0.00','2016-11-14 09:53:24','1'
'207b5830-aa0d-11e6-9587-47d978a1bbf8','orN5ps3cpCex_Mdiw9vDAJbz1vac','高淑君','0.00','2016-11-14 09:53:24','0'
'be766f50-ac76-11e6-a14a-253289feacfd','orN5ps3phsetyyZ9yJwZrMmE--WE','曹子奕','0.00','2016-11-17 11:34:28','1'
'be8dc7e0-ac76-11e6-a14a-253289feacfd','orN5ps3phsetyyZ9yJwZrMmE--WE','曹子奕','0.00','2016-11-17 11:34:28','0'
'75da2d90-ac76-11e6-a14a-253289feacfd','orN5ps4hvw9NFZSuFdcdNcHLz_H0','张鹏','0.00','2016-11-17 11:32:26','2'
'75f2e5b0-ac76-11e6-a14a-253289feacfd','orN5ps4hvw9NFZSuFdcdNcHLz_H0','张鹏','0.00','2016-11-17 11:32:27','0'
'd69447f0-ac72-11e6-a14a-253289feacfd','orN5ps4PBNH79RYCQqkl0ViWC6PI','任丹凤','0.00','2016-11-17 11:06:31','2'
'd78a8ed0-ac72-11e6-a14a-253289feacfd','orN5ps4PBNH79RYCQqkl0ViWC6PI','任丹凤','0.00','2016-11-17 11:06:32','0'
'ed761010-a679-11e6-9d86-8f5ca8000ad9','orN5ps5-JQjs9xljLu8kktiLxmpg','甄明佳','0.00','2016-11-09 20:42:09','1'
'ed763720-a679-11e6-9d86-8f5ca8000ad9','orN5ps5-JQjs9xljLu8kktiLxmpg','甄明佳','0.00','2016-11-09 20:42:09','0'
'f7011210-aad4-11e6-a306-a9f5def41b34','orN5ps5-VTv9ePLHSo4VPC3Uth80','沈依迪','0.00','2016-11-15 09:43:54','4'
'f240f1f0-aad4-11e6-a306-a9f5def41b34','orN5ps5-VTv9ePLHSo4VPC3Uth80','沈依迪','0.00','2016-11-15 09:43:46','0'
'f258e6c0-aad4-11e6-a306-a9f5def41b34','orN5ps5-VTv9ePLHSo4VPC3Uth80','沈依迪','0.00','2016-11-15 09:43:46','0'
'c9625600-aae0-11e6-8f42-016943dd18d6','orN5psyJZ7vfsdVGV3_gvWpxBHBQ','乔菲儿','84.00','2016-11-15 11:08:31','2'
'cc08bde0-aae0-11e6-8f42-016943dd18d6','orN5psyJZ7vfsdVGV3_gvWpxBHBQ','乔菲儿','0.00','2016-11-15 11:08:35','0'
'e2f9b270-aae0-11e6-8f42-016943dd18d6','orN5psyJZ7vfsdVGV3_gvWpxBHBQ','乔菲儿','0.00','2016-11-15 11:09:14','0'
'ea1a57d0-aae0-11e6-8f42-016943dd18d6','orN5psyJZ7vfsdVGV3_gvWpxBHBQ','乔菲儿','0.00','2016-11-15 11:09:26','0'
'eb0246d0-aae0-11e6-8f42-016943dd18d6','orN5psyJZ7vfsdVGV3_gvWpxBHBQ','乔菲儿','0.00','2016-11-15 11:09:27','0'
'071e7960-aae1-11e6-8f42-016943dd18d6','orN5psyJZ7vfsdVGV3_gvWpxBHBQ','乔菲儿','0.00','2016-11-15 11:10:15','0'
'085db020-aae1-11e6-8f42-016943dd18d6','orN5psyJZ7vfsdVGV3_gvWpxBHBQ','乔菲儿','0.00','2016-11-15 11:10:17','0'


-- 重复账号中，未买过票的账号
SELECT * FROM (
	SELECT U.id,U.openid,U.name,U.balance,U.create_time,(SELECT COUNT(1) FROM StuBus.`order` WHERE user_id=U.id) as order_count FROM StuBus.user as U 
	WHERE U.openid IN (
		SELECT openid FROM (
			SELECT U.id,U.openid,U.name,U.balance,U.create_time,(SELECT COUNT(1) FROM StuBus.`order` WHERE user_id=U.id) as order_count FROM StuBus.user as U
			WHERE openid in (
				SELECT openid FROM StuBus.user
				GROUP BY openid
				HAVING count(1)>1
				ORDER BY count(1) DESC
			)-- ORDER BY openid,create_time;
		) AS U 
		WHERE order_count=0
	) ORDER BY openid
) AS U WHERE order_count=0
ORDER BY openid


-- 查询已过期的票
SELECT T1.* FROM ticket T1
	INNER JOIN v_ticket T2 ON T1.id=T2.id
	WHERE ((T2.is_pre_order=0 AND T2.status=0) OR (T2.is_pre_order=1 AND T2.pre_order_status=1 AND T2.status=0))
	AND T2.`O.status`=1
	AND date_format(date_add(T2.`DD.start_time`, interval 1 day), '%y/%m/%d')<=date_format(now(), '%y/%m/%d')


USE StuBus;
SET SQL_SAFE_UPDATES=0;
UPDATE ticket T1
  INNER JOIN v_ticket T2 ON T1.id=T2.id
  SET T1.status=2
  WHERE ((T2.is_pre_order=0 AND T2.status=0) OR (T2.is_pre_order=1 AND T2.pre_order_status=1 AND T2.status=0))
  AND T2.`O.status`=1
  AND date_format(date_add(T2.`DD.start_time`, interval 1 day), '%y/%m/%d')<=date_format(now(), '%y/%m/%d');

-- 已过期的票（2016年11月21号）
'329e7ec0-aa12-11e6-9587-47d978a1bbf8', '20161114102941382646', '329e30a0-aa12-11e6-9587-47d978a1bbf8', '484fcc90-aa00-11e6-a7ba-ef34a5171528', '12.00', '1', '0', '0', '0', '0', NULL, NULL, NULL, '', '2016-11-14 10:29:42', '0'
'2ea272f0-ac78-11e6-a14a-253289feacfd', '20161117114445883465', '2ea05010-ac78-11e6-a14a-253289feacfd', '484fcc90-aa00-11e6-a7ba-ef34a5171528', '12.00', '1', '0', '0', '0', '0', NULL, NULL, NULL, '', '2016-11-17 11:44:46', '0'
'a44c5250-aa11-11e6-9587-47d978a1bbf8', '20161114102542939525', 'a44c0430-aa11-11e6-9587-47d978a1bbf8', '484fcc90-aa00-11e6-a7ba-ef34a5171528', '12.00', '1', '0', '0', '0', '0', NULL, NULL, NULL, '', '2016-11-14 10:25:43', '0'
'a04acfd0-aa28-11e6-bf96-2b9038f33c0b', '20161114131014312367', 'a0426b60-aa28-11e6-bf96-2b9038f33c0b', '484fcc90-aa00-11e6-a7ba-ef34a5171528', '12.00', '1', '0', '0', '0', '0', NULL, NULL, NULL, '', '2016-11-14 13:10:15', '0'
'98ed0d50-aa1b-11e6-b8c9-f79168f22434', '20161114113658270320', '98ecbf30-aa1b-11e6-b8c9-f79168f22434', '484fcc90-aa00-11e6-a7ba-ef34a5171528', '12.00', '1', '0', '0', '0', '0', NULL, NULL, NULL, '', '2016-11-14 11:36:59', '0'
'8b4183d0-aa24-11e6-a537-59fc9c50b024', '20161114124101548751', '8b4135b0-aa24-11e6-a537-59fc9c50b024', '484fcc90-aa00-11e6-a7ba-ef34a5171528', '12.00', '1', '0', '0', '0', '0', NULL, NULL, NULL, '', '2016-11-14 12:41:01', '0'
'7ee86030-aa07-11e6-a7ba-ef34a5171528', '20161114091305127188', '7ee81210-aa07-11e6-a7ba-ef34a5171528', '484fcc90-aa00-11e6-a7ba-ef34a5171528', '12.00', '1', '0', '0', '0', '0', NULL, NULL, NULL, '', '2016-11-14 09:13:05', '0'
'63e40110-aa19-11e6-b8c9-f79168f22434', '20161114112110595608', '63e3da00-aa19-11e6-b8c9-f79168f22434', '484fcc90-aa00-11e6-a7ba-ef34a5171528', '12.00', '1', '0', '0', '0', '0', NULL, NULL, NULL, '', '2016-11-14 11:21:11', '0'
'f46381d0-aaea-11e6-a1f0-670ff0898726', '20161115122118782883', 'f4635ac0-aaea-11e6-a1f0-670ff0898726', '484fcc90-aa00-11e6-a7ba-ef34a5171528', '12.00', '1', '0', '0', '0', '0', NULL, NULL, NULL, '', '2016-11-15 12:21:18', '0'
'ec25df50-aa1c-11e6-b8c9-f79168f22434', '20161114114627648924', 'ec25b840-aa1c-11e6-b8c9-f79168f22434', '484fcc91-aa00-11e6-a7ba-ef34a5171528', '12.00', '1', '0', '0', '0', '0', NULL, NULL, NULL, '', '2016-11-14 11:46:28', '0'
'd8360e10-aa22-11e6-a537-59fc9c50b024', '20161114122851274211', 'd835bff0-aa22-11e6-a537-59fc9c50b024', '484fcc91-aa00-11e6-a7ba-ef34a5171528', '12.00', '1', '0', '0', '0', '0', NULL, NULL, NULL, '', '2016-11-14 12:28:51', '0'
'11935610-aa21-11e6-a537-59fc9c50b024', '20161114121608958029', '11932f00-aa21-11e6-a537-59fc9c50b024', '484fcc91-aa00-11e6-a7ba-ef34a5171528', '12.00', '1', '0', '0', '0', '0', NULL, NULL, NULL, '', '2016-11-14 12:16:09', '0'
'96311600-aae9-11e6-a1f0-670ff0898726', '20161115121130165811', '9630eef0-aae9-11e6-a1f0-670ff0898726', '484fcc91-aa00-11e6-a7ba-ef34a5171528', '12.00', '1', '0', '0', '0', '0', NULL, NULL, NULL, '', '2016-11-15 12:11:31', '0'
'75491570-aae7-11e6-a1f0-670ff0898726', '20161115115616426254', '7548ee60-aae7-11e6-a1f0-670ff0898726', '484fcc91-aa00-11e6-a7ba-ef34a5171528', '12.00', '1', '0', '0', '0', '0', NULL, NULL, NULL, '', '2016-11-15 11:56:16', '0'
'4fd49e80-ac0f-11e6-a14a-253289feacfd', '20161116231404821097', '4fd47770-ac0f-11e6-a14a-253289feacfd', '484fcc91-aa00-11e6-a7ba-ef34a5171528', '12.00', '1', '0', '0', '0', '0', NULL, NULL, NULL, '', '2016-11-16 23:14:05', '0'



-- 手动检票
USE StuBus;
SET SQL_SAFE_UPDATES=0;

SELECT * FROM ticket 
-- UPDATE ticket SET status=1,take_bus_id='09e601ee-aa80-11e6-9982-a4dcbef43b9a',check_time=now()
WHERE id='623d3700-af8c-11e6-8735-81b6859f2688' AND serial_no='20161121094655822864';


-- 查询用户在一段时间内购买同车次票的张数
SELECT U.name, T.Count FROM StuBus.user as U
INNER JOIN (
	SELECT O.user_id, T.dispatch_detail_id, count(1) as Count FROM `order` as O
	INNER JOIN ticket as T ON O.id=T.order_id
	where O.status=1 AND O.create_time>'2016/11/20' AND T.status IN (0,1)
	GROUP BY O.user_id, T.dispatch_detail_id
	HAVING count(1)>1
	ORDER BY count(1) DESC
) AS T ON U.id=T.user_id

