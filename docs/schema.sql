
数据库备份：
```
alias mysql='/usr/local/mysql/bin/mysql'
alias mysqladmin='/usr/local/mysql/bin/mysqladmin'
alias mysqldump='/usr/local/mysql/bin/mysqldump'

// 生产环境
mysqldump -u StuBus -p -h 57e1d54841ad2.sh.cdb.myqcloud.com -P 3760 StuBus > StuBus-201611081100_prod.sql
```


CREATE SCHEMA `campus_bus` ;

/* 公司 */
CREATE TABLE `campus_bus`.`company` (
  `id` CHAR(36) NOT NULL,
  `name` NVARCHAR(64) NULL,
  `description` NVARCHAR(1024) NULL,
  PRIMARY KEY (`id`));

/* 班车信息 */
CREATE TABLE `campus_bus`.`bus` (
  `id` CHAR(36) NOT NULL,
  `company_id` CHAR(36) NOT NULL,
  `name` NVARCHAR(64) NOT NULL,
  `seat_count` INT NOT NULL,
  `license_plate` NVARCHAR(64) NOT NULL,
  `description` NVARCHAR(1024) NULL,
  `create_time` DATETIME NULL DEFAULT now(),
  PRIMARY KEY (`id`));

/* 站点 */
CREATE TABLE `campus_bus`.`station` (
  `id` CHAR(36) NOT NULL,
  `type` INT NULL DEFAULT 0,
  `name` NVARCHAR(64) NOT NULL,
  `description` NVARCHAR(1024) NULL,
  PRIMARY KEY (`id`));

/* 线路 */
CREATE TABLE `campus_bus`.`bus_line` (
  `id` CHAR(36) NOT NULL,
  `start_station_id` CHAR(36) NULL,
  `terminal_station_id` CHAR(36) NULL,
  `name` NVARCHAR(128) NULL,
  `description` NVARCHAR(1024) NULL,
  PRIMARY KEY (`id`));

/* 班次 */
CREATE TABLE `campus_bus`.`schedule` (
  `id` CHAR(36) NOT NULL,
  `company_id` CHAR(36) NOT NULL,
  `bus_line_id` CHAR(36) NULL,
  `begin_time` NVARCHAR(45) NULL,
  `end_time` NVARCHAR(45) NULL,
  `price` DECIMAL(10,2) NULL,
  `full_price` DECIMAL(10,2) NULL,
  `description` NVARCHAR(1024) NULL,
  PRIMARY KEY (`id`));

/* 派车批次 */
CREATE TABLE `campus_bus`.`dispatch_batch` (
  `id` CHAR(36) NOT NULL,
  `name` NVARCHAR(64) NOT NULL,
  `start_time` DATETIME NULL,
  `end_time` DATETIME NULL,
  `description` NVARCHAR(1024) NULL,
  `create_time` DATETIME NULL,
  PRIMARY KEY (`id`));

/* 派车明细 */
CREATE TABLE `campus_bus`.`dispatch_detail` (
  `batch_id` CHAR(36) NOT NULL,
  `schedule_id` CHAR(36) NOT NULL,
  `start_time` DATETIME NULL,
  `seat_count` INT NULL,
  `create_time` DATETIME NULL,
  PRIMARY KEY (`batch_id`, `schedule_id`));


/* 用户 */
CREATE TABLE `campus_bus`.`user` (
  `id` CHAR(36) NOT NULL,
  `type` INT NULL,
  `corp_user_id` NVARCHAR(64),
  `openid` NVARCHAR(64) NULL,
  `unionid` NVARCHAR(64) NULL,
  `name` NVARCHAR(64) NULL,
  `phone` NVARCHAR(64) NULL,
  `campus` NVARCHAR(128) NULL,
  `balance` DECIMAL(10,2) NULL,
  `status` INT NULL,
  `create_time` DATETIME NULL,
  PRIMARY KEY (`id`));

/* 订单 */
CREATE TABLE `campus_bus`.`order` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `status` INT NULL,
  `total` DECIMAL(10,2) NULL,
  `description` NVARCHAR(1024) NULL,
  `create_time` DATETIME NULL,
  PRIMARY KEY (`id`));

/* 车票明细 */
CREATE TABLE `campus_bus`.`ticket` (
  `id` CHAR(36) NOT NULL,
  `order_id` CHAR(36) NOT NULL,
  `schedule_id` CHAR(36) NOT NULL,
  `price` DECIMAL(10,2) NULL,
  `count` INT NULL,
  `is_pre_order` NVARCHAR(45) NULL,
  `pre_order_status` INT NULL,
  `status` INT NULL,
  `description` NVARCHAR(1024) NULL,
  `create_time` DATETIME NULL,
  PRIMARY KEY (`id`));

/* 订单支付记录 */
CREATE TABLE `campus_bus`.`order_payment` (
  `id` CHAR(36) NOT NULL,
  `order_id` CHAR(36) NOT NULL,
  `type` INT NULL,
  `status` INT NULL,
  `api_response` NVARCHAR(4096) NULL,
  `description` NVARCHAR(1024) NULL,
  `create_time` DATETIME NULL,
  PRIMARY KEY (`id`));


/* 后台管理员 */
CREATE TABLE `admin` (
  `id` CHAR(36) NOT NULL,
  `company_id` CHAR(36) NULL,
  `type` INT NULL,
  `username` NVARCHAR(64) NOT NULL,
  `password` CHAR(32) NOT NULL COMMENT 'MD5 HASH',
  `telephone` NVARCHAR(64) NULL,
  `disabled` BIT(1) NULL DEFAULT 0,
  `create_time` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `username_UNIQUE` (`username` ASC));

