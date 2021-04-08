'use strict'

var env = 'test'  // dev, test or prod
/**
 * 各个环境端口号：HTTP OR HTTPS
 */
var ports = {
  'dev': 8080,
  'test': 81,
  'prod': 80
}
var sslPorts = {
  'dev': 8043,
  'test': 8443,
  'prod': 443
}

module.exports = {
  env: env,
  port: ports[env],
  sslPort: sslPorts[env],
  sslKeyPath: '/root/ssl/server.key', // 'server/newkey.pem',
  sslCertPath: '/root/ssl/server.crt', // 'server/file.crt',
  sslCaPath: '/root/ssl/gs_intermediate_ca.crt',
  onlyHttps: false
}
