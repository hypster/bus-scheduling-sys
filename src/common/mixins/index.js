'use strict'

import WeuiToast from '../../common/components/weui-toast.vue'
import WeuiDialog from '../../common/components/weui-dialog.vue'

module.exports = {
  components: {
    WeuiToast, WeuiDialog
  },
  data: function () {
    return {
      toast: {
        message: '',
        warn: false,
        showToast: false,
        showLoadingToast: false,
        duration: 1500
      },
      dialog: {
        show: false,
        type: 'confirm',
        title: '标题',
        body: '提示内容',
        'default': {
          text: '取消',
          click: function () {
          }
        },
        'primary': {
          text: '确定',
          click: function () {
          }
        }
      }
    }
  },
  methods: {
    showToast (message, duration) {
      this.toast.message = message
      this.toast.warn = false
      this.toast.showToast = true
      if (duration) {
        this.toast.duration = duration
      }
    },
    showWarnToast (message, duration) {
      this.toast.message = message
      this.toast.warn = true
      this.toast.showToast = true
      if (duration) {
        this.toast.duration = duration
      }
    },
    showLoadingToast (message, duration) {
      this.toast.message = message
      this.toast.showLoadingToast = true
      if (duration) {
        this.toast.duration = duration
      }
    },
    showDialog (options) {
      this.dialog.type = 'confirm'
      this.dialog.show = true
      this.dialog.title = options.title
      this.dialog.body = options.body
      this.dialog.default = options.default
      this.dialog.primary = options.primary
    },
    showNoticeDialog (options) {
      this.dialog.type = 'notice'
      this.dialog.show = true
      this.dialog.title = options.title
      this.dialog.body = options.body
      this.dialog.default = options.default
    }
  },
  events: {
    hideToast: function () {
      this.toast.showToast = false
      this.toast.warn = false
    },
    hideLoadingToast: function () {
      this.toast.showLoadingToast = false
    },
    hideDialog: function () {
      this.dialog.show = false
    }
  }
}
