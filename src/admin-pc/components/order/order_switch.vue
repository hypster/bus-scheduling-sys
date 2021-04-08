<template>
  <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
    <h2 class="sub-header">售票开关设定</h2>
    <p style="margin: 15px;">
      <small v-show='currentTemplate'>当前批次模板：{{formatOption(currentTemplate)}}<br></small>
      <small v-show='current'>当前设定批次：{{formatOption(current)}}<br></small>
    </p>

    <div>
      <form class="col-sm-8">

        <div class="form-group row">
          <label class="col-form-label col-sm-2">售票批次</label>
          <div class="col-sm-10">
            <select v-model="current">
              <option v-for="option in options" :value="option">{{formatOption(option)}}</option>
            </select>
          </div>
        </div>

        <div class="form-group row">
          <label class="col-form-label col-sm-2">售票开关</label>
          <div class="col-sm-10">
            <label class="form-check-inline">
              <input class="form-check-input" type="radio" id="open_order" v-model='order_on' value="true" name="open_on"> 开
            </label>&nbsp;&nbsp;
            <label class="form-check-inline">
              <input class="form-check-input" type="radio" id="close_order" v-model='order_on' value="false" name="open_on"> 关
            </label>
          </div>
        </div>

        <div class="form-group row">
          <label class="col-form-label col-sm-2">设为模板</label>
          <div class="col-sm-10">
            <label class="form-check-inline">
              <input class="form-check-input" type="radio" id="set_template" v-model='template_on' value="true" name="rdo-template_switch"> 是
            </label>&nbsp;&nbsp;
            <label class="form-check-inline">
              <input class="form-check-input" type="radio" id="cancel_template" v-model='template_on' value="false" name="rdo-template_switch"> 否
            </label>
          </div>
        </div>

        <div class="form-group row">
          <label for="start_time_order" class="col-form-label col-sm-2">开始时间</label>
          <div class="col-sm-10">
            <input type="text" v-model='order_start_time' class="form-control form_datetime" id="start_time_order">
          </div>
        </div>
        <div class="form-group row">
          <label for="end_time_order" class="col-form-label col-sm-2">结束时间</label>
          <div class="col-sm-10">
            <input type="text" v-model="order_end_time" class="form-control form_datetime" id="end_time_order">
          </div>
        </div>

        <div class="form-group row">
          <div class="col-sm-10 col-sm-offset-2">

            <button type="submit" class="btn btn-primary" @click.prevent="save_change">保存</button>
            <span v-show="saved" style="color:green;">已保存</span>
          </div>
        </div>
      </form>
    </div>

    <div style="clear: both;"></div>
    <h2 class="sub-header">团购设置</h2>
    <div>
      <form class="col-sm-8">
        <div class="form-group row">
          <label class="col-form-label col-sm-2">团购截止</label>
          <div class="col-sm-10">每
            <select v-model="pre_order_endDayOfWeek" id="endDayOfWeek">
              <option v-for="(key, val) of weeks" :value="val">{{key}}</option>
            </select>
            <select v-model="pre_order_end_time">
              <option v-for="(key, val) of times" :value="val">{{key}}</option>
            </select>
          </div>
        </div>

        <div class="form-group row">
            <div class="col-sm-10 col-sm-offset-2">
              <button type="submit" class="btn btn-primary" @click.prevent="save_preOrder">保存</button>
              <span v-show="preOrderSaved" style="color:green;">已保存</span>
            </div>
          </div>
      </form>
    </div>
  </div>

