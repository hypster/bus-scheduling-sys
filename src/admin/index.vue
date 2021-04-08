<template>
  <div class="sold_ticket_stat">
    <div class="weui-cells__title page-title">检票统计</div>
    <div class="weui-cells weui-cells_form">
      <div class="weui-cell">
        <div class="weui-cell__hd"><label class="weui-label">日期</label></div>
        <div class="weui-cell__bd">
          <input class="weui-input" type="date" v-model="dispatch_date" placeholder="请选择日期">
        </div>
      </div>
      <div class="weui-cell weui-cell_select weui-cell_select-after">
        <div class="weui-cell__hd">
          <label class="weui-label">公司</label>
        </div>
        <div class="weui-cell__bd">
          <select class="weui-select" name="select2" v-model="company_id">
            <option v-for="company in company_list" :value="company.id">{{company.name}}</option>
          </select>
        </div>
      </div>
      <div class="weui-cell weui-cell_switch">
        <div class="weui-cell__bd">按路线统计</div>
        <div class="weui-cell__ft">
          <input class="weui-switch" type="checkbox" v-model="bySchedule">
        </div>
      </div>
    </div>

    <div class="refresh-button-area">
        <a href="javascript:;" class="weui-btn weui-btn_plain-primary" :class="{'weui-btn_plain-disabled': !(dispatch_date && company_id)}" @click="fetchData">刷新</a>
    </div>

    <div v-for="item in list" class="list">
      <div class="weui-cells__title" v-show="bySchedule">
        {{item.direction }}&nbsp;{{item.time}}
      </div>
      <div class="weui-cells">
        <div v-for="detail in item.detail" class="weui-cell">
          <div class="weui-cell__bd">
            <p>车号：<span class="dataValue">{{detail.card_plate}}</span></p>
          </div>
          <div class="weui-cell__ft">已检票：<span class="checked_num dataValue">{{detail.tickets.checked_num}}</span>张</div>
        </div>
      </div>
    </div>
    <div v-show="!loading && !list.length && (dispatch_date && company_id)">
      <p style="text-align: center;">暂无检票数据</p>
    </div>
  </div>


</template>
<style scoped lang="scss">
  .dataValue {
    font-size: 20px;
    font-weight: bold;
  }
  .checked_num{
    color: #00C000;
  }
  .weui-cell__ft{
    color:#000;
  }
  .list .weui-cell{
    /*padding-right: 15px;*/
  }
  .refresh-button-area {
    margin: 0 auto;
    padding: 15px 0;
    width: 50%;
    .weui-btn {
      font-size: 16px;
    }
  }

</style>
<script>
  import Vue from 'vue'

  import vue_resource from 'vue-resource'
  Vue.use(vue_resource)
  import util from '../common/util'
  export default {
    data() {
      return {
        dispatch_date: null,
        company_id: null,
        list: [],
        company_list: {},
        bySchedule: false,
        loading: false
      }
    },
    watch: {
      dispatch_date: `fetchData`,
      company_id: `fetchData`,
      bySchedule: `fetchData`
    },
    computed: {},
    methods: {
      fetchData () {
        var vm = this
        if (!vm.dispatch_date || !vm.company_id) {
          return false
        }
        if (vm.loading) {
          return false
        }
        vm.loading = true
        vm.list = []
        if (vm.bySchedule) {
          vm.$http.get(`/api/tickets/status/statistics?dispatchDate=${vm.dispatch_date}&companyId=${vm.company_id}`).then(res => {
            vm.loading = false
            if (res.body.code !== 0) {
              return alert(res.body.message)
            } else {
              var statistics = res.body.data
              statistics.forEach(s => {
                var item = {
                  time: s.schedule.begin_time.substr(0,5) + ((s.schedule.end_time !== '00:00:00') ? ` - ${s.schedule.end_time.substr(0,5)}` : ''),
                  direction: s.schedule.bus_line.name,
                  detail: s.buses.map(b => { 
                    return {
                      card_plate: b.license_plate, 
                      tickets: {
                        checked_num: b.checkedCount 
                      }
                    }
                  })
                }
                vm.list.push(item)
              })
            }
          })
        } else {
          vm.$http.get(`/api/tickets/status/statisticsByBus?dispatchDate=${vm.dispatch_date}&companyId=${vm.company_id}`).then(res => {
            vm.loading = false
            if (res.body.code !== 0) {
              return alert(res.body.message)
            } else {
              var statistics = res.body.data
              statistics.forEach(s => {
                var item = {
                  time: '',
                  direction: '',
                  detail: s.buses.map(b => { 
                    return {
                      card_plate: b.license_plate, 
                      tickets: {
                        checked_num: b.checkedCount 
                      }
                    }
                  })
                }
                vm.list.push(item)
              })
            }
          })
        }
      }
    },
    components: {},
    ready: function () {
      var today = new Date()
      this.dispatch_date = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`
      //fill company_list
      this.$http.post('/api/web/company/getPage', {
        data: {
          limit: 9999,
          offset: "0"
        }
      }).then(function (res) {
        var companyList = res.body.data.rows
        if (companyList.length) {
          this.company_id = companyList[0].id
        }
        this.$set('company_list', companyList)
      })
    }
  }
</script>
