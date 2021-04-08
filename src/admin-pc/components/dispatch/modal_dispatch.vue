<template>
  <div class="modal-mask" transition="modal">
    <div class="modal-wrapper">
      <div class="modal-container">
        <div class="modal-header">
        <h3>派车</h3>
        </div>
        <div class="modal-body">

          <slot name="body">
            <div class="row">
              <div class="col-sm-12">
              <!--loop through days-->
                <div class="panel panel-default" v-for="(index,day) in day_list" id="{{ 'day'+index}}">
                  <div class="panel-heading title">{{formatDate(day)}}
                    <span class="glyphicon glyphicon-chevron-down pull-right" @click='toggleBody'></span>
                    <span class="glyphicon glyphicon-chevron-up pull-right" @click='toggleBody'></span>
                  </div>
                  <div class="panel-body">
                    <div class="row">
                      <div class="col-sm-6">
                        <ul class="list-group">
                        <!--loop through schedules-->
                          <li class="list-group-item options"
                              v-for="(key,item) in list_schedule">
                              <input type="checkbox" @click='addToList(item,day,index)' :checked="scheduleChecked(day, item)" v-bind="{'disabled': initScheduleChecked(day, item)}">
                              <span class="pre_order_tag">{{item.is_pre_order?'[团购]':''}}</span>{{item.company}}: {{item.name}}{{reduceSeconds(item.begin_time)}}{{formatTime(item.end_time)}}
                          </li>
                        </ul>
                      </div>
                      <div class="col-sm-6">
                        <ul class="list-group created_list">
                          <!--<li v-for="i in 10">{{i}}</li>-->
                          <li class="list-group-item options" v-for="(index,item) in getName(day)"><span class="pre_order_tag">{{item.is_pre_order?'[团购]':''}}</span>{{item.company}}: {{item.name}}{{reduceSeconds(item.begin_time)}}{{formatTime(item.end_time)}}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

  .panel-heading.title {
    /*color: #fff;*/
  }

  span.glyphicon-chevron-down {

  }

  span.glyphicon-chevron-up {
    display: none;
  }

  .glyphicon {
    color: #337ab7;
  }

  .options {
    cursor: pointer;
  }

  .options:hover {
    background: #f5f5f5;
  }

  .panel-heading.title {
    /*background: #428bca;*/
  }

  /*.modal-wrapper {*/
    /*!*display: table-cell;*!*/
    /*!*vertical-align: middle;*!*/
  /*}*/

  #detail .modal-container {
    width: 1000px;
  }

  .modal-container {
    width: 1000px;
    margin: 0px auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
    transition: all .3s ease;
    font-family: Helvetica, Arial, sans-serif;
  }

  /*.modal-header {*/
    /*border: none;*/
  /*}*/

  /*.modal-header h3 {*/
    /*margin-top: 0;*/
    /*color: #42b983;*/
  /*}*/

  /*.modal-body {*/
    /*margin: 20px 0;*/
  /*}*/

  .modal-body .col-sm-12 {
    height: 400px;
    overflow: auto;
  }

  /*.modal-default-button {*/
    /*float: right;*/
  /*}*/

  /*
   * The following styles are auto-applied to elements with
   * transition="modal" when their visibility is toggled
   * by Vue.js.
   *
   * You can easily play with the modal transition by editing
   * these styles.
   */

  .modal-enter {
    opacity: 0;
  }

  .modal-leave-active {
    opacity: 0;
  }

  .modal-enter .modal-container,
  .modal-leave-active .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }

  .panel-body {
    display: none;
  }
  .pre_order_tag {
    color: #0BB20C;
  }
</style>

