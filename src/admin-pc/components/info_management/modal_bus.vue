<template>

  <div class="modal-mask" transition="modal">
    <div class="modal-wrapper">
      <div class="modal-container">

        <div class="modal-header">
          <h3>{{type=='add'?'新增班车':'修改班车'}}</h3>
        </div>

        <div class="modal-body">
          <slot name="body">
            <form class="form-horizontal" role="form">
              <div class="form-group" v-show="!this.companyselect">
                <label  class="col-sm-4 control-label">所属公司</label>
                <div class="col-sm-3">
                  <select v-model="company_chosen_id" class="form-control">
                    <option :value="choice.id" v-for="choice in choice2">{{choice.name}}</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label  class="col-sm-4 control-label">班车类型</label>
                <div class="col-sm-3">
                  <input class="text form-control" v-model='name' checked>
                </div>
              </div>
              <div class="form-group">
                <label class="col-sm-4 control-label">座位数</label>
                <div class="col-sm-3">
                  <input type="number" v-model='seat_count' class="form-control">
                </div>
              </div>
              <div class="form-group">
                <label class="col-sm-4 control-label">车号</label>
                <div class="col-sm-3">
                  <input type="text" v-model='license_plate' class="form-control">
                </div>
              </div>
              <div class="form-group">
                <label class="col-sm-4 control-label">备注</label>
                <div class="col-sm-3">
                  <input type="text" v-model="description" class="form-control">
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
<style lang="scss">



</style>
<script>
  import Vue from 'vue'
  import vue_resource from 'vue-resource'
  import util from '../../../common/util'
  Vue.use(vue_resource)

  export default{
    data(){
      return {
        choice1:[],
        choice2:[],
        company_chosen_id:'',
        name:'',
        seat_count:'',
        license_plate:'',
        description:''
      }
    },
    props: ['bus_in_edit', 'type', 'companyselect', 'selected_company_id'],
    methods: {
      save:function(){
        console.log('in save')
        if(this.type=='add'){
          this.save_add()
        }else if(this.type=='modify'){
          this.save_modify()
        }
      },
      save_add:function(){
        console.log('in save add')
        this.$http.post('/api/web/bus/setAdd',{
          data:{
            serial_no:util.getName(new Date),
            company_id:this.company_chosen_id,
            name:this.name,
            seat_count:this.seat_count,
            license_plate:this.license_plate,
            description:this.description,
            create_time:util.dateTostring(new Date())
          }
        }).then(function(res){
          console.log(res)
          this.closeLogic('add')
        })

      },
      save_modify:function(){
        console.log('in save modify')
        this.$http.post('/api/web/bus/setEdit',{
        data:{
          id:this.bus_in_edit.id,
          company_id:this.company_chosen_id,
          name:this.name,
          seat_count:this.seat_count,
          license_plate:this.license_plate,
          description:this.description,
          create_time:util.dateTostring(new Date())
        }
        }).then(function(res){
          console.log(res)
          this.closeLogic('modify')
        })
      },
      closeLogic:function(){
        console.log('in close logic')
        this.company_chosen_id=''
        this.bus_in_edit=''
        this.name=''
        this.seat_count=''
        this.license_plate=''
        this.description=''
        this.create_time=''
        this.$emit('close',this.type)
      }
    },
    watch:{
      bus_in_edit:function(){

        this.name=this.bus_in_edit.name
        this.seat_count=this.bus_in_edit.seat_count
        this.license_plate=this.bus_in_edit.license_plate
        this.description=this.bus_in_edit.description
        this.company_chosen_id=this.bus_in_edit.company_id
        this.$http.post('/api/web/company/getAll',{}).then(function(res){
          this.$set('choice2',res.body.data.rows)
        })
      },
      selected_company_id () {
        if (this.companyselect) {
          this.company_chosen_id = this.selected_company_id
        }
      }
    },
    ready:function(){
      this.$http.post('/api/web/company/getAll',{}).then(function(res){
        this.$set('choice2',res.body.data.rows)
      })
    }
  }
</script>