</template>
<style>
  small {
    color: red;
  }
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
        options:[],
        current:'',
        currentTemplate: null,
        currentItem:'',
        start_time_order:'',
        end_time_order:'',
        start_time_sell:'',
        end_time_sell:'',
        saved: false,

        weeks: {
          '周一': 1,
          '周二': 2,
          '周三': 3,
          '周四': 4,
          '周五': 5,
          '周六': 6,
          '周日': 0,
        },
        times: {
          "00:00": "00:00",
          "01:00": "01:00",
          "02:00": "02:00",
          "03:00": "03:00",
          "04:00": "04:00",
          "05:00": "05:00",
          "06:00": "06:00",
          "07:00": "07:00",
          "08:00": "08:00",
          "09:00": "09:00",
          "10:00": "10:00",
          "11:00": "11:00",
          "12:00": "12:00",
          "13:00": "13:00",
          "14:00": "14:00",
          "15:00": "15:00",
          "16:00": "16:00",
          "17:00": "17:00",
          "18:00": "18:00",
          "19:00": "19:00",
          "20:00": "20:00",
          "21:00": "21:00",
          "22:00": "22:00",
          "23:00": "23:00",
        },
        pre_order_endDayOfWeek: 3,
        pre_order_end_time: '17:00',
        preOrderSaved: false,
      }
    },
    computed:{
      'order_on': {
        get: function () {
          return (this.current.status === 0) ? 'true' : 'false'
        },
        set: function (newVal) {
          if(newVal=='true') {
            this.current.status = 0
          } else if(newVal=='false') {
            this.current.status = 1
          }
          this.saved = false
        }
      },
      'template_on': {
        get: function () {
          return (this.current.is_template) ? 'true' : 'false'
        },
        set: function (newVal) {
          if(newVal=='true') {
            this.current.is_template = 1
          } else if(newVal=='false') {
            this.current.is_template = 0
          }
          this.saved = false
        }
      },
      'order_start_time': {
        get: function () {
          var date = new Date(this.current.start_order_time)
          if (date == 'Invalid Date') {
            return ''
          }
          return dateFormat(date, 'yyyy/mm/dd HH:MM')
        },
        set: function (newVal) {
          this.saved = false
          this.current.start_order_time = newVal
        }
      },
      'order_end_time': {
        get: function () {
          var date = new Date(this.current.end_order_time)
          if (date == 'Invalid Date') {
            return ''
          }
          return dateFormat(date, 'yyyy/mm/dd HH:MM')
        },
        set: function (newVal) {
          this.saved = false
          this.current.end_order_time = newVal
        }
      }
    },
    watch: {
      'current': function() {
        this.saved = false
      },
      'pre_order_endDayOfWeek': function() {
        this.preOrderSaved = false
      },
      'pre_order_end_time': function() {
        this.preOrderSaved = false
      }
    },
    methods: {
      fetchAll:function(){
        var vm = this;
        vm.$http.post('/api/web/dispatch_batch/getAll',{
          data:{order:"start_time desc"}
        }).then(function(res){
          var batches = res.body.data.rows
          var newestBatch = batches.filter(function (item) {
            return item.status === 0
          })[0]
          vm.$set('options', batches)
          vm.$set('current', newestBatch || batches[0])
        })
        vm.$http.get('/api/web/batches/templateBatch').then(res => {
          vm.currentTemplate = res.body.data
        })
        vm.$http.get('/api/web/preOrderConfig').then(res => {
          var config = res.body
          vm.pre_order_endDayOfWeek = config.preOrderEndDayOfWeek
          vm.pre_order_end_time = config.preOrderEndTime
        })
      },
      formatDate:function(dateObj){
        dateObj=new Date(dateObj)
        return util.formatDate(dateObj)
      },
      formatTime:function(obj){
        obj=new Date(obj)
        return util.formatTime(obj)
      },
      formatOption:function(option){
        if (!option) {
          return ''
        }
        return `${option.serial_no} (${this.formatDate(option.start_time)} - ${this.formatDate(option.end_time)})`
      },
      save_change:function(){
        if(!this.current){
          return alert('请设置当前订票批次')
        }
        if((this.current.start_order_time == 'Invalid Date') || (this.current.end_order_time == 'Invalid Date')) {
          return alert('请设置变更时间')
        }
        this.$http.post('/api/web/dispatch_batch/setEdit',{
          data: {
            id: this.current.id,
            start_order_time: dateFormat(new Date(this.current.start_order_time), 'yyyy-mm-dd HH:MM:ss'),
            end_order_time: dateFormat(new Date(this.current.end_order_time), 'yyyy-mm-dd HH:MM:ss'),
            status: this.current.status,
            is_template: this.current.is_template,
            status_update_time: dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss')
          }
        }).then(function(res){
          this.saved = true
          if (this.current.is_template) {
            this.currentTemplate = this.current
          }
        })

      },
      save_preOrder: function() {
        let vm = this
        vm.$http.post('/api/web/preOrderConfig/update', {
          preOrderEndDayOfWeek: vm.pre_order_endDayOfWeek,
          preOrderEndTime: vm.pre_order_end_time
        }).then(function(res){
          vm.preOrderSaved = true
        })
      },
      toTimestamp:function(dateString){
        return util.getName(new Date(dateString))
      }
    },
    components: {},
    ready:function(){
      this.fetchAll()
    }
  }
</script>
