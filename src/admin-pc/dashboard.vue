<template>
  <div>
    <menu></menu>
    <div class="container-fluid">
      <div class="row">

        <sidebarmenu @openmenu='openMenu'></sidebarmenu>


        <dispatch_table v-if="current_menu=='dispatch'"></dispatch_table>
        <residual_ticket v-if="current_menu=='residual_ticket'"></residual_ticket>

        <statistic_order v-if="current_menu=='statistic_order'"></statistic_order>
        <statistic_fee v-if="current_menu=='statistic_fee'"></statistic_fee>


        <order v-if="current_menu=='order'"></order>
        <order_switch v-if="current_menu=='order_switch'"></order_switch>

        <company v-if="current_menu=='company'"></company>
        <stop v-if="current_menu=='stop'"></stop>
        <line v-if="current_menu=='line'"></line>
        <schedule v-if="current_menu=='schedule'"></schedule>
        <bus v-if="current_menu=='bus'"></bus>

        <password_change v-if="current_menu=='password_change'"></password_change>
      </div>
    </div>
  </div>
</template>
<style src='./assets/main.scss' lang="scss">


</style>
<script>
  import menu from './components/dispatch/dashboard_menu.vue'
  import sidebarmenu from './components/sidebar_menu.vue'
  import dispatch_table from './components/dispatch/table_parent.vue'
  import order from './components/order/order.vue'
  import order_switch from './components/order/order_switch.vue'
  import company from './components/info_management/company.vue'
  import stop from './components/info_management/stop.vue'
  import schedule from './components/info_management/schedule.vue'
  import statistic_order from './components/statistics/order_statistic.vue'
  import statistic_fee from './components/statistics/fee_statistic.vue'
  import line from './components/info_management/line.vue'
  import bus from './components/info_management/bus.vue'
  import residual_ticket from './components/dispatch/residual_ticket.vue'
  import password_change from './components/change_password/index.vue'
  export default{
    data(){
      return {
        current_menu: ''
      }
    },
    methods:{
      openMenu:function(item){
        this.current_menu=item
      }
    },
    watch:{
      'current_menu': function () {
        // 切页面时，初始化时间控件
        var options = {
          language: 'zh-CN',
          // showMeridian: true,
          autoclose: true,
          todayBtn: true
        }
        $(".form_date").prop('readonly', true).datetimepicker($.extend({format: 'yyyy/mm/dd', minView: 2}, options));
        $(".form_time").prop('readonly', true).datetimepicker($.extend({format: 'hh:ii', startView: 1, maxView: 1, minView: 0}, options));
        $(".form_datetime").prop('readonly', true).datetimepicker($.extend({format: 'yyyy/mm/dd hh:ii'}, options));
      }
    },
    components: {
      menu,
      sidebarmenu,
      dispatch_table,
      order,
      order_switch,
      company,
      stop,
      schedule,
      statistic_order,
      statistic_fee,
      line,
      bus,
      residual_ticket,
      password_change
    },
    ready: function() {
      // this.current_menu='dispatch'
    }
  }
</script>