<script>
  import Vue from 'vue'
  import vue_resource from 'vue-resource'
  Vue.use(vue_resource)
  import util from '../../../common/util'

  export default{
    data(){
      return {
        list_schedule: [],
        init_schedule_list: [],
        day_list: [],
        day_map:[],
        created_list: {},
        return_list: [],
      }
    },
    props: ['current-item', 'show'],
    ready: function () {
      var vm = this
    },
    methods: {
      save: function () {
        //this holds the data send to api
        var arr = [];
        var vm = this
        console.log('in save')
        var batch_id = this.currentItem.b_id
        var cl = this.created_list
        for (var key in cl) {
          var day_record = cl[key]
          if (day_record.length) {
            //generate item for return_list
            day_record.forEach(function (route) {
              var item = {
                batch_id,
                schedule_id: route.id,
                type: "0",
                start_time: util.dateTostring(new Date(Number(key))),
                seat_count: 50
              }
              arr.push(item)
            })
          }
        }

        console.log(arr)

        this.$http.post('/api/web/dispatch_detail/setAddList', {
          data: {
            rows: arr
          }
        }).then(function (res) {
          console.log(res)
          vm.closeLogic()
        })
      },
      formatDate: function (dateObj) {
        return util.formatDate(dateObj)
      },
      formatTime:function (obj){
        if(obj=='00:00:00')
          return ''
        else return ' - '+this.reduceSeconds(obj)
      },
      reduceSeconds:function(str){
        return util.removeSeconds(str)
      },
      toNumber:function(dateObj){
        return Number(dateObj)
      },
      getName:function(day){
        return this.created_list[this.toNumber(day)]
      },
      closeLogic: function () {
        this.$emit('close')
        this.$set('day_list', [])
        this.$set('day_map',[])
        this.created_list = {}
      },
      addToList: function (item, day, index) {
        //push to list
        var day_list = this.created_list[Number(day)]
        var found = day_list.indexOf(item)
        if (found >= 0) {
          day_list.splice(found,1)
          var newList=$.extend({},this.created_list)
          this.$set('created_list',newList)
          return
        }
        day_list.push(item)
        day_list.sort((a, b) => {
          if (a.begin_time > b.begin_time) {
            return 1
          } else if (a.begin_time < b.begin_time) {
            return -1
          } else {
            return 0
          }
        })
        var newList=$.extend({},this.created_list)
        this.$set('created_list',newList)
//        var $li = $("<li class='list-group-item'></li>").text(item.company+': '+item.description).appendTo($('#day' + index).find('ul.created_list'))
      },
      toggleBody: function (event) {
        var ele = event.target || event.srcElement
        $(ele).parent().siblings('.panel-body').toggle("slide");
        $(ele).toggle()
        $(ele).siblings('span').toggle()
      },
      scheduleChecked (day, item) {
        return this.created_list[Number(day)] && this.created_list[Number(day)].indexOf(item) >= 0
      },
      initScheduleChecked (day, item) {
        return this.init_schedule_list.some((s) => ((s.id === item.id) && (Number(s.date) === Number(day))))
      }
    },
    watch: {
      'show': function () {
        var vm = this
        if (!vm.show) {
          vm.init_schedule_list = []
          vm.list_schedule = []
        } else {
          vm.$http.post('/api/web/v_schedule/getAll', {}).then(function (res) {
            var schedules = res.body.data.rows
            schedules.sort((a, b) => {
              if (a.begin_time > b.begin_time) {
                return 1
              } else if (a.begin_time < b.begin_time) {
                return -1
              } else {
                return 0
              }
            })

            vm.$http.post(`/api/web/batches/${vm.currentItem.b_id}/dispatches`).then(function (res) {
              res.body.data.rows.forEach((item, index) => {
                var date = Number(new Date(item.start_time))
                if (vm.created_list[date]) {
                  var schedule = schedules.filter((s) => {
                    return s.id === item.schedule_id
                  }).shift()

                  if (vm.created_list[date].indexOf(schedule) < 0) {
                    vm.created_list[date].push(schedule)
                    vm.created_list[date].sort((a, b) => {
                      if (a.begin_time > b.begin_time) {
                        return 1
                      } else if (a.begin_time < b.begin_time) {
                        return -1
                      } else {
                        return 0
                      }
                    })
                    vm.init_schedule_list.push({
                      id: schedule.id,
                      checked: true,
                      date: date
                    })
                  }
                }
              })
              vm.$set('list_schedule', schedules)
            })
          })
        }
      },
      currentItem: {
        handler: function () {
          var vm = this
          if (!vm.currentItem) {
            return false
          }
          vm.$set("day_list", util.generate_day_list(vm.currentItem))

          var dayMap = {}
          vm.day_list.forEach(function (day,index) {
            dayMap['' + Number(day)] = []
            vm.day_map.push({day:day})
          })
          vm.created_list = Object.assign({}, vm.created_list, dayMap)
        },
        deep: true
      }
    }

  }

</script>
