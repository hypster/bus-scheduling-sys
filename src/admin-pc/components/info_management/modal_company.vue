<template>

  <div class="modal-mask" transition="modal">
    <div class="modal-wrapper">
      <div class="modal-container">

        <div class="modal-header">
          <h3>{{type=='add'?'新增公司':'修改公司'}}</h3>
        </div>

        <div class="modal-body">
          <slot name="body">
            <form class="form-horizontal" role="form">
              <div class="form-group">
                <label for="company_name" class="col-sm-4 control-label">公司名称</label>
                <div class="col-sm-4">
                  <input type="text" required  class="form-control" id="company_name"  v-model="name">
                </div>
              </div>
              <div class="form-group">
                <label class="col-sm-4 control-label">公司备注</label>
                <div class="col-sm-4">
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
        description:''
      }
    },
    props: ['company_in_edit','type'],
    methods: {
      clearData(){
        this.name=''
        this.description=''
      },
      closeLogic(type){
        this.clearData()
        if(type)
          this.$emit('close',type)
        else
          this.$emit('close')
        this.type=''
      },
      save:function(){
        console.log('in save')
        if(this.type=='modify'){
          this.save_modify()
        }else if(this.type=='add'){
          this.save_add()
        }
      },
      save_modify:function(){
        this.$http.post('/api/web/company/setEdit',{
          data:{
            id:this.company_in_edit.id,
            name:this.name,
            description:this.description
          }

        }).then(function(res){
          console.log(res)
          this.company_in_edit=''
          this.closeLogic(this.type)
        })
      },
      save_add:function(){
        this.$http.post('/api/web/company/setAdd',{
          data:{
            serial_no:util.getName(new Date()),
            name:this.name,
            description:this.description
          }
        }).then(function(res){
          console.log(res)
          this.company_in_edit=''
          this.closeLogic(this.type)
        })
      }
    },
    watch:{
      company_in_edit:function(){
        this.name=this.company_in_edit.name
        this.description=this.company_in_edit.description
      }
    }
  }
</script>
