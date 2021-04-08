'use strict'

;(function (window, $) {
  function getCookie (name) {
    if (document.cookie.length > 0) {
      var start = document.cookie.indexOf(name + '=')
      if (start !== -1) {
        start = start + name.length + 1
        var end = document.cookie.indexOf(';', start)
        if (end === -1) end = document.cookie.length
        return decodeURIComponent(document.cookie.substring(start, end))
      }
    }
    return ''
  }

  function setCookie (name, value, expiredays) {
    var exdate = new Date()
    exdate.setDate(exdate.getDate() + expiredays)
    document.cookie = name + '=' + encodeURIComponent(value) +
      ((expiredays == null) ? '' : ';expires=' + exdate.toGMTString())
  }

  window.__getAuthedUser = function () {
    try {
      return JSON.parse(getCookie('authed_user'))
    } catch (error) {
      auth()
      return null
    }
  }

  function getAuthUrl (cb) {
    var state = window.location.pathname + window.location.search
    $.getJSON('../../api/wechat/getAuthUrl?state=' + encodeURIComponent(state), function (result) {
      return cb(result.data.authUrl)
    })
  }

  function checkAuth () {
    getAuthUrl(function (authUrl) {
      if (!window.__getAuthedUser()) {
        window.location.href = authUrl
      }
    })
  }

  function auth () {
    getAuthUrl(function (authUrl) {
      window.location.href = authUrl
    })
  }

  $.getScript('../../static/jweixin-1.0.0.js', function () {
    initWXJSSDK()
  })
  function initWXJSSDK () {
    $.getJSON('../../api/wechat/getWXConfig?currentUrl=' + encodeURIComponent(location.href.split('#')[0]), function (result) {
      var wxConfig = result.data
      // wxConfig.debug = true
      wxConfig.jsApiList = ['scanQRCode', 'chooseWXPay', 'closeWindow']
      wx.config(wxConfig)

      wx.ready(function () {
        // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
        console.log('wx.ready')
      })
      wx.error(function (res) {
        // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
        alert('加载微信JS-SDK失败')
        console.error(res)
      })
    })
  }

  checkAuth()
})(/* eslint-disable */window, jQuery)

if (window.location.hostname == "localhost") {
  document.cookie = "authed_user=%7B%22id%22%3A%2269587140-9c1c-11e6-a39d-2f9b2aeb82b0%22%2C%22type%22%3A1%2C%22corp_user_id%22%3A%221000432968%22%2C%22corp_user_detail%22%3A%22%7B%5C%22errcode%5C%22%3A0%2C%5C%22errmsg%5C%22%3A%5C%22ok%5C%22%2C%5C%22userid%5C%22%3A%5C%221000432968%5C%22%2C%5C%22name%5C%22%3A%5C%22%E9%BB%84%E4%BF%8A%E9%93%AD%5C%22%2C%5C%22department%5C%22%3A%5B33300806%5D%2C%5C%22mobile%5C%22%3A%5C%2218616864521%5C%22%2C%5C%22gender%5C%22%3A%5C%221%5C%22%2C%5C%22avatar%5C%22%3A%5C%22http%3A%2F%2Fshp.qpic.cn%2Fbizmp%2Fx3NMcKI1Prg4jDAfXCVia7lpNtPpNV6tUf14Kx94bJPKUDAA147NTqQ%2F%5C%22%2C%5C%22status%5C%22%3A1%2C%5C%22extattr%5C%22%3A%7B%5C%22attrs%5C%22%3A%5B%5D%7D%2C%5C%22openid%5C%22%3A%5C%22orN5pszX26PmxvQiPA-_gFHMoFtQ%5C%22%7D%22%2C%22openid%22%3A%22orN5pszX26PmxvQiPA-_gFHMoFtQ%22%2C%22unionid%22%3A%22%22%2C%22name%22%3A%22%E9%BB%84%E4%BF%8A%E9%93%AD%22%2C%22phone%22%3A%2218616864521%22%2C%22campus%22%3A%22%E5%BE%90%E6%B1%87%22%2C%22balance%22%3A19972.96%2C%22status%22%3A0%2C%22create_time%22%3A%222016-10-20T08%3A40%3A46.000Z%22%7D";
}
