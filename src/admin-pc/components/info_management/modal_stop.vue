<template>

  <div class="modal-mask" transition="modal">
    <div class="modal-wrapper">
      <div class="modal-container">

        <div class="modal-header">
        <h3>{{type=='add'?'新增站点':'修改站点'}}</h3>
        </div>

        <div class="modal-body">
          <slot name="body">
            <form class="form-horizontal" role="form">
              <div class="form-group">
                <label  class="col-sm-4 control-label">站点名称</label>
                <div class="col-sm-4">
                  <input type="text" required  class="form-control"  v-model="name">
                </div>
              </div>
              <div class="form-group">
                <label  class="col-sm-4 control-label">备注</label>
                <div class="col-sm-4">
                  <input type="input" required class="form-control" v-model="description">
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

  export default{
    data(){
      return {
        company_name:'',
        remark:'',
        description:'',
        name:''
      }
    },
    props: ['stop_in_edit','type'],
    methods: {
    save:function(){
      console.log('in save')
      if(this.type=='modify'){

        this.$http.post('/api/web/station/setEdit',{
          data:{
            id:this.stop_in_edit.id,
            type:"0",
            description:this.description,
            name:this.name
          }
        }).then(function(res){
          console.log(res)
          this.closeLogic()
        })
      }else if(this.type=='add'){
        this.$http.post('/api/web/station/setAdd',{
          data:{
            type:"0",
            description:this.description,
            name:this.name
          }
        }).then(function(res){
          console.log(res)
          this.closeLogic()
        })
      }
    },
    closeLogic:function(){
      this.stop_in_edit=''
      this.$emit('close',this.type)
      this.name=''
      this.description=''
      this.type=''
    }
    },
    watch:{
      stop_in_edit:function(){
        this.name=this.stop_in_edit.name
        this.description=this.stop_in_edit.description
      }
    }
  }
</script>
