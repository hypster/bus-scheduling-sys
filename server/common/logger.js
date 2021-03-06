'use strict'

var log4js = require('log4js')
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'logs/server.log', category: 'server' }
  ]
})

var logger = log4js.getLogger('server')
logger.setLevel('DEBUG')

module.exports = logger
