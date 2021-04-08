<template>
  <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
    <h2>车费统计</h2>
    <form class="form-horizontal">
      <div class="form-group">
        <label class="col-sm-2 control-label">开始时间:</label>
        <div class="col-sm-4"><input class="form-control form_date" type="text" v-model="start_check_time"></div>
        <label class="col-sm-2 control-label">结束时间:</label>
        <div class="col-sm-4">
          <input class="form-control form_date" type="text" v-model="end_check_time">
        </div>
      </div>
      <div class="form-group">
        <div v-show="!companySelect">
          <label class="col-sm-2 control-label">选择班车公司:</label>
          <div class="col-sm-4">
            <select class="form-control" v-model='data.companyId'>
              <option :value="company.id" v-for="company in company_list">{{company.name}}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <div class="col-sm-4 col-sm-offset-2">
            <button class="btn btn-primary" @click.prevent="filter">筛选</button>
            <button class="btn btn-success" @click.prevent="fetch">显示全部</button>
          </div>
        </div>

      </div>
    </form>

    <table class="table table-striped">
      <thead>
      <tr>
        <th>班车公司</th><th>已使用</th><th>应缴管理费</th><th>实际转账额</th><th>总金额（元）</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="statistic in statistics">
        <td>{{statistic.companyName}}</td>
        <td>{{statistic.count}}</td>
        <td>{{(statistic.money * 0.06).toFixed(2)}}</td>
        <td>{{(statistic.money - (statistic.money * 0.06).toFixed(2)).toFixed(2)}}</td>
        <td>{{statistic.money.toFixed(2)}}</td>
      </tr>
      </tbody>
      <tfoot>
        <tr>
            <th colspan="4" style="text-align:right;">合计</th>
            <td>{{total}}</td>
        </tr>
      </tfoot>
    </table>
    <pagination @getnewres='callback' :url="url" :count="count" :limit="limit" style="display:none;"></pagination>
  </div>


</template>
<style>

</style>
<script>
  import Vue from 'vue'
  import vue_resource from 'vue-resource'
  import util from '../../../common/util'
  import pagination from '../pagination.vue'
  Vue.use(vue_resource)
  export default{
    data(){
      return {
        statistics:[],
        total: 0,
        url:'/api/web/orders/getStatistics',
        count:0,
        limit:10,
        pagination_data:{
          limit: this.limit,
          offset:"0"
        },
        start_check_time: '',
        end_check_time: '',
        data:{
          companyId:'',
          start_check_time:'',
          end_check_time:''
        },
        company_list:[],
        show_all_btn:false,
        companySelect:false
      }
    },
    components: {pagination},
    watch: {
      start_check_time: function () {
        var vm = this
        if (vm.start_check_time) {
          vm.data.start_check_time = vm.start_check_time + ' 00:00:00'
        } else {
          vm.data.start_check_time = ''
        }
      },
      end_check_time: function () {
        var vm = this
        if (vm.end_check_time) {
          vm.data.end_check_time = vm.end_check_time + ' 23:59:59'
        } else {
          vm.data.end_check_time = ''
        }
      }
    },
    methods:{
      formatDate:function(obj){
        return util.formatDate(new Date(obj))
      },
      reduceSeconds:function(time){
        return util.removeSeconds(time)
      },
      formatTime:function(obj){
        return util.formatTime(new Date(obj))
      },
      callback:function(res){
        //set count number
        this.count=res.body.data.length
        this.total=res.body.data.reduce((a,b)=>{
            return (a+b.money)
        }, 0).toFixed(2)
        this.$set('statistics',res.body.data)
      },
      fetch:function(){
        this.show_all_btn=false
        var json={}
        //clean data
        for(let key in this.data){
          if(key!='companyId')
            this.data[key]=''
        }
        for(let key in this.data){
          if(this.data[key])
            json[key]=this.data[key]
        }
        Object.assign(json,this.pagination_data)
        util.nextPage.call(this,this.url,{
          data:json
        },this.callback)
      },
      filter:function(){
        this.show_all_btn=true
        var data=this.data
        var json={}
        for(var key in data){
          if(data[key])
            json[key]=data[key]
        }

        util.nextPage.call(this,this.url,{
          data: json
        },this.callback)
      },
      fetchCompany(){
        this.$http.post('/api/web/company/getAll',{}).then(function(res){
          this.$set('company_list',res.body.data.rows)
        })
      }
    },
    ready:function(){
      if(__session.admin.company_id){
        this.data.companyId=__session.admin.company_id
        this.companySelect=true
        return this.fetch()
      }
      this.fetch()
      this.fetchCompany()
    }
  }
</script>
