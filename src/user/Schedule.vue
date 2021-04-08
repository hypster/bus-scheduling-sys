<template>
	<div class="schedule">
		<div class="weui-cells__title page-title">上师大校车班次时间表</div>
		<div class="weui-cells date-time-filter-section">
			<div class="weui-cell weui-cell_select date">
				<div class="weui-cell__hd">
					<label class="weui-label">日期</label>
				</div>
				<div class="weui-cell__bd">
					<!--<input type="date" value="" class="weui-input" v-model="selectedDate">-->
          <select class="weui-select"  v-model="selectedDate">
            <option v-for='date in all_dates' v-bind:value='date'>{{formatDate(date)}}</option>
          </select>
				</div>
			</div>
			<!--<div class="weui-cell weui-cell_select time">-->
			<!--<div class="weui-cell__hd">-->
			<!--<label for="" class="weui-label">时间</label>-->
			<!--</div>-->
			<!--<div class="weui-cell__bd">-->
			<!--<select name="time" class="weui-select">-->
			<!--<option selected="selected" value="1">全天</option>-->
			<!--<option value="2"> 上午</option>-->
			<!--<option value="3"> 下午</option>-->
			<!--</select>-->
			<!--</div>-->
			<!--</div>-->
			<div class="weui-btn-area" v-show='selectedDate'><a href="javascript:" class="weui-btn weui-btn_plain-primary filter-btn" @click='selectedDate=false'>显示全部</a></div>
			<div class="weui-cell">

				<p class="weui-footer__text info-display-all" v-show='!selectedDate'>*已显示全部班车信息</p>
			</div>
		</div>

		<div class="schedule-table-wrapper">
			<routes v-for="routes in computedRoutes" :routes="routes"></routes>
		</div>
    <weui-toast :options="toast"></weui-toast>
	</div>
</template>
<style src="./assets/main.scss" lang="scss">

</style>
<script>
  import Vue from 'vue'
  import routes from './components/Routes.vue'
  import vue_resource from 'vue-resource'
  Vue.use(vue_resource)
  import util from '../common/util'
  export default {
    data() {
      return {
        routesByDate: [],
        selectedDate: false,
        selectedTime: '',
        all_dates:[]
      }
    },
    computed:{
      computedRoutes:function(){
        if (this.selectedDate){
          var selectedDate=this.selectedDate
          var filtered = this.routesByDate.filter(function (routes) {
            var d1 = routes[0].departure
            var d2 = new Date(selectedDate)
            return d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate()
          })
          return filtered

        }else
          return this.routesByDate
      }
    },
    methods: {
        formatDate:function(obj){
          return util.formatDate(obj)
        }

    },
    components: {
      routes
    },
    ready:function(){
      var routes=[]
      this.$http.get('/api/bus_lines/'+localStorage.getItem('lineId')+'/activedispatches?companyId='+localStorage.getItem('companyId')).then(function(res){
        var d=res.body.data
        d.forEach(function(route){
          var tc=route.seat_count,
            s=route.schedule.bus_line.start_station.name,
            e=route.schedule.bus_line.terminal_station.name,
            c=route.schedule.company.name,
            d=route.start_time,
            p=route.use_full_price?route.schedule.full_price:route.schedule.price,
            et=route.schedule.end_time.split(':'),
            date=new Date(d),
            t=route.schedule.begin_time.split(':'),
            h=parseInt(t[0]),
            m=parseInt(t[1]),
            b_id=route.batch_id,
            s_id=route.schedule.id,
            date2

          date.setHours(h)
          date.setMinutes(m)
          if(parseInt(et[0])){
            date2=new Date(Number(date))
            var h2=parseInt(et[0])
            var m2=parseInt(et[1])
            date2.setHours(h2)
            date2.setMinutes(m2)
          }

          // 过滤掉已截止但未成团的团购
          if (!(route.schedule.is_pre_order && (route.pre_order_completed==0) && route.stopOrder)) {
            routes.push({
              id: route.id,
              start: s,
              end: e,
              company: c,
              departure: date,
              date2:date2,
              totalSeat: tc,
              b_id:b_id,
              s_id:s_id,
              use_fp: route.use_full_price,
              fp_sold: route.full_price_sold_count,
              fp_rest: (route.full_price_seat_count - route.full_price_sold_count),
              sold: route.sold_count,
              rest: (route.seat_count - route.sold_count),
              price: p,
              stopOrder: route.stopOrder,
              is_pre_order: route.schedule.is_pre_order,
              limit_count: route.schedule.limit_count,
              pre_order_completed: route.pre_order_completed,
            })
          }
        })

        // routes.sort(function(a,b){
        //   return a.departure-b.departure
        // })
        var map={}
        routes.forEach(function(route){
          var date=route.departure.toLocaleDateString()+''
            if(!map.hasOwnProperty(date)){
              map[date]=[]
            }
            map[date].push(route)
        })

        var res=[]
        for(var key in map){
          res.push(map[key])
        }
        this.$set("routesByDate",res)

//      set the date filter options
        var all_dates=this.routesByDate.map(function(route){
          return route[0].departure
        })
        this.$set('all_dates',all_dates)
      })
    }
  }
</script>
