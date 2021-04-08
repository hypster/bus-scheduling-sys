<template>

    <div class="modal-mask" transition="modal">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <h3>修改临时票数</h3>
          </div>

          <div class="modal-body">
            <slot name="body">
              <form class="form-horizontal" role="form">
                <div class="form-group">
                  <label class="col-sm-4 control-label">临时票数</label>
                  <div class="col-sm-4">
                    <input type="number" required v-model="full_price_seat_count" class="form-control">
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
                  <button class="btn btn-default modal-default-button" @click="close">
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
  var dateFormat = require('dateformat')

  import Vue from 'vue'
  import vue_resource from 'vue-resource'
  Vue.use(vue_resource)
  import util from '../../../common/util'
  export default{
    data(){
      return {
        full_price_seat_count:0
      }
    },
    props: [ 'element_in_edit'],
    methods: {

      save: function (event) {
          if (this.full_price_seat_count < 0) {
            this.full_price_seat_count=0
            alert('临时票数不能为负数')
            return false
          }
          if (__session.admin.type !== 1) {
            if (this.full_price_seat_count > 50) {
              this.full_price_seat_count=50
              alert('临时票数不能超过50')
              return false
            }
          }

          this.$http.post('/api/web/dispatch_detail/setEdit',{
            data:{
              id:this.element_in_edit.id,
              full_price_seat_count:this.full_price_seat_count
            }
          }).then(function(res){
            this.$emit('savesuccess')
          })
      },

      close:function(){
        this.$emit('close')
      },

    },
    watch:{
      element_in_edit:function(){
        this.full_price_seat_count=this.element_in_edit.full_price_seat_count
      }
    }
  }
</script>
