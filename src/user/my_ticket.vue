<template>
  <div class="page-my-ticket">
    <div class="weui-cells__title page-title">我的车票</div>
    <div class="weui-tab">
      <div class="weui-navbar">
        <div class="weui-navbar__item" data-switch="0" v-bind:class="{'weui-bar__item_on':(current==0)}"
             @click="switchTab">
          未使用
        </div>
        <div class="weui-navbar__item" data-switch="1" v-bind:class="{'weui-bar__item_on':(current==1)}"
             @click="switchTab">
          已使用
        </div>
        <div class="weui-navbar__item" data-switch="2" v-bind:class="{'weui-bar__item_on':(current==2)}"
             @click="switchTab">
          已过期
        </div>
      </div>
      <div class="weui-tab__panel" v-show="tickets.length>0">
        <ticket class="ticket" v-for="ticket in tickets" :ticket="ticket" v-show="ticket.type==current"></ticket>
      </div>
    </div>
    <weui-toast :options="toast"></weui-toast>
  </div>
</template>
<style src="./assets/main.scss" lang="scss"></style>
<script>
  import Vue from 'vue'
  import ticket from './components/my_ticket_ticket.vue'
  import vue_resource from 'vue-resource'
  Vue.use(vue_resource)

  export default{
    data(){
      return {
        switches: {
          "0": true,
          "1": false,
          "2": false
        },
        current: 0,
        tickets: []
      }
    },
    methods: {
      switchTab: function (e) {
        var ele = e.target || e.srcElement
        for (var sw in this.switches) {
          if (sw == ele.dataset.switch) {
            this.switches[sw] = !this.switches[sw]
//                        set current to the clicked switch
            this.current = sw
          } else
            this.switches[sw] = false
        }
      }
    },
    components:{
      ticket
    },
    ready:function(){
      var vm = this
      loadBaseScript.done(function() {
        var arr=[],
            user = __getAuthedUser()
        vm.$http.get(`/api/users/${user.id}/tickets`).then(function(res){
          res.body.data.forEach(function(d){
            var id = d.id
            var serial_no = d.serial_no
            var company=d.schedule.company.name
            var date=d.dispatch.start_time
            var price=d.price
            var time=d.schedule.begin_time.split(':')
            var h=parseInt(time[0])
            var m=parseInt(time[1])
            var start=d.schedule.bus_line.start_station.name
            var end=d.schedule.bus_line.terminal_station.name
            var type=d.status

            date=new Date(date)
            date.setHours(h)
            date.setMinutes(m)

            arr.push({
              id,
              serial_no,
              company,
              date,
              price,
              start,
              end,
              type,
              is_pre_order:d.is_pre_order,
              pre_order_status:d.pre_order_status
            })
          })
          vm.$set('tickets',arr)
        })
      })
    }
  }
</script>
