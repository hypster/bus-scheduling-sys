<template>
  <div class="detail-page">
    <div class="weui-cells__title page-title">班车信息</div>
    <div class="weui-cells">
      <div class="weui-cell">
        <div class="weui-cell__bd">
          <p>公司</p>
        </div>
        <div class="weui-cell__ft">{{detail.company}}</div>
      </div>
      <div class="weui-cell">
        <div class="weui-cell__bd">
          <p>始发站</p>
        </div>
        <div class="weui-cell__ft">{{detail.start}}</div>
      </div>
      <div class="weui-cell">
        <div class="weui-cell__bd">
          <p>终点站</p>
        </div>
        <div class="weui-cell__ft">{{detail.end}}</div>
      </div>
      <div class="weui-cell">
        <div class="weui-cell__bd">
          <p>发车日期</p>
        </div>
        <div class="weui-cell__ft">{{formatDate(detail.departure)}}</div>
      </div>
      <div class="weui-cell">
        <div class="weui-cell__bd">
          <p>发车时间</p>
        </div>
        <div class="weui-cell__ft">{{formatTime(detail.departure)}}</div>
      </div>
      <div class="weui-cell">
        <div class="weui-cell__bd">
          <p>停止发售</p>
        </div>
        <div class="weui-cell__ft">{{formatTime(dueDate)}}</div>
      </div>
      <div class="weui-cell">
        <div class="weui-cell__bd">
          <p>价格</p>
        </div>
        <div class="weui-cell__ft">{{detail.price}}</div>
      </div>
      <div class="weui-cell">
        <div class="weui-cell__bd">
          <p>余票</p>
        </div>
        <div class="weui-cell__ft" :class="{'noOrder': noOrder}">{{remainder}}</div>
      </div>
    </div>
    <div class="btn-wrapper"><a href="javascript:void(0);" @click="newOrder" class="weui-btn weui-btn_primary" :class="{'weui-btn_disabled': noOrder}">购买</a></div>

    <div class="page actionsheet js_show">
      <div class="weui-skin_android" id="androidActionsheet" v-show="showPay">
          <div class="weui-mask"></div>
          <div class="weui-actionsheet">
              <div class="weui-actionsheet__menu">
                  <div class="weui-actionsheet__cell">还需支付￥<span>{{orderMargin}}</span>元</div>
                  <div class="weui-actionsheet__cell">
                    <a href="javascript:void(0);" @click="requestWXPay" class="weui-btn weui-btn_primary">微信支付</a>
                  </div>
                  <!--<div class="weui-actionsheet__cell">
                    <a href="javascript:void(0);" @click="requestCampusCardPay" class="weui-btn weui-btn_primary">校园卡支付</a>
                  </div>-->
                  <!--<div class="weui-actionsheet__cell">
                    <a href="javascript:void(0);" @click="requestBalancePay" class="weui-btn weui-btn_primary" :class="{'weui-btn_disabled': insufficientBalance}">余额支付<span class="balance" :class="{'insufficientBalance': insufficientBalance}">（￥{{userBalance}}）</span></a>
                  </div>-->
                  <div class="weui-actionsheet__cell">
                    <a href="javascript:;" @click="cancelOrder" class="weui-btn weui-btn_default">取消购买</a>
                  </div>
              </div>
          </div>
      </div>
    </div>
    <weui-toast :options="toast"></weui-toast>
    <weui-dialog :options="dialog"></weui-dialog>
  </div>
