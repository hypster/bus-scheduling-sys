<template>
  <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
    <h2>车次管理</h2>
    <div class="form-inline">
      <div class="form-group">
        <label>
          班车公司
          <select v-model="data.companyId" class="form-control">
            <option :value="company.id" v-for="company in company_list">{{company.name}}</option>
          </select>
        </label>
      </div>
      <div class="form-group">
        <label>
          班车线路
          <select v-model="data.buslineId" class="form-control">
            <option :value="line.id" v-for="line in line_list">{{line.name}}</option>
          </select>
        </label>
      </div>


      <button class="btn btn-success" @click="query">查询</button>


      <button class="btn btn-primary" @click='addNew'>新增车次</button>
      <button class="btn btn-info" v-show="show_all_show" @click="showAll">显示全部</button>

    </div>

    <table class="table table-striped">
      <thead>
      <tr>
        <th>车次编号</th>
        <th>所属公司名称</th>
        <th>公司线路名称</th>
        <th>发车时间</th>
        <th>价格</th>
        <th>临时票价格</th>
        <th>备注</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in schedules">
        <td>{{getName(item.create_time)}}</td>
        <td>{{item.company}}</td>
        <td>{{item.name}}</td>
        <td>{{formatTime(item.begin_time)}}{{item.end_time!="00:00:00"?'-'+formatTime(item.end_time):''}}</td>
        <td>{{item.price}}</td>
        <td>{{item.full_price}}</td>
        <td>{{item.description}}</td>
        <td>
          <button class="btn btn-info" @click="modify(item)">修改</button>
          <button class="btn btn-danger" @click='deleteItem(item)'>删除</button>
        </td>
      </tr>
      </tbody>
    </table>
    <pagination  @getnewres='callback' :url="url" :count="count" :limit="limit"></pagination>
    <modal_schedule :type='type' v-show="modal_schedule_show" :schedule_in_edit="schedule_in_edit" @close="closeLogic"></modal_schedule>
  </div>
</template>
<style>

</style>
<script>
  import Vue from 'vue'
  import vue_resource from 'vue-resource'
  Vue.use(vue_resource)
  import util from '../../../common/util'
  import modal_schedule from './modal_schedule.vue'
  import pagination from '../../components/pagination.vue'
  export default{
    data(){
      return {
        limit: 10,
        schedules: [],
        schedule_in_edit: '',
        modal_schedule_show: false,
        show_all_show:false,
        url:'/api/web/v_schedule/getPage',
        type:'',
        company_list:[],
        line_list:[],
        count:0,
        data:{
          companyId:'',
          buslineId:''
        }
      }
    },
    components: {
      modal_schedule,
      pagination
    },
    methods: {
      formatTime:function(time){
        return util.removeSeconds(time)
      },
      modify: function (item) {
        console.log('in modify')
        this.schedule_in_edit = item
        this.modal_schedule_show = true
        this.type='modify'
      },
      getName:function(obj){
        return util.getName(new Date(obj))
      },

      closeLogic: function () {
        console.log('in close logic parent')
        this.modal_schedule_show = false;
        this.schedule_in_edit = ''
        if (this.type == 'add'||this.type=='modify') {
          this.fetchAll()
        }
        this.type = ''
      },
      fetchAll: function () {
        this.$http.post(this.url, {
          data: {
            limit: this.limit,
            offset: '0'
          }
        }).then(function (res) {
          console.log(res)
          this.$set('schedules', res.body.data.rows)
          this.count=res.body.data.count
        })
      },
      callback:function(res){
        this.$set('schedules', res.body.data.rows)
        this.count=res.body.data.count
      },

      query:function(){
        var json={}
        for(var key in this.data){
          if(this.data[key])
            json[key]=this.data[key]
        }
        this.$http.post('/api/web/v_schedule/getPage',{
          data:json
        }).then(function(res){
          console.log(res)
          this.$set('schedules',res.body.data.rows)
          this.count=res.body.data.count
          this.show_all_show=true
        })
      },
      showAll:function(){
        this.show_all_show=false
        this.fetchAll()
        for(var key in this.data){
          this.data[key]=''
        }
      },

      addNew:function(){
        console.log('in add new')
        this.type='add'
        this.modal_schedule_show = true

      },
      deleteItem:function(item){
        console.log('in delete')
        if(!confirm('确认删除?'))
          return
        this.$http.post('/api/web/schedule/setDel',{
          id:item.id
        }).then(function(res){
          console.log(res)
          this.fetchAll()
        })
      }
    },
    ready: function () {
      this.fetchAll()
      this.$http.post('/api/web/company/getAll',{}).then(function(res){
        console.log(res)
        this.$set('company_list',res.body.data.rows)
      })

      this.$http.post('/api/web/v_bus_line/getAll',{}).then(function(res){
        console.log(res)
        this.$set('line_list',res.body.data.rows)
      })
    }
  }
</script>
