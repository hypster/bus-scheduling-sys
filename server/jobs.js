'use strict'

let fs = require('fs')
let path = require('path')
let schedule = require('node-schedule')
let logger = require('./common/logger')
let appSettings = require('./app.settings')

let orderDAO = require('./models/order')
let ticketDAO = require('./models/ticket')
let dispatchDAO = require('./models/dispatch')

// The cron format consists of:
// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    |
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)

// 每隔30分钟，将超时还未支付的订单设为已超时：释放余票
/* eslint-disable */
let orderTimeoutJob = schedule.scheduleJob('*/30 * * * *', () => {
  logger.info('OrderTimeoutJob start.')
  orderDAO.releaseTimeoutOrder((err, affectedRows) => {
    if (err) {
      logger.error('OrderTimeoutJob errored!', err.stack)
    }
    logger.info(`OrderTimeoutJob end. affectedRows: ${affectedRows}`)
  })
})
/* eslint-enable */

// 每天0点0分0秒，将已过期的车票设为已过期状态
let ticketExpireRule = new schedule.RecurrenceRule()
ticketExpireRule.hour = 0
ticketExpireRule.minute = 0
ticketExpireRule.second = 0
schedule.scheduleJob('TicketExpireJob', ticketExpireRule, () => {
  logger.info('TicketExpireJob start.')
  ticketDAO.updateExpiredTickts((err, affectedRows) => {
    if (err) {
      logger.error('TicketExpireJob errored!', err.stack)
    }
    logger.info(`TicketExpireJob end. affectedRows: ${affectedRows}`)
  })
})

// 每周五0点0分0秒，复制派车模板，自动生成下周的派车批次
let generateNextWeekDispatchRule = new schedule.RecurrenceRule()
generateNextWeekDispatchRule.dayOfWeek = 5  // (0-7: 其中 0,7 都指周日)
generateNextWeekDispatchRule.hour = 0
generateNextWeekDispatchRule.minute = 0
generateNextWeekDispatchRule.second = 0
schedule.scheduleJob('GenerateNextWeekDispatchJob', generateNextWeekDispatchRule, () => {
  logger.info('GenerateNextWeekDispatchJob start.')
  dispatchDAO.generateNextWeekDispatch((err, affectedRows) => {
    if (err) {
      logger.error('GenerateNextWeekDispatchJob errored!', err.stack)
    }
    logger.info(`GenerateNextWeekDispatchJob end. affectedRows: ${affectedRows}`)
  })
})

let expiredPreOrderJob;
function rescheduleExpiredPreOrderJob () {
  if (expiredPreOrderJob) {
    expiredPreOrderJob.cancel()
  }

  // 每周三17:00，下架本周未成团的团购，并退款(退至余额)给学生
  let expiredPreOrderRule = new schedule.RecurrenceRule()
  expiredPreOrderRule.dayOfWeek = appSettings.preOrderEndDayOfWeek
  expiredPreOrderRule.hour = Number(appSettings.preOrderEndTime.split(':')[0] || '17')
  expiredPreOrderRule.minute = Number(appSettings.preOrderEndTime.split(':')[1] || '0')
  expiredPreOrderRule.second = Number(appSettings.preOrderEndTime.split(':')[2] || '0')
  expiredPreOrderJob = schedule.scheduleJob('expiredPreOrderJob', expiredPreOrderRule, () => {
    logger.info('expiredPreOrderJob start.')
    dispatchDAO.expiredPreOrder((err, affectedRows) => {
      if (err) {
        logger.error('expiredPreOrderJob errored!', err.stack)
      }
      logger.info(`expiredPreOrderJob end. affectedRows: ${affectedRows}`)
    })
  })
  logger.info('reschedule expiredPreOrderJob.')
}

appSettings.writePreOrderExpiredTime = function (preOrderEndDayOfWeek, preOrderEndTime) {
  var config = readConfig() || {}
  config.preOrderEndDayOfWeek = appSettings.preOrderEndDayOfWeek = preOrderEndDayOfWeek
  config.preOrderEndTime = appSettings.preOrderEndTime = preOrderEndTime
  fs.writeFileSync(path.resolve(__dirname, '../app.config.json'), JSON.stringify(config), {encoding: 'utf-8'})
  rescheduleExpiredPreOrderJob() // 重新设置定时器
}
function readConfig () {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, '../app.config.json'), 'utf-8'))
  } catch (error) {
    logger.error('failed to read settings.json for reset preorder\'s expired time.', error)
  }
  return null
}

function init () {
  var config = readConfig() || {}
  appSettings.preOrderEndDayOfWeek = (typeof (config.preOrderEndDayOfWeek) === 'undefined') ? 3 : config.preOrderEndDayOfWeek // 每周团购截止日期(0-6:周日-周六)
  appSettings.preOrderEndTime = config.preOrderEndTime || '17:00'  // 团购截止时间
  rescheduleExpiredPreOrderJob() // 重新设置定时器
}
init()  // 初始读取团购的配置

console.log('jobs running...')
