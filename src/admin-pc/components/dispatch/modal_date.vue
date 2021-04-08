<template>

    <div class="modal-mask" transition="modal">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <h3>{{modal_type=='add'?"新增批次":"修改批次"}}</h3>
          </div>

          <div class="modal-body">
            <slot name="body">
              <form class="form-horizontal" role="form">
                <div class="form-group">
                  <label for="start_time" class="col-sm-4 control-label">开始时间</label>
                  <div class="col-sm-4">
                    <input type="text" required v-model="st" class="form-control form_date" id="start_time">
                  </div>
                </div>
                <div class="form-group">
                  <label for="end_time" class="col-sm-4 control-label">结束时间</label>
                  <div class="col-sm-4">
                    <input type="text" required v-model="et" class="form-control form_date" id="end_time">
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
        st: '',
        et: ''
      }
    },
    props: ['modalType', 'element_in_edit', 'modal_type','current-item'],
    methods: {

      save: function (event) {
        console.log('in save')
        if (!this.st || !this.et) {
          alert('请填写变更日期')
          return
        }

//        console.log(this.element_in_edit)
        switch (this.modal_type) {
          case 'add':
            this.save_add()
            break
          case 'modify':
            this.save_modify()
            break

        }

        this.$emit('save', this.st, this.et)

        this.$emit('close')
      },

      save_modify: function () {
        console.log('in save_modify')
        var el = this.element_in_edit

        console.log(typeof new Date(this.st))
        var obj = {
          id:el.id,
          name: el.name,
          start_time: dateFormat(new Date(this.st), 'yyyy-mm-dd HH:MM:ss'),
          end_time: dateFormat(new Date(this.et), 'yyyy-mm-dd HH:MM:ss'),
          status: el.status,
          start_order_time: el.start_order_time,
          end_order_time: el.end_order_time,
          description: null
        }
        this.$http.post('/api/web/dispatch_batch/setEdit', {
          data: obj
        }).then(function (res) {
          console.log(res)
          this.clearData()
          this.$emit('getnewres')
        })
      },
      clearData:function(){
        this.st=''
        this.et=''
      },
      close:function(){
        this.$emit('close')
      },
      save_add: function () {
        var data = {
          "data": {
            serial_no: util.getName(new Date()),
            start_time: this.st,
            end_time: this.et,
            start_order_time: "",
            end_order_time: "",
            status: 1,  // 新建的批次，默认为关闭购票状态
            description: null
          }
        }
        console.log(data)
        this.$http.post('/api/web/dispatch_batch/setAdd', data).then(function (res) {
          console.log(res.body)
          data.id=res.body.data.id
          this.$emit('getnewres')
          this.clearData()
        },function(error){
          console.log(error)
        })

      }
    },
    components: {},
    watch:{
      element_in_edit:function(){
        if(this.element_in_edit){
          var st=this.element_in_edit.start_time
          var et=this.element_in_edit.end_time
          this.st=st.getFullYear()+'/'+util.padZero(st.getMonth()+1)+'/'+util.padZero(st.getDate());
          this.et=et.getFullYear()+'/'+util.padZero(et.getMonth()+1)+'/'+util.padZero(et.getDate());
        }else{
          this.st=''
          this.et=''
        }
      }
    }
  }
</script>
