<template>
  <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
    <h2 class="sub-header">站点管理</h2>
    <button class="btn btn-primary" @click="addNew">新增站点</button>
    <table class="table table-striped">
      <thead>
      <tr>
        <td>站点名称</td>
        <td>备注</td>
        <td>操作</td>
      </tr>
      </thead>
      <tbody>
      <tr v-for="stop in stops">
        <td>{{stop.name}}</td>
        <td>{{stop.description}}</td>
        <td>
          <button class="btn btn-info" @click="modify(stop)">修改</button>
          <button class="btn btn-danger" @click="deleteStop(stop)">删除</button>
        </td>
      </tr>
      </tbody>
    </table>
    <modal_stop  :stop_in_edit="stop_in_edit" :type="type" v-show="modal_stop_show" @close='closeLogic'></modal_stop>
  </div>
</template>
<style>

</style>
<script>
  import modal_stop from './modal_stop.vue'
  export default{
    data(){
      return {
        modal_stop_show:false,
        stop_in_edit:false,
        stops:[],
        url:'/api/web/station/getPage',
        type:'',
        limit:100
      }
    },
    methods:{
      addNew(){
        console.log('in add new ');
        this.modal_stop_show=true
        this.type='add'
      },
      deleteStop(item){
        console.log('in delete')
        if(!confirm('确认删除?')){
          return false
        }
        this.$http.post('/api/web/station/setDel',{
          id:item.id
        }).then(function(res){
          console.log(res)
          this.fetchAll()
        })
      },
      modify(item){
        console.log('in modify')
        this.modal_stop_show=true
        this.type='modify'
        this.stop_in_edit=item
      },
      closeLogic(type) {
        this.modal_stop_show = false;
        this.stop_in_edit = ''

        if (this.type == 'add'||this.type=='modify') {
          this.fetchAll()
        }
        this.type = ''
    },
      fetchAll(){
        this.$http.post(this.url,{
          data:{
            limit:this.limit,
            offset:"0"
          }
        }).then(function(res){
          console.log(res)
          this.$set('stops',res.body.data.rows)
        })
      }
    },
    components: {
      modal_stop
    },
    ready:function(){
      this.fetchAll()
    }
  }
</script>
