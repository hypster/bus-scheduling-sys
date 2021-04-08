'use strict'

var gSettings = require('../global.settings')

let settings = {
  limitLeaveTicketPerBatch: 1, // 每人每批次离校车票限购1单
  limitBackTicketPerBatch: 1, // 每人每批次返校车票限购1单
  orderPayTimeout: 30,  // 订单支付超时时间
  aheadOfDeparture: -60, // 班次发车前多少分钟停止发售

  /** 校园一卡通支付：加密参数 */
  ecardPay: {
    key: 'shnuxxbeducationplatform',
    iv: '01234567'
  },

  // 后台管理菜单列表，按管理员角色筛选
  dashboard_menu: [
    {
      text: '派车管理',
      subMenu: [
        {
          text: '批次管理',
          navTo: 'dispatch',
          roles: [1]
        },
        {
          text: '临时票管理',
          navTo: 'residual_ticket',
          roles: [0, 1]
        }
      ]
    },
    {
      text: '数据统计',
      subMenu: [
        {
          text: '售票统计',
          navTo: 'statistic_order',
          roles: [0, 1]
        },
        {
          text: '车费统计',
          navTo: 'statistic_fee',
          roles: [0, 1]
        }
      ]
    },
    {
      text: '基本信息管理',
      subMenu: [
        {
          text: '班车公司管理',
          navTo: 'company',
          roles: [1]
        },
        {
          text: '站点管理',
          navTo: 'stop',
          roles: [1]
        },
        {
          text: '班车线路管理',
          navTo: 'line',
          roles: [1]
        },
        {
          text: '车次管理',
          navTo: 'schedule',
          roles: [1]
        },
        {
          text: '班车信息管理',
          navTo: 'bus',
          roles: [0, 1]
        }
      ]
    },
    {
      text: '预定管理',
      roles: [1],
      subMenu: [
        {
          text: '售票明细查询',
          navTo: 'order',
          roles: [1]
        },
        {
          text: '售票开关设置',
          navTo: 'order_switch',
          roles: [1]
        }
      ]
    },
    {
      text: '密码管理',
      subMenu: [
        {
          text: '密码管理',
          navTo: 'password_change',
          roles: [0, 1]
        }
      ]
    }
  ]
}

if (gSettings.env !== 'prod') {
  Object.assign(settings, {
    limitLeaveTicketPerBatch: 10, // 每人每批次离校车票限购2单
    limitBackTicketPerBatch: 10 // 每人每批次返校车票限购2单
  })
}

module.exports = settings
