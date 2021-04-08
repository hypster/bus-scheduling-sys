<template>
  <div class="page-check-success">
    <div class="weui-cells__title page-title">班车信息(请确认)</div>
    <div class="weui-cells">
      <div class="weui-cell">
        <div class="weui-cell__bd">
          <p>公司</p>
        </div>
        <div class="weui-cell__ft">{{bus.company.name}}</div>
      </div>
      <div class="weui-cell">
        <div class="weui-cell__bd">
          <p>车牌号</p>
        </div>
        <div class="weui-cell__ft">{{bus.license_plate}}</div>
      </div>
      <!--<div class="weui-cell">
        <div class="weui-cell__bd">
          <p>班次</p>
        </div>
        <div class="weui-cell__ft">{{schedule.begin_time}}</div>
      </div>-->
    </div>

    <div class="ticket">
      <div class="weui-panel">
        <div class="weui-panel__bd">
          <div class="weui-media-box weui-media-box_text">

            <h4 class="weui-media__title">{{ticket.serial_no}}</h4>
            <p class="weui-media__desc">{{formatDate(ticket.departure)}} {{ticket.timeRange}}</p>
            <p class="weui-media__desc">￥{{ticket.price}}</p>
            <p><span class="stop">{{ticket.start}}</span> → <span class="stop">{{ticket.end}}</span></p>
            <p>{{ticket.company.name}}</p>

            <div class="valid valid-true" :class="{'valid-true':ticket.valid,'valid-false':!ticket.valid}"><div>{{displayStatus}}</div></div>
          </div>
        </div>
      </div>
    </div>
    <p class="weui-footer__text remark" style="color:red;">* 检票之后，该车票将作废，请仔细核对班车信息</p>

    <div class="btn-wrapper">
      <p style="text-align: center;" v-if="(checkedCount!=0)">欢迎第 {{checkedCount}} 位乘客</p>
      <a href="javascript:;" id="btn_check" @click="checkTicket" class="weui-btn weui-btn_primary" :class="{'weui-btn_disabled': !canCheck}" v-if="ticket.valid && (checkedCount==0)">请让<br/>司机检票</a>
    </div>
    <weui-toast :options="toast"></weui-toast>
    <weui-dialog :options="dialog"></weui-dialog>
  </div>
</template>
<style src="./assets/main.scss" lang="scss"></style>
<style lang="scss" scoped>
  .weui-media-box_text{
    p{
      font-size: 1.2em;
    }
    .stop{
      color:#10AEFF;
    }
  }
  .btn-wrapper{
    padding: 0;
  }
  #btn_check {
    margin-top: 15px;
    height: 140px;
    width: 140px;
    border-radius: 70px;
    line-height: normal;
    text-align: center;
    font-size: 22px;
    padding-top: 45.5px;
    font-weight: bold;
    animation: shadow-show_hide 1.5s linear infinite;
  }
  @keyframes shadow-show_hide {
    0% { box-shadow: 0 0 15px 10px rgba(26, 173, 25, 0.5); },
    25% { box-shadow: 0 0 10px 5px rgba(26, 173, 25, 0.25); },
    50% { box-shadow: 0 0 5px 0px rgba(26, 173, 25, 0); },
    75% { box-shadow: 0 0 10px 5px rgba(26, 173, 25, 0.25); },
    100% { box-shadow: 0 0 15px 10px rgba(26, 173, 25, 0.5); }
  }
</style>
<script>
  import util from '../common/util'
  import Vue from 'vue'
  import vue_resource from 'vue-resource'
  Vue.use(vue_resource)

  export default{
    data(){
      return{
        bus: {
          company: {
            id: '',
            name: ''
          }
        },
        ticket: {
          id: '',
          serial_no: '',
          departure: new Date(),
          timeRange: '',
          price: 0,
          status: 0,
          valid: false,
          start: '',
          end: '',
          company: {
            id: '',
            name: ''
          }
        },
        checkedCount: 0
      }
    },
    computed: {
      'displayStatus': function () {
        var status = this.ticket.status
        var arr = ['未使用', '已使用', '已过期', '已退票']
        return arr[status]
      },
      canCheck: function () {
        var vm = this
        if (vm.bus.company.id !== vm.ticket.company.id) {
          return false
        }
        return true
      }
    },
    ready () {
      var vm = this
      var bus = JSON.parse(localStorage.getItem('scan_bus'))
      vm.$set('bus', bus)

      var ticketId = localStorage.getItem('ticket_id')
      vm.$http.get(`/api/tickets/${ticketId}`).then((res) => {
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
        info.valid = (ticket.status==0)
        info.start = ticket.schedule.bus_line.start_station.name
        info.end = ticket.schedule.bus_line.terminal_station.name
        info.company = {
          id: ticket.schedule.company.id,
          name: ticket.schedule.company.name
        }
        vm.$set('ticket', info)

        if (vm.ticket.valid && (vm.bus.company.id !== vm.ticket.company.id)) {
          vm.showNoticeDialog({
            body: '班车公司信息不匹配，无法检票',
            default: {
              text: '我知道了',
              click: function () {
                vm.$dispatch('hideDialog')
              }
            }
          })
        }
      })
    },
    methods: {
      formatTime: function (dateObj) {
        return util.formatTime(dateObj)
      },
      formatDate: function (dateObj) {
        return util.formatDate(dateObj)
      },
      checkTicket () {
        var vm = this
        if (!vm.canCheck) {
          return false
        }

        vm.$http.post(`/api/tickets/${vm.ticket.id}/check`, {bus_id: vm.bus.id}).then((res) => {
          if (res.body.code != 0) {
            return vm.showWarnToast(res.body.message)
          } else {
            vm.ticket.status = 1
            vm.ticket.valid = false
            vm.checkedCount = res.body.data.checkedCount
          }
        })
      }
    }
  }
</script>