</template>
<style src="./assets/main.scss" lang="scss">
</style>
<script>
  
  import util from '../common/util'
  import appSettings from '../../server/app.settings'

  import Vue from 'vue'
  //  import routes from './components/Routes.vue'
  import vue_resource from 'vue-resource'
  Vue.use(vue_resource)
  export default {
    data() {
      return {
          detail:{},
          dispatch:{},
          unpayOrder:{},
          userBalance:0.00,
          orderMargin:0.00,
          wxPrepay:null,
          showPay: false
      }
    },
    computed:{
      dueDate:function(){
        if(!this.detail.end_departure)
          return false
        var d=new Date(this.detail.end_departure.getTime())
        d.setMinutes(d.getMinutes()-appSettings.aheadOfDeparture)
        return d
      },
      'remainder': function () {
        if (typeof this.dispatch.stopOrder === 'undefined') {
          return ''
        }
        if (this.dispatch.stopOrder) {
          return '停止发售'
        }
        if (this.dispatch.use_full_price) {
          if (!this.dispatch.openFullPrice) {
            return '临时票暂未开放'
          }
          if (this.dispatch.full_price_sold_count >= this.dispatch.full_price_seat_count) {
            return '临时票不足'
          }
        } else if (this.dispatch.sold_count >= this.dispatch.seat_count) {
          return '余票不足'
        }
        return '可购买'
      },
      'noOrder': function () {
        if (typeof(this.detail.leftover) === 'undefined') {
          return true
        }
        if (this.dispatch.use_full_price && !this.dispatch.openFullPrice) {
          return true
        }
        if (this.detail.leftover || this.detail.stopOrder) {
          return true
        }
        return false
      },
      'insufficientBalance': function() {
        if (this.unpayOrder.total && this.unpayOrder.total > this.userBalance) {
          return true
        }
        return false
      }
    },
    methods: {
      formatTime: function (dateObj) {
        return util.formatTime(dateObj)
      },
      formatDate: function (dateObj) {
        return util.formatDate(dateObj)
      },
      requestWXPay () {
        var vm = this
        
        // 注册微信JSBridge
        if (typeof WeixinJSBridge == "undefined"){
          if( document.addEventListener ){
              document.addEventListener('WeixinJSBridgeReady', vm.onBridgeReady, false);
          }else if (document.attachEvent){
              document.attachEvent('WeixinJSBridgeReady', vm.onBridgeReady); 
              document.attachEvent('onWeixinJSBridgeReady', vm.onBridgeReady);
          }
        }

        if (vm.wxPrepay) {  // 当用户在支付过程中取消时，防止重复下单
          // 开始调用微信支付
          vm.onBridgeReady()
        } else {
          vm.$http.post(`/api/orders/${vm.unpayOrder.id}/pay`, {type: 1}).then((res) => {
            if (res.body.code !== 0) {
              return this.showWarnToast(res.body.message)
            } else {
              vm.$set('wxPrepay', res.body.data)
              // 开始调用微信支付
              vm.onBridgeReady()
            }
          })
        }
      },
      onBridgeReady () {
        var vm = this
        WeixinJSBridge.invoke(
          'getBrandWCPayRequest', vm.wxPrepay.payOptions, function (res) {  // API回调
            var payStatus = 0
            if (res.err_msg == "get_brand_wcpay_request:ok" ) { // get_brand_wcpay_request:ok	支付成功
              payStatus = 1
            } else if (res.err_msg == "get_brand_wcpay_request:fail" ) {  // get_brand_wcpay_request:fail	支付失败
              payStatus = 2
            } else if (res.err_msg == "get_brand_wcpay_request:cancel" ) {  // get_brand_wcpay_request:cancel	支付过程中用户取消
              payStatus = 3
            }
            vm.$http.post(`/api/orders/${vm.unpayOrder.id}/payments/${vm.wxPrepay.newOrderPayment.id}/JSAPICallback`, {status: payStatus, api_response: res}).then((res) => {
              vm.handlePayResult((payStatus === 1))
            }, (res) => {
              vm.handlePayResult(false)
            })
          }
        );
      },
      requestECardPay () {
        var vm = this
        vm.$http.post(`/api/orders/${vm.unpayOrder.id}/pay`, {type: 3}).then((res) => {
          if (res.body.code !== 0) {
            return this.showWarnToast(res.body.message)
          } else {
            vm.handlePayResult(true)
          }
        })
      },
      requestBalancePay () {
        var vm = this
        if (vm.insufficientBalance) {
          return vm.showWarnToast('余额不足')
        }

        vm.showPay = false  // 隐藏支付对话框，以免同时出现2个弹窗 
        vm.showDialog({
          title: '支付提醒',
          body: '将为您优先使用余额支付，确定要购买吗？',
          default: {
            text: '取消',
            click: function () {
              vm.cancelOrder()  // 取消订单
              vm.$dispatch('hideDialog')
            }
          },
          primary: {
            text: '确定',
            click: function () {
              vm.$http.post(`/api/orders/${vm.unpayOrder.id}/pay`, {type: 0}).then((res) => {
                if (res.body.code !== 0) {
                  return this.showWarnToast(res.body.message)
                } else {
                  vm.handlePayResult(true)
                }
                vm.$dispatch('hideDialog')
              })
            }
          }
        })
      },
      handlePayResult (success) {
        if (success) {
          var ticket = this.unpayOrder.tickets.shift()
          localStorage.setItem('ticket_id', ticket.id)
          this.unpayOrder = {} // 重置未支付订单
          this.wxPrepay = null
          this.showPay = false
          window.location.href = `./ticket_info.html`
        }
      },
      newOrder () {
        var vm = this
        if (vm.noOrder) {
          return false
        }

        var user = __getAuthedUser()
        vm.$http.get(`/api/users/${user.id}`).then((res) => {
          user = res.body.data
          vm.userBalance = user.balance

          var content = `您当前账户余额￥${user.balance}元，确定购买？`
          if (vm.detail.price > user.balance) {
            content = `您当前账户余额￥${user.balance}元，还需支付￥${Number(vm.detail.price - user.balance).toFixed(2)}元，确定购买？`
          }

          var buying = false          
          var handleBuyResult = function (success, res) {
            buying = false
            vm.$dispatch('hideDialog')
            if (success) {
              if (res.body.code !== 0) {
                return vm.showWarnToast(res.body.message)
              } else {
                var newOrder = res.body.data.newOrder
                var margin = res.body.data.margin
                vm.$set('unpayOrder', newOrder)
                vm.$set('orderMargin', margin)
                if (newOrder.status === 1) { // 余额充足，已支付
                  vm.handlePayResult(true)
                } else {
                  vm.showPay = true
                }
              }
            }
          }

          vm.showDialog({
            title: '购票提醒',
            body: content,
            default: {
              text: '取消',
              click: function () {
                handleBuyResult(false)
              }
            },
            primary: {
              text: '确定',
              click: function () {
                if (buying) {
                  return false
                }
                buying = true
                vm.$http.post(`/api/users/${user.id}/orders`, {dispatch: vm.dispatch}).then((res) => {
                  handleBuyResult(true, res)
                })
              }
            }
          })
        })
      },
      cancelOrder () {
        this.$http.post(`/api/orders/${this.unpayOrder.id}/cancel`).then((res) => {
          if (res.body.code !== 0) {
            this.showWarnToast(res.body.message)
          }
          if(res.body.code < 0) {
            return false
          }
          this.unpayOrder = {} // 重置未支付订单
          this.wxPrepay = null
          this.showPay = false
        })
      }
    },
    ready:function(){
      var vm = this
      var dispatchId = localStorage.getItem('dispatchId')
      vm.$http.get('/api/dispatches/' + dispatchId).then(function(res){
        var dispatch=res.body.data
        var name=dispatch.schedule.company.name
        var start=dispatch.schedule.bus_line.start_station.name
        var end=dispatch.schedule.bus_line.terminal_station.name
        var price=dispatch.use_full_price?dispatch.schedule.full_price:dispatch.schedule.price
        var leftover= dispatch.use_full_price?(dispatch.full_price_sold_count>=dispatch.full_price_seat_count) : (dispatch.sold_count>=dispatch.seat_count)
        
        function buildDate(date,time){
          var d=new Date(date)
          time=time.split(':')
          d.setHours(parseInt(time[0]))
          d.setMinutes(parseInt(time[1]))
          return d
        }
        var date=buildDate(dispatch.start_time,dispatch.schedule.begin_time)
        var endDeparture=date
        if (dispatch.schedule.end_time !== '00:00:00') {
          endDeparture=buildDate(dispatch.start_time,dispatch.schedule.end_time)
        }

        vm.$set('dispatch', dispatch)
        vm.$set('detail',{
          company:name,
          start,
          end,
          departure: date,
          end_departure: endDeparture,
          stopOrder: dispatch.stopOrder,
          openFullPrice: dispatch.openFullPrice,
          price,
          leftover
        })
      })
    }
  }
</script>
