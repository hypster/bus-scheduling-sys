<template>
  <div transition="modal">

      <div class="modal-mask">
        <div class="modal-wrapper">
          <div class="modal-container">

            <div class="modal-header">
            <h3>派车继承</h3>
            </div>
            <div v-if='panel1_show'>
              <div class="modal-body" >
                <slot name="body">
                  <form class="form-horizontal" role="form">
                    <div class="form-group">
                      <p class="col-sm-4 control-label">选择继承批次</p>

                      <div class="col-sm-8">
                        <select v-model='choosen_batch'>
                          <option v-for="item in options" :value='item'>
                            {{formatDate(item.start_time)}}-{{formatDate(item.end_time)}}
                          </option>
                        </select>

                      </div>
                    </div>
                  </form>
                </slot>
              </div>

              <div class="modal-footer">
                <slot name="footer">
                  <div class="form-group">
                    <div class="btn-group">
                      <button class="btn btn-default modal-default-button" @click="openSecondWindow">
                        继承
                      </button>
                      <button class="btn btn-default modal-default-button" @click="$emit('close')">
                        取消
                      </button>
                    </div>
                  </div>
                </slot>
              </div>
            </div>
            <div v-if='panel2_show'>
              <div class="modal-body">
                <slot name="body">
                  <div class="row">
                    <div class="col-sm-12">
                      <p>选择继承日期</p>
                      <ul class="list-group">
                        <li class="list-group-item" v-for="(index,date) in list1">
                          <div class="row">
                            <div class="col-sm-6">
                              {{formatDate(date)}}
                            </div>
                            <div class="col-sm-6">
                              <select class="form-control" @change=doChange(index,date,$event)>
                                <option v-for="(index2,date) in list2" :value='date' :selected="index==index2">{{formatDate(date)}}</option>
                              </select>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </slot>
              </div>
              <div class="modal-footer">
                <slot name="footer">
                  <div class="form-group">
                    <div class="btn-group">
                      <button class="btn btn-default modal-default-button" @click="saveInheritance">
                        确定
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
      </div>
  </div>

</template>
<style>



</style>
<script>
  import vue_resource from 'vue-resource'
  import Vue from "vue"
  import util from '../../../common/util'
  export default{
    data(){
      return {
        choosen_batch: '',
        list_show: false,
        panel1_show: true,
        panel2_show: false,
        list1: [],
        list2: [],

        list3:[],
        inheriting_day_list:{}
      }
    },
    props: ['modalType', 'inheriting_item', "options"],
    watch: {
      inheriting_item: {
        handler: function () {
          var vm=this
          this.list1 = util.generate_day_list(this.inheriting_item)
          this.$set('list1', this.list1)

        },
        deep: true
      }
    },
    methods: {

      save: function (event) {
        this.$emit('save', this.choosen_batch)
        this.$emit('close')
      },
      formatDate: function (dateObj) {
        return util.formatDate(dateObj)
      },

      doChange:function(index,inheriting_date,event){
        console.log('in change')
        var ele = event.target || event.srcElement
        var d = new Date(ele.value)
        console.log(inheriting_date)
        this.list3.$set(index,d)

      },
      openSecondWindow: function () {
        var vm = this
        //list2 is list for inherited date
        if(!vm.choosen_batch){
          return alert('请选择继承批次')

        }
        var day_diff = util.calcDiffInDay(vm.choosen_batch.end_time, vm.choosen_batch.start_time)

        vm.list2 = util.generate_day_list(vm.choosen_batch)
        vm.$set('list2', vm.list2)
        var _first_item=vm.list2[0]
        var arr=vm.list1.map(function(date, index){
          return vm.list2[index] || _first_item
        })
        vm.$set('list3',arr)
        vm.togglePanel()


      },
      togglePanel:function(){
        this.panel1_show = !this.panel1_show
        this.panel2_show = !this.panel2_show
      },
      closeLogic: function () {
        this.togglePanel()
        this.choosen_batch=''
        this.$emit('close')
      },

      saveInheritance:function(){
        var batch_id=this.inheriting_item.id
        var jbatch_id=this.choosen_batch.id
        var arr=[]
        var vm=this
        this.list1.forEach(function(date,index){
          arr.push({
            batch_id,
            jbatch_id,
            start_time:util.dateTostring(date),
            jstart_time:util.dateTostring(vm.list3[index])
          })
        })
        console.log(arr)
        this.$http.post('/api/web/dispatch/copyDetail',{
          data:{
            rows:arr
          }
        }).then(function(res){
          this.closeLogic()
        })
      }
    },

    components: {},
    ready: function () {

    }
  }
</script>
