建立连接：获取AccessToken
请求地址： https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=wx376ba433d3711289&corpsecret=twoZxNM_ZLBoY0lE_huJs3Vhv5O_REpQakjI3E_Dz9OP-n11scvke22c0YbXhfME
返回结果： HTTP/1.0 200 OK
Connection: close
Content-Type: application/json; charset=utf-8
Cache-Control: no-cache
Pragma: no-cache
Content-Length: 101
 {"access_token":"JPVvMO7MeknrOYDO7Xb9rlX_9SteRNGqJBYMatI-APPoHqo-Vrnn8A_QdUMkDYbY","expires_in":7200}


 880d0af38c2ca16c2bb2ca132ae33b72

 {"UserId":"1000010721","DeviceId":"15def1544ef98bf5e0027bf9422e996a"}
 


 -- 班车公司管理员
 SELECT * FROM devtest.admin;

INSERT INTO admin VALUES (uuid(), '4541db30-c74a-11e6-9d64-b5f01e6c33cd', 0, 'zhongya', '70d6c53fc72ef24e04cbde4491ca90a7', '中亚', '', 0, now());
INSERT INTO admin VALUES (uuid(), '9a3b7760-c748-11e6-9d64-b5f01e6c33cd', 0, 'haibo', '167cc459e9f6517a440ae7f0f58802b0', '海博', '', 0, now());
INSERT INTO admin VALUES (uuid(), 'b12f5220-b14f-11e6-a99e-658a21087dee', 0, 'jiutong', '69bf680d1eca0ea849db33bf324f2f3f', '久通', '', 0, now());
