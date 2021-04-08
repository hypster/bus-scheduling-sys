<template>
  <div class="weui-cells">
    <div class="weui-cell">
      <div class="weui-cell__bd">
        <p>{{ticket.serial_no}}</p>
      </div>
      <div class="weui-cell__ft">{{translateSwitch(ticket.type)}}</div>
    </div>
    <a class="weui-cell weui-cell_access" href="javascript:;" @click="navToDetail(ticket.id)">
      <div class="weui-cell__bd">
        <p><span class="stop">{{ticket.start}}</span> → <span class="stop">{{ticket.end}}</span><br><span>{{ticket.company}}</span><span class="pre_order_tag">{{((ticket.is_pre_order && ticket.pre_order_status===0)?'(预订)':'')}}</span></p>
        <p class="date">{{formatDate(ticket.date)}}</p>
      </div>
      <div class="weui-cell__ft price">{{ticket.price}}元</div>
    </a>
  </div>
</template>
<style lang="scss" scoped>
  p{
    font-size: 1.2em;
  }
  .stop{
    color:#10AEFF;
  }
  .pre_order_tag {
    color: #0BB20C;
    font-size: 0.8em;
    margin-left: 5px;
  }
</style>
<script>
  import util from '../../common/util'

  export default{
    data(){
      return {}
    },
    props: ['ticket'],
    methods: {
      formatTime: function (dateObj) {
        return util.formatTime(dateObj)
      },
      formatDate: function (dateObj) {
        return util.formatDate(dateObj)
      },
      navToDetail (ticketId) {
        localStorage.setItem('ticket_id', ticketId)
        window.location.href = './ticket_info.html'
      },
      translateSwitch: function (sw) {
        switch (sw) {
          case 0:
            sw = '未使用'
            break
          case 1:
            sw = '已使用'
            break
          case 2:
            sw = '已过期'
            break
          default:
            sw = '未使用'
            break
        }
        return sw

      }
    }
  }
</script>
