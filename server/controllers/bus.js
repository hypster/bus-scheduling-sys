'use strict'

var fs = require('fs')
var path = require('path')
var multiparty = require('multiparty')
// var JSZip = require('jszip')
var uuid = require('uuid')
var logger = require('../common/logger')

var ModelsDAO = require('../models/bus')

exports.getAll = function (req, res, cb) {
  cb(req, res, function (resData) {
    res.success(resData)
  })
}

exports.getPage = function (req, res, cb) {
  cb(req, res, function (resData) {
    res.success(resData)
  })
}

exports.getModels = function (req, res, cb) {
  cb(req, res, function (resData) {
    res.success(resData)
  })
}

exports.setDel = function (req, res, cb) {
  cb(req, res, function (resData) {
    res.success(resData)
  })
}

exports.setAdd = function (req, res, cb) {
  ModelsDAO.isLicense_plate(req.body.data['license_plate'],function (data){
    if (data.length === 0) {
      cb(req, res, function (resData) { res.success(resData) })
    } else {
      res.error('车牌号重复')
    }
  })
}

exports.setEdit = function (req, res, cb) {
  cb(req, res, function (resData) {
    res.success(resData)
  })
}

exports.lookup = function (req, res) {
  var scanResult = req.body.scanResult
  var isJsonResult = false
  try {
    scanResult = JSON.parse(scanResult)
    isJsonResult = true
  } catch (error) {}

  if (!isJsonResult) {
    ModelsDAO.getByLicensePlate(scanResult, function (err, bus) {
      if (err) {
        logger.error(err)
        return res.fail(-99, '检索车辆出错')
      }
      if (!bus) {
        return res.fail(-1, '未知车辆')
      }
      return res.success(bus)
    })
  } else {
    return res.fail(-11, 'TODO: 功能建设中')
  }
}

exports.upload = function (req, res, next) {
  var form = new multiparty.Form()
  form.parse(req, function (err, fields, files) {
    if (err) {
      res.writeHead(400, {'content-type': 'text/plain'})
      res.end('invalid request: ' + err.message)
      return
    }
    var companyId = fields.companyId
    var csvFile = files['file1'].shift()
    if (!companyId || path.extname(csvFile.path).toLowerCase() !== '.csv') {
      return res.fail(-1, '参数错误')
    }

    var now = new Date()
    var arr = []
    var lines = fs.readFileSync(csvFile.path, 'utf-8').split('\r\n')
    var headerLine = lines.shift()
    if (headerLine !== '公司,车牌号,座位数,备注') {
      return res.fail(-2, 'csv模板数据格式有误，正确顺序：公司,车牌号,座位数,备注')
    }
    lines.forEach(l => {
      // ["公司", "车牌号", "座位数" "备注"]
      var columns = l.split(',')
      var licensePlate = columns[1]
      if (licensePlate !== '车牌号' && !arr.some(a => a.license_plate === licensePlate)) {
        // id,company_id,name,seat_count,license_plate,description,create_time,serial_no,buscol,isDel
        arr.push({
          id: uuid.v1(),
          company_id: companyId,
          name: licensePlate,  // 车牌号
          seat_count: columns[2],
          license_plate: licensePlate,  // 车牌号
          description: columns[3],
          create_time: now,
          serial_no: generateSerialNo(),
          isDel: 0
        })
      }
    })
    ModelsDAO.getBuses(companyId, function (err, buses) {
      if (err) {
        return res.fail(-99, '导入失败')
      }
      var tobeAdded = arr.filter(item => {
        return !buses.some(b => b.license_plate.trim().toLowerCase() === item.license_plate.trim().toLowerCase())
      })
      if (!tobeAdded.length) {
        return res.success({affectedRows: 0})
      }
      ModelsDAO.batchAdd(tobeAdded, function (err, affectedRows) {
        if (err) {
          return res.fail(-99, '导入失败')
        }
        return res.success({affectedRows})
      })
    })
  })
}

var util = require('../common/utilities')
function generateSerialNo () {
  var now = new Date()
  var year = now.getFullYear()
  var month = util.padLeft(now.getMonth() + 1, 2, '0')
  var date = util.padLeft(now.getDate(), 2, '0')
  var hours = util.padLeft(now.getHours(), 2, '0')
  var minutes = util.padLeft(now.getMinutes(), 2, '0')
  var seconds = util.padLeft(now.getSeconds(), 2, '0')
  var randomNo = util.getRandomIntCode(3)
  return `${year}${month}${date}${hours}${minutes}${seconds}${randomNo}`
}

// exports.downloadImages = function (req, res, next) {
//   console.log(req.body.images)
//   var images = JSON.parse(req.body.images)
//   if (!images || !images.length) {
//     return res.fail(-1, '参数有误')
//   }

//   // var uploadDir = path.resolve('../../upload', generateSerialNo())
//   // if (!fs.existsSync(uploadDir)) {
//   //   fs.mkdirSync(uploadDir)
//   // }

//   var zip = new JSZip()

//   var counter = 0
//   var keys = Object.keys(images)
//   keys.forEach(k => {
//     var base64Data = images[k].replace(/^data:image\/png;base64,/, '')
//     counter++
//     zip.file(k, base64Data, {base64: true})
//     if (counter === keys.length) {
//       res.writeHead(200, {'Content-Type': 'application/zip'})
//       zip.generateNodeStream({type: 'nodebuffer', streamFiles: true})
//           .pipe(res)
//     }
//     // fs.writeFile(path.resolve(`${uploadDir}${k}.jpg`), base64Data, 'base64', function () {

//     // })
//   })
// }

