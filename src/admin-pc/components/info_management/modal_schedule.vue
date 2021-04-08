<template>

  <div class="modal-mask" transition="modal">
    <div class="modal-wrapper">
      <div class="modal-container">

        <div class="modal-header">
        <h3>{{type=='add'?'新增车次':'修改车次'}}</h3>
        </div>

        <div class="modal-body">
          <slot name="body">
            <form class="form-horizontal" role="form">
              <div class="form-group">
                <label  class="col-sm-4 control-label">选择班车公司</label>
                <div class="col-sm-3">
                  <select v-model="company_chosen_id" required class="form-control">
                    <option :value="choice.id" v-for="choice in choice1" >{{choice.name}}</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label  class="col-sm-4 control-label">选择班车线路</label>
                <div class="col-sm-3">
                  <select v-model="line_chosen_id" required class="form-control">
                    <option :value="choice.id" v-for="choice in choice2">{{choice.name}}</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="col-sm-4 control-label">价格</label>
                <div class="col-sm-3">
                  <input class="form-control" type="number" v-model='price' required>
                </div>
              </div>
              <div class="form-group">
                <label class="col-sm-4 control-label">临时票价格</label>
                <div class="col-sm-3">
                  <input class="form-control" type="number" v-model='full_price' required>
                </div>
              </div>
              <div class="form-group">
                <div class="row">
                  <label class="col-sm-4 control-label" id="#departure">发车时间</label>
                  <div class="col-sm-8">
                    <div class="form-inline">
                      <input  type="text" class="form_time form-control" v-model="begin_time" required>&nbsp;<span> - </span>&nbsp;
                      <input type="text" class="form_time form-control" v-model="end_time" required>
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label class="col-sm-4 control-label">是否团购</label>
                <div class="col-sm-3">
                  <input type="radio" id="is_pre_order-yes" name="is_pre_order" value="1" v-model="is_pre_order" />
                  <label for="is_pre_order-yes">是</label>&nbsp;&nbsp;
                  <input type="radio" id="is_pre_order-no" name="is_pre_order" value="0" v-model="is_pre_order" />
                  <label for="is_pre_order-no">否</label>
                </div>
              </div>
              <div class="form-group" v-show="is_pre_order==1">
                <label class="col-sm-4 control-label">成团人数</label>
                <div class="col-sm-3">
                  <input type="number" v-model="pre_order_limit_count" class="form-control" required>
                </div>
              </div>
              <div class="form-group">
                <label class="col-sm-4 control-label">备注</label>
                <div class="col-sm-3">
                  <input type="text" v-model="description" class="form-control" required>
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
<style lang="scss" scoped>

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
        line_chosen_id:'',
        price:'',
        full_price:'',
        begin_time:'',
        end_time:'',
        is_pre_order:0,
        limit_count:0,
        description:''
      }
    },
    props: ['schedule_in_edit','type'],
    methods: {
      save:function(){
        console.log('in save')

        if(this.type=='add'){
          this.save_add()
        }else if(this.type=='modify'){
          this.save_modify()
        }

      },
      save_modify:function(){
        this.$http.post('/api/web/schedule/setEdit',{
          data:{
            id:this.schedule_in_edit.id,
            company_id:this.company_chosen_id,
            bus_line_id:this.line_chosen_id,
            begin_time:this.begin_time,
            end_time:this.end_time,
            price:this.price,
            full_price:this.full_price,
            is_pre_order: this.is_pre_order,
            limit_count: this.limit_count,
            description:this.description
          }

        }).then(this.callback)
      },
      save_add:function(){
        this.$http.post('/api/web/schedule/setAdd',{
          data:{
            serial_no:util.getName(new Date()),
            id:this.schedule_in_edit.id,
            company_id:this.company_chosen_id,
            bus_line_id:this.line_chosen_id,
            begin_time:this.begin_time,
            end_time:this.end_time,
            price:this.price,
            full_price:this.full_price,
            is_pre_order: this.is_pre_order,
            limit_count: this.limit_count,
            description:this.description
          }
        }).then(this.callback)
      },
      closeLogic:function(){
        this.schedule_in_edit=''
        this.begin_time=''
        this.end_time=''
        this.price=''
        this.full_price=''
        this.is_pre_order=false;
        this.limit_count=0;
        this.description=''
        this.company_chosen_id=''
        this.line_chosen_id=''
        this.$emit('close',this.type)
      },
      callback:function(res){
          console.log(res)
          this.closeLogic()
      }
    },
    computed: {
      pre_order_limit_count: {
        get: function() {
          return this.limit_count || 0
        },
        set: function (newValue) {
          newValue = Number(newValue)
          if (newValue < 0) {
            this.limit_count = 0
          } else {
            this.limit_count = newValue
          }
        }
      }
    },
    watch:{
      schedule_in_edit:function(){
        this.begin_time=this.schedule_in_edit.begin_time
        this.end_time=this.schedule_in_edit.end_time
        this.price=this.schedule_in_edit.price,
        this.full_price=this.schedule_in_edit.full_price,
        this.is_pre_order=this.schedule_in_edit.is_pre_order;
        this.limit_count=this.schedule_in_edit.limit_count;
        this.description=this.schedule_in_edit.description
        this.company_chosen_id=this.schedule_in_edit.companyId
        this.line_chosen_id=this.schedule_in_edit.buslineId

        this.$http.post('/api/web/company/getAll',{}).then(function(res){
          console.log(res)
          this.$set('choice1',res.body.data.rows)
        })
        this.$http.post('/api/web/v_bus_line/getAll',{}).then(function(res){
          console.log(res)
          this.$set('choice2',res.body.data.rows)
        })

      }
    },
    ready:function(){
      this.$http.post('/api/web/company/getAll',{}).then(function(res){
        console.log(res)
        this.$set('choice1',res.body.data.rows)
      })
      this.$http.post('/api/web/v_bus_line/getAll',{}).then(function(res){
        console.log(res)
        this.$set('choice2',res.body.data.rows)
      })
  }
  }
</script>
