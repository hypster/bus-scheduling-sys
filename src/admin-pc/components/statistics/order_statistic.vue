<template>
  <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
    <h2>售票统计</h2>
    <form class="form-horizontal">
      <div class="form-group">
        <label class="col-sm-2 control-label">开始时间:</label>
        <div class="col-sm-4"><input class="form-control form_datetime" type="text" v-model="data.start_detail_time" required></div>
        <label class="col-sm-2 control-label">结束时间:</label>
        <div class="col-sm-4">
          <input class="form-control form_datetime" type="text" v-model="data.end_detail_time" required>
        </div>
      </div>
    <div class="form-group" >
        <div v-show="!companySelect">
          <label class="col-sm-2 control-label">选择班车公司:</label>
          <div class="col-sm-4">
            <select class="form-control" v-model='data.companyId' required>
              <option :value="company.id" v-for="company in company_list">{{company.name}}</option>
            </select>
          </div>
        </div>

        <label class="col-sm-2 control-label">批次选择:</label>
        <div class="col-sm-4">
          <select class="form-control" v-model='data.batch_id' required>
            <option :value="batch.id" v-for="batch in batch_list">{{formatDate(batch.start_time)}}-{{formatDate(batch.end_time)}}</option>
          </select>
        </div>
      </div>
      <div class="col-sm-4 col-sm-offset-2">
        <button class="btn btn-primary" @click.prevent="filter">筛选</button>
        <button class="btn btn-success"  @click.prevent="fetch">显示全部</button>
        </div>
    </form>

    <table class="table table-striped">
      <thead>
      <tr>
        <th>日期</th><th>线路</th><th>发车时间</th><th>总票数</th><th>已售票数</th><th>已使用</th><th>未使用</th><th>已过期</th><th>已退</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="order in order_list">
        <td>{{formatDate(order.start_time)}}</td>
        <td>{{order.name}}</td>
        <td>{{reduceSeconds(order.begin_time)}}</td>
        <td>{{order.seat_count}}</td>
        <td>{{order.sum}}</td>
        <td>{{order.alreadyUsed}}</td>
        <td>{{order.notUsed}}</td>
        <td>{{order.rxpired}}</td>
        <td>{{order.eefunded}}</td>
      </tr>
      </tbody>
    </table>
    <pagination  @getnewres='callback' :url="url" :count="count" :limit="limit" :option="data" :order="order"></pagination>
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
        order_list:[],
        url:'/api/web/v_StatisticsDetail/getPage',
        count:0,
        limit:10,
        pagination_data:{
          limit:10,
          offset:"0",
          order: 'start_time desc, begin_time'
        },
        data:{
          start_detail_time:'',
          end_detail_time:'',
          companyId:'',
          batch_id:''
        },
        company_list:[],
        batch_list:[],
        show_all_btn:false,
        inFilter:false,
        companySelect:false,
        order: 'start_time desc, begin_time'
      }
    },
    components: {pagination},
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
        console.log(res)
        //set count number
        this.count=res.body.data.count
        this.$set('order_list',res.body.data.rows)
      },
      fetch:function(){
        this.inFilter=false
        this.show_all_btn=false
        //clear data
        for(var key in this.data){
          if(key=='companyId'&&this.companySelect){
            continue
          }
          this.data[key]=''
        }
        // select and copy data
        var json={}
        for(var key in this.data){
          if(this.data[key]){
            json[key]=this.data[key]
          }
        }
        // add pagination_data
        Object.assign(json,this.pagination_data)
        util.nextPage.call(this,this.url,{
          data:json
        },this.callback)
      },
      filter:function(){
        this.inFilter=true
        this.show_all_btn=true
        var data=this.data
        var json={}
        for(var key in data){
          if(data[key]){
          if(key=='start_detail_time'||key=='end_detail_time')
            json[key]=new Date(data[key])
          else
            json[key]=data[key]
          }
        }
        Object.assign(json,this.pagination_data)
        util.nextPage.call(this,this.url,{
          data:json
        },this.callback)
      }

    },
    ready:function(){
      this.$http.post('/api/web/dispatch_batch/getAll',{
        data:{
          order:"start_time desc"
        }
      }).then(function(res){
        this.$set('batch_list',res.body.data.rows)
      })
      if(__session.admin.company_id){
        this.companySelect=true
        this.data.companyId=__session.admin.company_id
        return this.fetch()
      }
      this.fetch()
      this.$http.post('/api/web/company/getAll',{
      }).then(function(res){
        this.$set('company_list',res.body.data.rows)
      })
    }
  }
</script>
