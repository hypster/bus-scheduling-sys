<template>
    <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
      <h2 class="sub-header">售票明细查询</h2>
      <div>
        <form class="row">
          <div class="col-sm-6">
            <div class="form-group form-group-sm row">
              <label for="card_number" class="col-form-label col-sm-3">用户卡号</label>
              <div class="col-sm-6">
                <input type="input" class="form-control"  id="card_number" v-model='data.corp_user_id'>
              </div>
            </div>
            <!--<div class="form-group form-group-sm row">-->
              <!--<label for="serial_number" class="col-form-label col-sm-3">流水号</label>-->
              <!--<div class="col-sm-6">-->
                <!--<input type="input" class="form-control"  id="serial_number" v-model="data.serial_no">-->
              <!--</div>-->
            <!--</div>-->
            <div class="form-group form-group-sm row">
              <label for="company" class="col-form-label col-sm-3">客运公司</label>
              <div class="col-sm-6">
                <select class="form-control" id="company" v-model='data.companyId'>
                  <option v-for="company in companies"  :value="company.id">{{company.name}}</option>
                </select>
              </div>
            </div>
            <div class="form-group form-group-sm row">
              <label for="line" class="col-form-label col-sm-3">班车线路</label>
              <div class="col-sm-6">
                <select class="form-control" id="line" v-model='data.bus_lineName'>
                  <option v-for="line in bus_lines" :value="line.name">{{line.name}}</option>
                </select>
              </div>
            </div>
          </div>
          <div class="col-sm-6">

            <!--<fieldset class="form-group form-group-sm row">-->
              <!--<label class="col-form-legend col-sm-2">单价</label>-->
              <!--<div class="col-sm-10">-->
                <!--<div class="row">-->
                  <!--<div class="col-sm-6">-->
                    <!--<div class="row">-->
                      <!--<span class="col-form-label col-sm-2">从</span>-->
                      <!--<div class="col-sm-10">-->
                        <!--<input class="form-control input-sm" id="price1">-->
                      <!--</div>-->
                    <!--</div>-->
                  <!--</div>-->
                  <!--<div class="col-sm-6">-->
                    <!--<div class="row">-->
                      <!--<span class="col-form-label col-sm-2">到</span>-->
                      <!--<div class="col-sm-10">-->
                        <!--<input class="form-control input-sm" id="price2">-->
                      <!--</div>-->
                    <!--</div>-->
                  <!--</div>-->
                <!--</div>-->
              <!--</div>-->
            <!--</fieldset>-->
            <!--<div class="form-group form-group-sm row">-->
              <!--<label class="col-form-label col-sm-2">预定时间</label>-->
              <!--<div class="col-sm-10">-->
                <!--<div class="row">-->
                  <!--<div class="col-sm-6">-->
                    <!--<div class="row">-->
                      <!--<span class="col-form-label col-sm-2">从</span>-->
                      <!--<div class="col-sm-10">-->
                        <!--<input class="form-control form_date" type="text" id="date1">-->
                      <!--</div>-->
                    <!--</div>-->
                  <!--</div>-->

                  <!--<div class="col-sm-6">-->
                    <!--<div class="row">-->
                      <!--<span class="col-form-label col-sm-2">到</span>-->
                      <!--<div class="col-sm-10">-->
                        <!--<input class="form-control form_date" type="text" id="date2">-->
                      <!--</div>-->
                    <!--</div>-->
                  <!--</div>-->
                <!--</div>-->
              <!--</div>-->
            <!--</div>-->
            <div class="form-group form-group-sm row">
              <label for="bus" class="col-form-label col-sm-3">班车选择</label>
              <div class="col-sm-6">
                <select class="form-control" id="bus" v-model="data.scheduleid">
                  <option v-for="time in timetables" value="{{time.id}}">{{formatTime(time.begin_time)}}{{time.end_time!="00:00:00"?'-'+formatTime(time.end_time):''}}</option>
                </select>
              </div>
            </div>

            <!-- 目前只支持查询已支付的订单 -->
            <!--<div class="form-group form-group-sm row">
              <label class="col-form-label col-sm-3" for="order_status">订单状态</label>
              <div class="col-sm-6">
                <select class="form-control" id="order_status" v-model="data.status">
                  <option v-for="status in order_status" :value="status.code">{{status.label}}</option>
                </select>
              </div>
            </div>-->

            <div class="form-group form-group-sm row">
              <label class="col-form-label col-sm-3" for="batch">售票批次</label>
              <div class="col-sm-6">
                <select class="form-control" id="batch" v-model="data.batchid" >
                  <option v-for="batch in batches" value="{{batch.id}}">
                  {{formatDate(batch.start_time)}}-{{formatDate(batch.end_time)}}</option>
                </select>
              </div>
            </div>
            <div class="form-group form-group-sm row">
              <div class="col-sm-10 col-sm-offset-3">
                <button type="submit" class="btn btn-primary" @click.prevent="search">查询</button>
                <button v-show="show_all_show" class="btn btn-info" @click.prevent="showAll">显示全部</button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div class="row">
        <table class="table table-striped">
          <thead>
          <tr>
            <th>用户卡号</th>
            <th>流水号</th>
            <th>预定人</th>
            <th>所属公司名称</th>
            <th>所属线路名称</th>
            <th>车次</th>
            <th>单价</th>
            <th>数量</th>
            <th>预定时间</th>
            <th>订单状态</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for='order in order_details'>
            <td>{{order.corp_user_id}}</td>
            <td>{{order.serial_no}}</td>
            <td>{{order.name}}</td>
            <td>{{order.companyName}}</td>
            <td>{{order.bus_lineName}}</td>
            <td>{{formatTime(order.begin_time)}}{{order.end_time!="00:00:00"?'-'+formatTime(order.end_time):""}}</td>
            <td>{{order.total}}</td>
            <td>{{order.orderCount}}</td>
            <td>{{formatDate(order.create_time)}}</td>
            <td>{{translateStatus(order.status, order.Tstatus)}}</td>
          </tr>
          </tbody>
        </table>
      </div>
      <pagination v-show='pagination_show' @getnewres='callback' :url="url" :count="count" :limit="limit"></pagination>
  </div>

