<template>
  <div transition="modal" class="modal-mask dispatch_detail">
    <div class="modal-wrapper">
      <div class="modal-container">

        <div class="modal-header">
          <h3>派车详情</h3>
        </div>
        <div class="row">
          <div class="form-horizontal">
            <div class="form-group">
              <label class="control-label col-sm-2">选择公司</label>
              <div class="col-sm-2">
                <select id="company_selector" class="form-control col-sm-4" v-model="data.companyId">
                  <option v-for="item in company_list" :value="item.id">{{item.name}}</option>
                  <option :value="">全部</option>
                </select>
              </div>
              <div class="col-sm-4">
                <button class="btn btn-primary" @click.prevent="fetch">查询</button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-body">
          <slot name="body">

            <table class="table table-striped">
              <thead>
              <tr>
                <th>派车编号</th>
                <th>发车日期</th>
                <th>班车公司</th>
                <th>所属线路</th>
                <th>发车时间</th>
                <th>座位数</th>
                <th>操作</th>
              </tr>
              </thead>
              <tbody>
                <form>
                  <tr v-for="item in list">
                    <td>{{item.serial_no}}</td>
                    <td>{{formatDate(item.start_time)}}</td>
                    <td>{{item.company}}</td>
                    <td>{{item.name}}</td>
                    <td>{{item.begin_time.replace(/:00$/, '')}}{{item.end_time==="00:00:00"?'':'-'+item.end_time.replace(/:00$/, '')}}</td>
                    <td>{{item.seat_count}}</td>
                    <td>
                      <button class="btn btn-danger" @click="deleteItem(item)">删除</button>
                      <button class="btn btn-primary" @click='setSeatNumber(item)'>座位数</button>
                      <!--<button class="btn btn-primary" @click='setPreOrderEndTime(item)'>团购截止时间</button>-->
                    </td>
                  </tr>
                </form>
              </tbody>
            </table>
            <div class="col-sm-4">
              <div class="btn-group">
                <button class="btn btn-default" @click='close'>返回</button>
              </div>
            </div>

            <div id="pagination" class="col-sm-8">
              <pagination :parent_show="detail_show" @getnewres='callback' :url="url" :count="count" :limit="limit" :order="order" :option="data" :offset ='offset'
                          :current-item="currentItem" @currentoffset='updateOffset'></pagination>
            </div>
            <modal_setseat :seat_changed="seat_changed" v-show='show' @close='closeLogic' @save="save"></modal_setseat>
          </slot>
        </div>
      </div>
    </div>
  </div>


</template>
<style scoped>
  .modal-body {
    margin: 15px 0;
    padding-left: 0;
    padding-right: 0;
  }
  #detail {
    /*width: 1000px;*/
  }
  #company_selector{
    /*width: 40px;*/
  }
</style>
<script>
  import pagination from './../pagination.vue'
  import modal_setseat from './modal_setseatnumber.vue'
  import Vue from 'vue'
  import vue_resource from 'vue-resource'
  import util from '../../../common/util'
  Vue.use(vue_resource)


  export default{
    data(){
      return {
        data: {
          offset: '0',
          companyId:'',
          batch_id: this.currentItem.b_id
        },
        list: '',
        seat_changed: '',
        show: false,
        count: 0,
        limit: 5,
        order: 'start_time, begin_time',
        url: '/api/web/v_Ddetail/getPage',
        offset: 0,
        company_list: [],
        show_all_show: false
      };
    },
    props: ["current-item", "detail_show"],
    watch: {
      currentItem: function () {
        this.offset = 0
        console.log('currentItem changed')
        this.data.batch_id = this.currentItem.b_id
        this.fetchAll()
      }
    },
    methods: {

      fetchAll: function () {
        util.nextPage.call(this, this.url, {
          data: {
            limit: this.limit,
            offset: ''+this.offset,
            batch_id: this.currentItem.b_id,
            order: this.order
          }
        }, this.callback)
      },

      callback: function (res) {

        var d = res.body.data.rows
        this.count = res.body.data.count
        d.forEach(function (row) {
          row.start_time = new Date(row.start_time)
          row.create_time = Number(new Date(row.create_time))
        })
        this.$set('list', d)
      },

      setSeatNumber: function (item) {
        this.show = true
        this.seat_changed = item

      },

      formatDate: function (dateObj) {
        return util.formatDate(dateObj)
      },

      save: function (number) {
        alert(number)
      },
      setItem: function (item) {
        this.currentItem = item
      },
      deleteItem: function (item) {
        if (!confirm('确认删除?'))
          return
        this.$http.post('/api/web/dispatch_detail/setDel', {
          'dispatch_id': item.id
        }).then(function (res) {
          if (res.body.code !== 0) {
            alert(res.body.message)
          } else {
            this.fetchAll()
          }
      })
      },
      close: function () {
        console.log('in close')
        this.$emit('closeevent')
      },

      closeLogic: function (number) {
        this.show = false
        this.fetchAll()
      },
      updateOffset:function(offset){
        this.offset=offset
        console.log('current offset is now updated to :'+offset);
      },
      fetch:function(){
        var data={}
        for(let key in this.data){
          if(this.data[key])
            data[key]=this.data[key]
        }
        data.limit=this.limit
        this.$http.post(this.url, {
          data
        }).then(this.callback)
      }
    },
    ready () {
      this.$http.post('/api/web/company/getAll',{}).then(function(res) {
        this.$set('company_list', res.body.data.rows)
      })
    },
    components: {
      modal_setseat,
      pagination
    }
  }
</script>
