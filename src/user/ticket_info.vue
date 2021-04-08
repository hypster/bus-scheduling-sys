<template>
	<div class="page-info-page">
		<div class="weui-cells__title page-title">电子票信息</div>

    <div class="weui-panel">
      <div class="weui-panel__bd">
        <div class="weui-media-box weui-media-box_text">
          <h4 class="weui-media__title">{{info.serial_no}}</h4>
          <p class="weui-media__desc">{{formatDate(info.departure)}} {{info.timeRange}}</p>
          <p class="weui-media__desc">￥{{info.price}}</p>
          <p><span class="stop">{{info.start}}</span>→<span class="stop">{{info.end}}</span><span class="pre_order_tag">{{((info.is_pre_order && info.pre_order_status===0)?'(预订)':'')}}</span></p>
          <p>{{info.company}}<span>{{(!!info.take_bus) ? (' ' + info.take_bus.license_plate) : ''}}</span></p>
          <p v-if="!!info.take_bus">检票时间：{{dateFormat(info.check_time, 'yyyy年mm月dd日 HH:MM')}}</p>
        </div>
      </div>
    </div>
    <div class="weui-form-preview">
        <div class="weui-form-preview__ft" v-if="(info.status===0 || info.status===2)">
            <a class="weui-form-preview__btn weui-form-preview__btn_primary" href="javascript:" @click="scanQRCode" v-if="(((!info.is_pre_order && info.status===0) || (info.is_pre_order && info.pre_order_status===1)) && info.isUseDay)">扫码使用</a>
            <a class="weui-form-preview__btn weui-form-preview__btn_primary" href="javascript:" @click="returnTicket" v-if="info.canReturn">{{((info.is_pre_order)?'退订':'退票')}}</a>
        </div>
        <div class="weui-form-preview__ft" v-else>
            <span style="margin: 0 auto;color: red;font-weight: bold;">{{displayStatus}}</span>
        </div>
    </div>
    <!--<div class="weui-msg__text-area" style="margin:15px 0;" v-if="(info.status !== 1 && !info.canReturn)">
      <p class="weui-msg__desc">* 如需退票，请联系学校班车管理员</p>
    </div>-->

    <weui-toast :options="toast"></weui-toast>
    <weui-dialog :options="dialog"></weui-dialog>
	</div>
</template>

<style src="./assets/main.scss" lang="scss"  scoped>

</style>
<style lang="scss" scoped>
  .weui-media-box_text{
    h4,p{
      font-size: 1.2em;
    }
    }
    .stop{
      color: #10AEFF;
    }
    .pre_order_tag {
      color: #0BB20C;
      font-size: 0.8em;
      margin-left: 5px;
    }
</style>

<script>
  import util from '../common/util'
  import dateFormat from 'dateformat'

  import Vue from 'vue'
  import vue_resource from 'vue-resource'
  Vue.use(vue_resource)

  export default{
    data(){
      return {
        info: {
          // serial_no:201609241255495457,
          // departure:new Date(2016,9,24),
          // timeRange:'8:00',
          // price:12,
          // status:0
          // start:'上师大奉贤校区',
          // end:'人民广场',
          // company:'久通公司'
        }
      }
    },
    computed: {
      'displayStatus': function () {
        var status = this.info.status
        var arr = ['未使用', '已使用', '已过期', '已退票']
        if (this.info.is_pre_order) {
          arr[3] = '已退订'
        }
        return arr[status]
      }
    },
    methods: {
      formatTime: function (dateObj) {
        return util.formatTime(dateObj)
      },
      formatDate: function (dateObj) {
        return util.formatDate(dateObj)
      },
      dateFormat: function (val, format) {
        return dateFormat(val, format)
      },
      scanQRCode () {
        var vm = this
        if (window.location.hostname === 'localhost') {
          vm.$http.post('/api/buses/lookup', {scanResult: '沪A12345'}).then((res) => {
            if (res.body.code != 0) {
              return vm.showWarnToast(res.body.message)
            } else {
              var bus = res.body.data
              localStorage.setItem('scan_bus', JSON.stringify(bus))
              window.location.href = './check_success.html'
            }
          })
          return false;
        }
        /** 调起微信扫一扫接口 */
        wx.scanQRCode({
          needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
          scanType: ['qrCode', 'barCode'], // 可以指定扫二维码还是一维码，默认二者都有
          success: function (res) {
            var scanResult = res.resultStr // 当needResult 为 1 时，扫码返回的结果
            vm.$http.post('/api/buses/lookup', {scanResult}).then((res) => {
              if (res.body.code != 0) {
                return vm.showWarnToast(res.body.message)
              } else {
                var bus = res.body.data
                localStorage.setItem('scan_bus', JSON.stringify(bus))
                window.location.href = './check_success.html'
              }
            })
          },
          error: function (res) {
            if (res.errMsg.indexOf('function_not_exist') > 0) {
              this.showWarnToast('微信版本过低请升级')
            }
          }
        })
      },
      returnTicket () {
        var vm = this
        
        var returning = false
        var handleReturnResult = function (success, res) {
          returning = false
          vm.$dispatch('hideDialog')
          if (success) {
            if (res.body.code !== 0) {
              return vm.showWarnToast(res.body.message)
            } else {
              var ticket = res.body.data
              vm.info.status = ticket.status
            }
          }
        }
        vm.showDialog({
          title: '退票确认',
          body: '您确定要退票吗？',
          default: {
            text: '取消',
            click: function () {
              handleReturnResult(false)
            }
          },
          primary: {
            text: '确定',
            click: function () {
              if (returning) {
                vm.showWarnToast('正在退票')
                return false
              }
              returning = true
              vm.$http.post(`/api/tickets/${vm.info.id}/return`).then((res) => {
                handleReturnResult(true, res)
              })
            }
          }
        })
      }
    },
    ready () {
      var ticketId = localStorage.getItem('ticket_id')
      this.$http.get(`/api/tickets/${ticketId}`).then((res) => {
        var ticket = res.body.data
        var info = {}
        info.id = ticket.id
        info.serial_no = ticket.serial_no
        info.departure = new Date(ticket.dispatch.start_time)
        info.timeRange = ticket.schedule.begin_time.replace(/:00$/, '')
        if (ticket.schedule.end_time && ticket.schedule.end_time !== '00:00:00') {
          info.timeRange += ` - ${ticket.schedule.end_time.replace(/:00$/, '')}`
        }
        info.price = ticket.price
        info.status = ticket.status
        info.isUseDay = ticket.isUseDay
        info.canReturn = ticket.canReturn
        info.start = ticket.schedule.bus_line.start_station.name
        info.end = ticket.schedule.bus_line.terminal_station.name
        info.company = ticket.schedule.company.name
        info.take_bus = ticket.take_bus
        info.check_time = ticket.check_time
        info.return_time = ticket.return_time
        info.is_pre_order = ticket.is_pre_order
        info.pre_order_status = ticket.pre_order_status
        this.$set('info', info)
      })
    }
  }
</script>
