<template>

  <div class="modal-mask" transition="modal">
    <div class="modal-wrapper">
      <div class="modal-container">

        <div class="modal-header">
        <h3>{{type=='add'?"新增线路":"修改线路"}}</h3>
        </div>

        <div class="modal-body">
          <slot name="body">
            <form class="form-horizontal" role="form">
              <div class="form-group">
                <label  class="col-sm-4 control-label">始发站</label>
                <div class="col-sm-3">

                  <select v-model="start_station_id" id="start_station" class="form-control" >
                    <option :value="station.id" v-for="station in station_list">{{station.name}}</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label  class="col-sm-4 control-label">终点站</label>
                <div class="col-sm-3">
                  <select v-model="terminal_station_id" id="terminal_station" class="form-control">
                    <option :value="station.id" v-for="station in station_list">{{station.name}}</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label  class="col-sm-4 control-label">线路属性</label>
                <div class="col-sm-3">
                  <select v-model='status' class="form-control">
                    <option value="0">离校</option>
                    <option value="1">返校</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label  class="col-sm-4 control-label">备注</label>
                <div class="col-sm-3">
                  <input type="input" required class="form-control" id="remark" v-model="description">
                </div>
              </div>
            </form>
          </slot>
        </div>

        <div class="modal-footer">
          <slot name="footer">
            <div class="form-group">
              <div class="btn-group">
                <button class="btn btn-default modal-default-button" @click="save">
                  保存
                </button>
                <button class="btn btn-default modal-default-button" @click="closeLogic">
                  取消
                </button>
              </div>
            </div>
          </slot>
        </div>
      </div>
    </div>
  </div>


</template>
<style>


</style>
<script>
  import Vue from 'vue'
  import vue_resource from 'vue-resource'
  Vue.use(vue_resource)
  import util from '../../../common/util'

  export default{
    data(){
      return {
        company_name:'',
        remark:'',
        name:'',
        description:'',
        status:'',
        start_station_id:'',
        terminal_station_id:''
      }
    },
    props: ['line_in_edit','type','station_list'],
    methods: {
      save:function(){
        console.log('in save')
        if(this.type=='modify'){
          this.save_modify()
        }else if(this.type=='add'){
          this.save_add()
        }
      },
      getName(){
          return $('#start_station option:selected').text()+'→'+$('#terminal_station option:selected').text()
        },
      save_modify:function(){
        this.$http.post('/api/web/bus_line/setEdit',{
          data:{
            id:this.line_in_edit.id,
            name:this.getName(),
            description:this.description,
            start_station_id:this.start_station_id,
            terminal_station_id:this.terminal_station_id,
            type:this.status
          }

        }).then(function(res){
          console.log(res)
          this.closeLogic()
        })
      },
      save_add:function(){
        this.$http.post('/api/web/bus_line/setAdd',{
          data:{
            serial_no:util.getName(new Date()),
            name:this.getName(),
            description:this.description,
            start_station_id:this.start_station_id,
            terminal_station_id:this.terminal_station_id,
            type:this.status
          }
        }).then(function(res){
          console.log(res)
          this.closeLogic()
        })
      },
      closeLogic:function(){
        this.line_in_edit=''
        this.description=''
        this.status=''
        this.start_station_id=''
        this.terminal_station_id=''
        this.$emit('close',this.type)
        this.type=''
      }
    },

    watch:{
      line_in_edit:function(){
        // this.name=this.line_in_edit.name
        this.description=this.line_in_edit.description
        this.status=this.line_in_edit.type
        this.start_station_id=this.line_in_edit.start_station_id
        this.terminal_station_id=this.line_in_edit.terminal_station_id
      }
    }
  }
</script>
