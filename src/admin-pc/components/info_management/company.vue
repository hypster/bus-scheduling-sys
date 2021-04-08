<template>
  <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
    <h2 class="sub-header">班车公司管理</h2>
    <div>
      <button class="btn btn-primary" @click="addCompany">新增公司</button>
    </div>
    <h3>班车公司信息</h3>
    <table class="table table-striped">
      <thead>
      <tr>
        <th>班车公司编号</th>
        <th>班车公司名称</th>
        <th>备注</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="company in companies">
        <td>{{company.serial_no}}</td>
        <td>{{company.name}}</td>
        <td>{{company.description}}</td>
        <td><button class="btn btn-info" @click='modify(company)'>修改</button><button class="btn btn-danger" @click="deleteItem(company)">删除</button></td>
      </tr>
      </tbody>
    </table>

      <modal_company v-show="modal_company_show" :company_in_edit="company_in_edit" :type="type" @close="closeLogic"></modal_company>

  </div>
</template>
<style>

</style>
<script>
  import Vue from "vue"
  import vue_resource from 'vue-resource'
  import modal_company from './modal_company.vue'
  Vue.use(vue_resource)

    export default{
      data(){
        return {
          limit: 10,
          companies: [],
          modal_company_show: false,
          company_in_edit: '',
          type: '',
          url: '/api/web/company/getPage'
        }
      },
      components: {
        modal_company
      },
      methods: {
        modify: function (item) {
          console.log('in modify')
          this.modal_company_show = true;
          this.company_in_edit = item
          this.type = 'modify'
        },
        deleteItem: function (item) {
          console.log('in delete')
          if(!confirm('确认删除?'))
            return
          this.$http.post('/api/web/company/setDel', {
              id: item.id
          }).then(function (res) {
            console.log(res)
            this.fetchAll()
          })
        },
        addCompany: function () {
          this.modal_company_show = true
          this.type = 'add'
        },
        closeLogic: function (type) {
          this.modal_company_show = false;
          this.company_in_edit = ''
          this.type = ''
          if (type == 'add'||type=='modify') {
            this.fetchAll()
          }
        },
        fetchAll: function () {
          this.$http.post(this.url, {
            data: {
              limit: this.limit,
              offset: "0"
            }
          }).then(function (res) {
            console.log(res)
            this.$set('companies', res.body.data.rows)
          })
        }
      },
      ready: function () {
        this.fetchAll()
      }
    }
</script>
