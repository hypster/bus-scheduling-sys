<template>
    <div>
      <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
        <h2 class="sub-header">班车线路管理</h2>
        <div>
          <div class="form-group">
            <label class="col-sm-1" class="label-form" >始发站</label>
            <div class="col-sm-2">
              <select v-model="data.start_station_id" class="form-control">
                <option :value="station.id" v-for="station in station_list">{{station.name}}</option>
              </select>
            </div>
            <label class="col-sm-1" class="label-form">终点站</label>
            <div class="col-sm-2">
              <select v-model="data.terminal_station_id" class="form-control">
                <option :value="station.id" v-for="station in station_list">{{station.name}}</option>
              </select>
            </div>
            <div class="col-sm-5">
              <button class="btn btn-primary" @click="query">查询</button>
              <button class="btn btn-success" @click="addLine">新增线路</button>
              <button class="btn btn-info" @click='showAll' v-show="show_all_show">显示全部</button>
            </div>
          </div>
        </div>
        <table class="table table-striped">
          <thead>
          <tr>
            <th>班车线路编号</th>
            <th>班车线路名称</th>
            <th>始发站</th>
            <th>终点站</th>
            <th>线路属性</th>
            <th>备注</th>
            <th>操作</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="line in line_list">
            <td>{{line.serial_no}}</td>
            <td>{{line.start_station}}→{{line.terminal_station}}</td>
            <td>{{line.start_station}}</td>
            <td>{{line.terminal_station}}</td>
            <td>{{line.type==0?'离校':'返校'}}</td>
            <td>{{line.description}}</td>
            <td><button class="btn btn-info" @click='modify(line)'>修改</button><button class="btn btn-danger" @click="deleteItem(line)">删除</button></td>
          </tr>
          </tbody>
        </table>
        <pagination  @getnewres='callback' :url="url" :count="count" :limit="limit"></pagination>
        <modal_line :station_list="station_list" v-show="modal_line_show" :line_in_edit="line_in_edit" :type="type" @close="closeLogic"></modal_line>
      </div>
    </div>
</template>
<style>

</style>
<script>
    import pagination from '../pagination.vue'
    import modal_line from './modal_line.vue'
    export default{
        data(){
            return{
              url:'/api/web/v_bus_line/getPage',
              limit:10,
              line_list:[],
              station_list:[],
              count:0,
              line_in_edit:'',
              modal_line_show:false,
              type:'',
              data:{
                start_station_id:'',
                terminal_station_id:''
              },
              show_all_show:false
            }
        },
        components:{
            pagination,
            modal_line
        },
        methods:{
          fetchAll:function(){
            this.$http.post(this.url,{
            data:{
              limit:this.limit,
              offset:"0"
            }

            }).then(this.callback)
          },
          closeLogic: function (type) {
            this.modal_line_show = false;
            this.line_in_edit = ''
            if (type == 'add'||type=='modify') {
              this.fetchAll()
            }
            this.type = ''
          },
          callback:function(res){
            console.log(res)
            //set count number
            this.count=res.body.data.count
            this.$set('line_list',res.body.data.rows)
          },
          modify:function(item){
            console.log('in modify')
            this.modal_line_show = true;
            this.line_in_edit = item
            this.type = 'modify'
          },
          addLine: function () {
            console.log('in add line')
            this.modal_line_show = true
            this.type = 'add'
          },
          deleteItem:function(item){
            console.log('in delete item')
            if(!confirm('确认删除?')){
              return
            }
            this.$http.post('/api/web/bus_line/setDel',{
              id:item.id
            }).then(function(res){
              console.log(res)
              this.fetchAll()
            })
          },
          query:function(){
            console.log('in query')
            var json={}
            var data=this.data
            for(var key in data){
              if(data[key])
                json[key]=data[key]
            }
            this.$http.post('/api/web/v_bus_line/getPage',{
              data:json
            }).then(function(res){
            this.show_all_show=true
              console.log(res)
              this.$set('line_list',res.body.data.rows)
            })

          },
          showAll:function(){
            this.show_all_show=false
            this.fetchAll()
            for(var key in this.data){
              this.data[key]=''
            }
          }
        },
        ready:function(){
          this.fetchAll()
          this.$http.post('/api/web/station/getAll',{}).then(function(res){
              console.log(res)
              this.station_list=res.body.data.rows
          })
        }
    }
</script>
