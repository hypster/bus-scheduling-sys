<template>
  <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
    <h2>班车信息管理</h2>
    <form class="form-horizontal bus_form">
      <div class="row">
        <label class="col-sm-2 control-label">班车类型</label>
        <div class="col-sm-4">
          <input type="text" class="form-control" v-model='data.name'>
        </div>
        <div v-show="!companySelect">
          <label class="col-sm-2 control-label">所属公司</label>
          <div class="col-sm-4">
            <select v-model="data.company_id" class="form-control">
              <option v-for="company in company_list" :value="company.id">{{company.name}}</option>
            </select>
        </div>
          <!--<input type="text" class="form-control" v-model="current_companyName">-->
        </div>
      </div>

      <div class="row">
        <label class="col-sm-2 control-label">车号</label>
        <div class="col-sm-4">
          <input type="text" class="form-control" v-model='data.license_plate'>
        </div>

          <label class="col-sm-2 control-label">座位数</label>
          <div class="col-sm-4">
            <input type="text" class="form-control" v-model='data.seat_count'>
          </div>
        </div>

      <div class="row">
        <label class="col-sm-2 control-label">备注</label>
        <div class="col-sm-4">
          <input type="text" class="form-control">
        </div>
        <div class="col-sm-2"></div>
        <div class="col-sm-4">
          <button class="btn btn-primary" @click.prevent="search">查询</button>
          <button class="btn btn-success" @click.prevent="addNew">新增</button>
          <button class="btn btn-info" @click.prevent="showAll">显示全部</button>
        </div>

      </div>


    </form>

    <table class="table table-striped">
      <thead>
      <tr>
        <th>班车编号</th>
        <th>班车类型</th>
        <th>座位数</th>
        <th>所属公司</th>
        <th>车号</th>
        <th colspan="3">操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="bus in bus_list">
        <td>{{bus.serial_no}}</td>
        <td>{{bus.name}}</td>
        <td>{{bus.seat_count}}</td>
        <td>{{bus.companyName}}</td>
        <td>{{bus.license_plate}}</td>
        <td>
          <button class="btn btn-primary" @click="modify(bus)" v-show="!this.companySelect">修改</button>
        </td>
        <td>
          <button class="btn btn-success" @click='generateBarCode(bus)'>生成二维码</button>
        </td>
        <td>
          <button class="btn btn-danger" @click="deleteItem(bus)" v-show="!this.companySelect">删除</button>
        </td>
      </tr>
      </tbody>
    </table>
    <pagination @getnewres='callback' :url="url" :count="count" :limit="limit" :option="data"></pagination>
    <modal_bus :type='type' v-show="modal_bus_show" :bus_in_edit="bus_in_edit" @close="closeLogic" :companyselect="companySelect" :selected_company_id="data.company_id"></modal_bus>
    <modal_barcode :type='type' v-show='modal_barcode_show' :bus_in_edit="bus_in_edit" @close="closeLogic"></modal_barcode>
  </div>
</template>
<style lang="scss">
.bus_form{
  .row{
    margin-top: 1em;
  }
}
</style>
<script>
  import Vue from 'vue'
  import vue_resource from 'vue-resource'
  Vue.use(vue_resource)
  import pagination from '../../components/pagination.vue'
  import modal_bus from './modal_bus.vue'
  import modal_barcode from './modal_barcode.vue'
  import util from '../../../common/util'
  export default{
    data(){
      return {
        bus_list: [],
        limit: 10,
        url:'/api/web/v_bus/getPage',
        count:0,
        modal_bus_show:false,
        modal_barcode_show:false,
        bus_in_edit:'',
        type:'',
        data:{
          offset: '0',
          company_id:'',
          license_plate:'',
          seat_count:'',
          name:''
        },
        company_list:'',
        show_all_show:false,
        companySelect:false,
        option:{}
      }
    },
    methods:{
      callback:function (res) {
        console.log(res)
        this.$set('bus_list', res.body.data.rows)
        this.count=res.body.data.count
      },
      modify: function (item) {
        console.log('in modify')
        this.bus_in_edit = item
        this.modal_bus_show = true
        this.type='modify'
      },
      closeLogic:function(type){
        console.log(type)
        console.log('in close logic parent')
        if(type=='modify'||type=='add')
          this.modal_bus_show=false
        else if(type=='barcode')
          this.modal_barcode_show=false
        this.bus_in_edit=''
        if(type=='add'||type=='modify'){
          this.fetch()
        }

      },
      addNew:function(){
        console.log('in edit new')
        this.modal_bus_show=true
        this.type='add'
      },

      fetch:function(){
        var data={}
        for(let key in this.data){
          if(this.data[key])
            data[key]=this.data[key]
        }
        data.limit=this.limit
        this.$http.post(this.url, {
          data
        }).then(this.callback)
      },
      deleteItem:function(item){
        if(!confirm('确认删除?'))
          return
        this.$http.post('/api/web/bus/setDel',{
          id:item.id
        }).then(function(res){
          console.log(res)
          this.fetch()
        })
      },
      generateBarCode:function(bus){
        this.modal_barcode_show=true
        this.type='barcode'
        this.bus_in_edit=bus
      },
      search:function(){
      this.show_all_show=true
        this.fetch()
      },

      showAll:function(){
        for(var key in this.data){
          this.data[key]=''
        }
        if(this.fromCompany()){
          this.preproForCompany()
        }
        this.data.limit=10
        this.data.offset="0"
        this.show_all_show=false
        this.fetch()
      },
      fetchCompany(){
        this.$http.post('/api/web/company/getPage', {
            data: {
              limit: 9999,
              offset: '0'
            }
          }).then(function(res){
          console.log(res)
          this.$set('company_list',res.body.data.rows)
        })
      },
      preproForCompany(){
        if(__session.admin.company_id){
          this.data.company_id=__session.admin.company_id
          this.option.company_id=__session.admin.company_id
          this.companySelect=true
          }
      },
      fromCompany(){
        return __session.admin.company_id
      }
    },
    components: {pagination,modal_bus,modal_barcode},
    ready: function (){
      if(this.fromCompany()){
        this.preproForCompany()
        return this.fetch()
      }
      this.fetchCompany()
      this.fetch()

    }
  }
</script>
