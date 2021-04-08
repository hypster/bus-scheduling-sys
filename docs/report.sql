
-- 统计每个批次售票张数、退票、使用张数、过期张数

SELECT DB.serial_no `批次编号`,DB.start_time `批次开始时间`,DB.end_time `批次结束时间`,T.`售票张数`,T.`退票`,T.`使用张数`,T.`过期张数` FROM dispatch_batch DB 
LEFT JOIN (
	SELECT T1.*,ifnull(T2.`退票`, 0) `退票`,ifnull(T3.`使用张数`, 0) `使用张数`,ifnull(T4.`过期张数`, 0) `过期张数` FROM (
		-- 售票张数
		SELECT DD.batch_id,count(1) as '售票张数' FROM ticket T
		INNER JOIN `order` O ON T.order_id=O.id
		INNER JOIN dispatch_detail DD ON T.dispatch_detail_id=DD.id
		WHERE O.status=1
		GROUP BY DD.batch_id
	) AS T1
	LEFT JOIN (
		-- 退票
		SELECT DD.batch_id,count(1) as '退票' FROM ticket T
		INNER JOIN `order` O ON T.order_id=O.id
		INNER JOIN dispatch_detail DD ON T.dispatch_detail_id=DD.id
		WHERE O.status=1 AND T.status=3
		GROUP BY DD.batch_id
	) AS T2 ON T1.batch_id=T2.batch_id
	LEFT JOIN (
		-- 使用张数
		SELECT DD.batch_id,count(1) as '使用张数' FROM ticket T
		INNER JOIN `order` O ON T.order_id=O.id
		INNER JOIN dispatch_detail DD ON T.dispatch_detail_id=DD.id
		WHERE O.status=1 AND T.status=1
		GROUP BY DD.batch_id
	) AS T3 ON T1.batch_id=T3.batch_id
	LEFT JOIN (
		-- 过期张数
		SELECT DD.batch_id,count(1) as '过期张数' FROM ticket T
		INNER JOIN `order` O ON T.order_id=O.id
		INNER JOIN dispatch_detail DD ON T.dispatch_detail_id=DD.id
		WHERE O.status=1 AND T.status=2
		GROUP BY DD.batch_id
	) AS T4 ON T1.batch_id=T4.batch_id
) AS T ON DB.id=T.batch_id
WHERE DB.isDel=0 AND DB.end_time<now()
ORDER BY DB.start_time;


-- 各批次按日期检票数统计
SELECT DB.start_time as '批次开始时间',DB.end_time as '批次结束时间',B.license_plate as '车号',T.check_time as '检票日期',T.`使用张数` FROM dispatch_batch as DB
INNER JOIN (
	SELECT DD.batch_id,T.take_bus_id,date_format(T.check_time, '%Y/%m/%d') as check_time,count(1) as '使用张数' FROM ticket T
	INNER JOIN `order` O ON T.order_id=O.id
	INNER JOIN dispatch_detail DD ON T.dispatch_detail_id=DD.id
	WHERE O.status=1 AND T.status=1
	GROUP BY DD.batch_id,T.take_bus_id,date_format(T.check_time, '%Y/%m/%d')
) as T ON DB.id=T.batch_id 
INNER JOIN bus as B ON T.take_bus_id=B.id
WHERE B.company_id='b64881c0-a0c7-11e6-a324-87ec8be7e803'
ORDER BY B.license_plate;-- T.check_time;


-- 过期票数量统计（按公司）
SELECT C.name as '公司名称',count(1) as '过期张数' FROM ticket T
INNER JOIN `order` O ON T.order_id=O.id
INNER JOIN dispatch_detail DD ON T.dispatch_detail_id=DD.id
INNER JOIN schedule S ON DD.schedule_id=S.id
INNER JOIN company C ON S.company_id=C.id
WHERE O.status=1 AND T.status=2
-- AND DD.start_time>='2016/12/30 00:00:00' AND DD.start_time<='2017/01/02 23:59:59'
GROUP BY C.name

-- 售票明细及使用状态统计：购票时间 姓名 校园卡号 班次 金额 公司 使用状态 使用时间
SELECT 
	`T`.`create_time` AS `购票日期`,
	`U`.`name` AS `姓名`,
	`U`.`corp_user_id` AS `校园卡号`,
	CASE date_format(`S`.`end_time`, '%H:%i')
		WHEN '00:00' THEN CONCAT(`BL`.`name`, ' ', date_format(`S`.`begin_time`, '%H:%i'))
		ELSE CONCAT(`BL`.`name`, ' ', date_format(`S`.`begin_time`, '%H:%i'), '-', date_format(`S`.`end_time`, '%H:%i'))
	END AS `班次`,
    `T`.`price` as '金额',
    `C`.`name` as '公司',
	CASE `T`.`status` 
		WHEN 0 THEN '未使用'
		WHEN 1 THEN '已使用'
		WHEN 2 THEN '已过期'
		WHEN 3 THEN '已退票'
	END AS `使用状态`,
    `T`.`check_time` AS `使用时间`
FROM
	(((((((((`ticket` `T`
	JOIN `order` `O` ON ((`T`.`order_id` = `O`.`id`)))
	JOIN `user` `U` ON ((`O`.`user_id` = `U`.`id`)))
	JOIN `dispatch_detail` `DD` ON ((`T`.`dispatch_detail_id` = `DD`.`id`)))
	JOIN `dispatch_batch` `DB` ON ((`DD`.`batch_id` = `DB`.`id`)))
	JOIN `schedule` `S` ON ((`DD`.`schedule_id` = `S`.`id`)))
	JOIN `company` `C` ON ((`S`.`company_id` = `C`.`id`)))
	JOIN `bus_line` `BL` ON ((`S`.`bus_line_id` = `BL`.`id`)))
	JOIN `station` `SS` ON ((`BL`.`start_station_id` = `SS`.`id`)))
	JOIN `station` `TS` ON ((`BL`.`terminal_station_id` = `TS`.`id`)))
WHERE `O`.`status`=1
ORDER BY `DD`.`start_time`, `S`.`begin_time`, `T`.`create_time`;
