'use strict'

var ctrls = require('./controllers')

var express = require('express')
var router = express.Router()

router.get('/stations', ctrls.stations.getStations)
router.get('/bus_lines', ctrls.busLines.getBusLines)
router.get('/companies', ctrls.companies.getCompanies)

router.get('/bus_lines/:lineId/activeDispatches', ctrls.dispatches.getActiveDispatches)
router.get('/dispatches/:dispatchId', ctrls.dispatches.getDispatche)
// router.get('/batches/:batchId/schedules/:scheduleId', ctrls.dispatches.getDispatche)

router.get('/users/:id', ctrls.users.getUser)
router.post('/users/:id/save', ctrls.users.saveUser)
router.get('/users/:userId/tickets', ctrls.tickets.getUserTickets)
router.get('/tickets/:id', ctrls.tickets.getTicket)
router.post('/tickets/:id/check', ctrls.tickets.checkTicket)
router.post('/tickets/:id/return', ctrls.tickets.returnTicket)
router.post('/buses/lookup', ctrls.buses.lookup)

router.post('/users/:userId/orders', ctrls.orders.newOrder)
router.post('/users/:userId/orders/preOrder', ctrls.orders.newPreOrder)
router.post('/orders/:id/pay', ctrls.orders.payOrder)
router.post('/orders/:orderId/payments/:paymentId/JSAPICallback', ctrls.orders.JSAPICallback)
router.post('/orders/pay_notify', ctrls.orders.payNotify)
router.post('/orders/:id/cancel', ctrls.orders.cancelOrder)


// admin portal
router.get('/tickets/status/statistics', ctrls.tickets.getCheckedStatistics)  // ?dispatchDate=:dispatchDate&companyId=:companyId
router.get('/tickets/status/statisticsByBus', ctrls.tickets.getBusCheckedStatistics)  // ?dispatchDate=:dispatchDate&companyId=:companyId

module.exports = router
