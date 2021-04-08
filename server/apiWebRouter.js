'use strict'

var ctrls = require('./controllers')
var qr = require('qr-image')
var express = require('express')
var router = express.Router()

router.post('/admin/signin', ctrls.admin.signin)
router.post('/admin/signout', ctrls.admin.signout)
router.post('/admin/:id/changePassword', ctrls.admin.changePassword)
router.get('/batches/templateBatch', ctrls.dispatches.getTemplateBatch)

// 团购截止时间设置
var appSettings = require('./app.settings')
router.get('/preOrderConfig', (req, res, next) => {
  res.json({
    preOrderEndDayOfWeek: appSettings.preOrderEndDayOfWeek,
    preOrderEndTime: appSettings.preOrderEndTime
  })
})
router.post('/preOrderConfig/update', (req, res, next) => {
  let config = req.body
  appSettings.writePreOrderExpiredTime(config.preOrderEndDayOfWeek, config.preOrderEndTime)
  res.success()
})

var bllModels = {
    bus: 'buses',
    bus_line: 'busLines',
    v_bus_line: 'busLines',
    v_bus: 'busLines',
    company: 'companies',
    order: 'orders',
    v_order: 'orders',
    ticket: 'tickets',
    station: 'stations',
    schedule: 'schedules',
    v_schedule: 'schedules',
    dispatch_batch: 'dispatches',
    v_Ddetail: 'dispatches',
    dispatch_detail: 'dispatches',
    info: 'infos',
    v_StatisticsDetail: 'dispatches'
}
router.post('/buses/upload', ctrls.buses.upload)
router.post('/dispatch/countEdit', ctrls.dispatches.countEdit)
router.post('/dispatch/copyDetail', ctrls.dispatches.setCopyDetail)
router.post('/dispatch/All', ctrls.dispatches.disAll)
router.post('/dispatch/getNewModels', ctrls.dispatches.getNewModels)
router.post('/batches/:id/dispatches', ctrls.dispatches.getBatchDispatches)
router.post('/orders/getStatistics', ctrls.orders.getStatistics)
router.post('/:tbName/:dbCom', function (req, res) {
    ctrls[bllModels[req.params.tbName]][req.params.dbCom](req, res, ctrls.dbCommon[req.params.dbCom])
})

router.get('/getBusimg', function (req, res, next) {
    var text = req.query.license_plate;
    var size = req.query.size || 12;
    try {
        var img = qr.image(text,{size: size});
        res.writeHead(200, {'Content-Type': 'image/png'});
        img.pipe(res);
    } catch (e) {
        res.writeHead(414, {'Content-Type': 'text/html'});
        res.end('<h1>414 Request-URI Too Large</h1>');
    }
})


// router.post('/:tbName/getPage', ctrls.dbCommon.getPage)
// router.post('/:tbName/getAll', ctrls.dbCommon.getAll)
// router.post('/:tbName/getModels', ctrls.dbCommon.getModels)
// router.post('/:tbName/setDel', ctrls.dbCommon.setDel)
// router.post('/:tbName/setAdd', ctrls.dbCommon.setAdd)
// router.post('/:tbName/setEdit', ctrls.dbCommon.setEdit)
module.exports = router