</template>
<style>

</style>
<script>
  import Vue from 'vue'
  import vue_resource from 'vue-resource'
  import pagination from '../../components/pagination.vue'
  Vue.use(vue_resource)
  import util from '../../../common/util'
  export default{
    data(){
      return {
        companies:[],
        bus_lines:[],
        timetables:[],
        order_details:[],
        batches:[],
        order_status:[
          {
            code:"0",
            label:"已下单"
          },
          {
            code:"1",
            label:"已支付"
          },
          {
            code:"2",
            label:"超时"
          },
          {
            code:"9",
            label:"已取消"
          }
        ],

        url:'/api/web/v_order/getPage',
        count:0,
        limit:10,
        pagination_show:true,
        show_all_show:false,
        data:{
          limit:9999,
          offset:"0",
          companyId:'',
          name:'',
          scheduleid:'',
          batchid:'',
          corp_user_id:'',
          status:'',
          serial_no:''
        }
      }
    },
    methods:{
      search:function(){
        console.log('in search')
        this.pagination_show=false
        this.show_all_show=true
        var data=this.data
        var json={}
        for(var key in data){
          if(data[key]||data[key]=="0")
            json[key]=data[key]
        }
        this.$http.post('/api/web/v_order/getPage',{
          data:json
        }).then(function(res){
          this.$set('order_details',res.body.data.rows)
        })
      },

      showAll:function(){
        this.pagination_show=true
        this.show_all_show=false
        this.fetchAll()
        this.clearAll()
      },

      clearAll:function(){
        for(var key in this.data){
          this.data[key]=''
        }
      },

      translateStatus:function(status, Tstatus){
        var ret=''
        if (Tstatus && Tstatus === 3) {  // 已退票
          return '已退票'
        }
        switch (status){
          case 0:
            ret='已下单'
            break
          case 1:
            ret='已支付'
            break
          case 2:
            ret='超时'
            break
          case 9:
            ret='已取消'
            break
        }
        return ret
      },
      formatDate:function(dateObj){
        return util.formatDate(new Date(dateObj))
      },
      formatTime:function(time){
       return util.removeSeconds(time)
      },
      fetchAll:function(){
        util.nextPage.call(this,this.url,{
          data: {
            limit: this.limit,
            offset:"0"
          }
        },this.callback)
      },
      callback:function(res){
        console.log(res)
        this.$set('order_details',res.body.data.rows)
        this.count=res.body.data.count
      }
    },
    ready:function(){
     this.$http.post('/api/web/company/getAll',{}).then(function(res){
      console.log(res)
      this.$set('companies',res.body.data.rows)
     })
     this.$http.post('/api/web/v_bus_line/getAll',{}).then(function(res){
      console.log(res)
        this.$set('bus_lines',res.body.data.rows)
     })
     this.$http.post('/api/web/v_schedule/getAll',{}).then(function(res){
      console.log(res)
      this.$set('timetables',res.body.data.rows)
     })

    this.fetchAll()

     this.$http.post('/api/web/dispatch_batch/getAll',{
       data:{order:"start_time desc"}
     }).then(function(res){
      console.log(res)
      this.$set('batches',res.body.data.rows)
     })
    },
    components: {
      pagination
    }
  }
</script>
