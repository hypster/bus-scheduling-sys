<template>
  <div>
    <table id="batch_table" class="table table-striped">
      <thead>
      <tr>
        <th>批次编号</th>
        <th>开始时间</th>
        <th>结束时间</th>
        <th>派车继承</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr :id="item.id" v-for="(i,item) in list">
        <td class="p_id">{{item.serial_no}}</td>
        <td>{{formatDate(item.start_time)}}</td>
        <td>{{formatDate(item.end_time)}}</td>
        <td>
          <button class="btn btn-success" @click='inherit(item,$event)'>派车继承</button>
        </td>
        <td>
          <button class="btn btn-primary" @click='modify(item,$event)'>修改</button>
          <button class="btn btn-danger" @click='deleteFn(item,$event)'>删除</button>
        </td>
      </tr>

      </tbody>
    </table>
    <div class="col-sm-4">
      <div class="btn-group" role="group" aria-label="...">
        <button type="button" class="btn btn-primary" id="add_button" @click='openAdd'>新增</button>
        <!--<button type="button" class="btn btn-default" @click="delete">删除</button>-->
      </div>
    </div>

    <div id="pagination" class="col-sm-8">
      <pagination v-show="!inFilter"  @getnewres='callback' :url="url" :count="count" :limit="limit"></pagination>
    </div>
    <modal_inheritance :options="menuoptions" :inheriting_item='inheriting_item' v-show='inheritance_show' @close="inheritance_show=false"></modal_inheritance>

    <modal_date @getnewres="fetchAll" @savesuccess='fetchAll' :modal_type='modal_type' :element_in_edit='element_in_edit'  @close="close" v-show="modal_date_show"></modal_date>

  </div>

</template>
<style>
  #pagination {
    /*margin-top: -2em;*/
  }
</style>
<script>
  import pagination from "./../pagination.vue"
  import modal_inheritance from './modal_inheritance.vue'
  import modal_date from './modal_date.vue'
  import vue_resource from 'vue-resource'
  import Vue from 'vue'

  import util from '../../../common/util'
  Vue.use(vue_resource)

  export default{
    data(){
      return {
        inheritance_show: false,
        list: [],
        modal_date_show: false,
        element_in_edit: '',
        modal_type:'',
        inheriting_item:'',
        count:0,
        limit:10,
        menuoptions:[],
        url:'/api/web/dispatch_batch/getPage'
      }

    },
    methods: {

      openAdd:function(){
        this.modal_date_show=true
        this.modal_type='add'
      },


      modify: function (el, event) {
        this.element_in_edit = el
        this.modal_type='modify'
        this.modal_date_show = true

      },
      close:function(){
        console.log('in close')
        this.modal_date_show=false
        this.element_in_edit=''
        this.modal_type=''
      },
      deleteFn:function(el){
        console.log('in delete')
        if(!confirm('确定删除?'))
          return false
        this.$http.post('/api/web/dispatch_batch/setDel',{
            "batch_id":el.id
        }).then(function(res){
          if (res.body.code !== 0) {
            alert(res.body.message)
          } else {
            $('#'+el.id).fadeOut().remove()
          }
        })
      },

      inherit:function(el,event){
        console.log('in inherit')
        this.inheritance_show=true
        this.inheriting_item=el
        var vm=this;
        this.$http.post("/api/web/dispatch/All", {}).then(function (res) {
          var d = res.body.data
          d=d.filter(function (item) {
            item.start_time = new Date(item.start_time)
            item.end_time = new Date(item.end_time)
            if(item.id!=vm.inheriting_item.id){
            return item
            }
          })
          this.$set('menuoptions', d)
        })
      },

        formatDate:function(dateObj){
          return util.formatDate(dateObj)
        },

        dateListHandler:function(){
          console.log('date list changed')

          if(this.date_list.every(function(date){
              return date!=''
            })){
            util.nextPage.call(this,this.url,{
              data: {
                limit: this.limit,
                offset:"0",
                start_time:new Date(this.date_list[0]),
                end_time:new Date(this.date_list[1])
              }
            },this.callback)
          }else{
            util.nextPage.call(this,this.url,{
              data:{
                limit:this.limit,
                offset:"0"
              }
            },this.callback)
          }

        },

        callback:function(res){
          console.log(res)
          var d = res.body.data.rows
          //set count number
          this.count=res.body.data.count

          d.forEach(function (row) {
            row.start_time = new Date(row.start_time)
            row.end_time = new Date(row.end_time)
          })

          this.$set('list', d)

        },
        fetchAll:function(){
          util.nextPage.call(this,this.url,{
            data: {
              limit: this.limit,
              offset:"0"
            }
          },this.callback)
        }
    },



    components: {
      pagination,
      modal_inheritance,
      modal_date
    },
    ready: function () {
      //post request for list
      this.fetchAll()

    },
    props:["date_list","active","in-filter"],
    watch:{
      date_list:function(){
        this.dateListHandler()
      },
      active:function(){
        this.fetchAll()
      }
    }
  }
</script>
