<template>
  <div>
    <table class="table table-striped">
      <thead>
      <tr>
        <!--<th>选择全部 <input type="checkbox" @click="selectAll"></th>-->
        <th>批次编号</th>
        <th>开始时间</th>
        <th>结束时间</th>
        <th>派车维护</th>
        <th>派车</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(i,item) in list">
        <!--<td><input type="checkbox" v-model='selectTruthTable[i]'></td>-->
        <td>{{item.id}}</td>
        <td>{{formatDate(item.st)}}</td>
        <td>{{formatDate(item.et)}}</td>
        <td><button class="btn-primary btn" @click='viewDetail(item)'>查看</button></td>
        <td><button class="btn btn-success" @click="viewDispatch(item)">派车</button></td>
      </tr>

      </tbody>
    </table>

    <div class="col-sm-4">

    </div>
    <div id="pagination" class="col-sm-8">
      <pagination v-show="!inFilter" @getnewres='callback' :url="url" :count="count" :limit="limit"></pagination>
    </div>

        <detail :detail_show="detail_show" :current-item='currentItem' v-show='detail_show' @closeevent='closeLogic'></detail>

      <dispatch @close='closeLogic' :current-item='currentItem' :show="dispatch_show" v-show="dispatch_show"></dispatch>



  </div>

</template>
<style src="../../assets/main.scss" lang="scss">


</style>
<script>
  import pagination from "./../pagination.vue"
  import detail from './dispatch_bus_detail.vue'
  import vue_resource from 'vue-resource'
  import Vue from 'vue'
  import util from '../../../common/util'
  import modal from './modal_date.vue'
  import dispatch from './modal_dispatch.vue'
  Vue.use(vue_resource)

  export default{
    data(){
      return{
        selectTruthTable:[],
        detail_show:false,
        list:[],
        currentItem:'',
        dispatch_show:false,
        count:0,
        limit:10,
        url:'/api/web/dispatch_batch/getPage'
      }
    },
    methods:{

      selectAll:function(){

        var cnt=0
        return function(){
          console.log('in select all')
          var ret=this.selectTruthTable.map(function(){
            if(!(cnt%2))
              return true
            else
              return false
          })
          cnt++
          this.$set('selectTruthTable',ret)
        }

      }(),

      viewDetail:function(item){
        this.detail_show=true
        this.currentItem=item

      },
      viewDispatch:function(item){
        this.dispatch_show=true
        this.currentItem=item
      },


      save:function(value){
        alert(value)
      },


      formatDate:function(dateObj){
        return util.formatDate(dateObj)
      },
      closeLogic:function(){
        this.dispatch_show=false
        this.detail_show=false
        this.currentItem=''
      },
      callback:function(res){
        var d=res.body.data
        this.count=res.body.data.count
//          console.log(d)
        var res=d.rows.map(function(row){
          var st= new Date(row.start_time)
          var et= new Date(row.end_time)
          var id=row.serial_no
          var b_id=row.id
          return {st,et,id,b_id}
        })

        this.$set('list',res)

        //        init selectTruthTable
        var arr=[];
        for(var i=0;i<this.list.length;i++){
          arr[i]=false
        }
        this.$set('selectTruthTable',arr)

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
              start_time:util.dateTostring(new Date(this.date_list[0])),
              end_time:util.dateTostring(new Date(this.date_list[1]))
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
      fetchAll:function(){
        util.nextPage.call(this,this.url,{
          data: {
            limit: this.limit,
            offset:"0"
          }
        },this.callback)
      }
    },

    components:{
      pagination,
      detail,
      modal,
      dispatch

    },
    ready:function(){
      //post request for list
      this.fetchAll()
    },
    props:["date_list",'active',"in-filter"],
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
