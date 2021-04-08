<template>
  <div>
    <div class="weui-cells__title schedule-date">{{ formatDate(routes[0].departure) }}</div>
    <a href="javascript:void(0);" @click="saveInfo(route)" class="weui-cells line" v-for="route in routes">
      <div class="weui-form-preview schedule_table">
        <div class="weui-form-preview__hd route-header">
          <div class="route">
            <span class="route-name">
                <small class="start">{{route.start}}</small>→<small class="end">{{route.end}}</small>
                (<span class="route-company">{{route.company}}</span>)
                <small :class="{pre_order_tag:true, stopOrder: route.stopOrder, pre_order_completed: (route.pre_order_completed==1)}">{{(route.is_pre_order==0)?'':((route.pre_order_completed==0)?(route.stopOrder?'[已截止]':'[团购中]'):'[已成团]')}}</small>
            </span>
          </div>
          <div class="weui-form-preview__value time">
            <em>{{ formatTime(route.departure) }}</em>
            <em>{{ route.date2?'-'+formatTime(route.date2):'' }}</em>
          </div>

        </div>
        <div class="weui-form-preview__bd route-body">
          <p v-if="(route.is_pre_order==0 || route.pre_order_completed==1)">
            <label class="weui-form-preview__label" v-if="!route.use_fp">
              <span class="total">总座位{{route.totalSeat}}</span>
              <span class="sold">&nbsp;已售{{route.sold}}</span>
              <span class="rest">&nbsp;余票{{route.rest}}</span>
            </label>
            <label class="weui-form-preview__label" v-else>
              <span class="rest">临时票{{route.fp_rest}}</span>
            </label>
            <span class="weui-form-preview__value price"> {{route.price}}元</span>
          </p>
          <p v-else>
            <label class="weui-form-preview__label" v-if="!route.use_fp">
              <span class="total">成团人数{{route.limit_count}}</span>
              <span class="sold">&nbsp;已预订{{route.sold}}</span>
            </label>
            <label class="weui-form-preview__label" v-else>
              <span class="rest">临时票{{route.fp_rest}}</span>
            </label>
            <span class="weui-form-preview__value price"> {{route.price}}元</span>
          </p>
        </div>
      </div>
    </a>
  </div>
</template>
<style>
  .pre_order_tag {
    color: #bbb000;
    position: absolute;top: 30px;
  }
  .stopOrder {
    color: red;
  }
  .pre_order_completed {
    color: #0BB20C;
  }
</style>
<script>
  import util from '../../common/util'

  export default {
    props: ['routes'],
    methods: {
      formatTime: function (dateObj) {
        return util.formatTime(dateObj)
      },
      formatDate: function (dateObj) {
        return util.formatDate(dateObj)
      },
      saveInfo:function(route){
        localStorage.setItem('dispatchId', route.id);
        let url = './ticket_detail.html';
        if (route.is_pre_order) {
          if (route.sold < route.limit_count) { // 是否成团：已预订人数是否满足成团条件
            url = './ticket_pre_order.html';
          }
        }
        window.location.href = url;
      }
    }
  }
</script>
