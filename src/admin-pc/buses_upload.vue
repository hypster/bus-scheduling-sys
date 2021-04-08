<template>
  <div class="container" style="max-width: 60%;">
    <form role="form" action="/api/web/buses/upload" method="post" enctype="multipart/form-data">
      <div class="form-group">
        <label for="companyId">公司：</label>
        <select id="companyId" name="companyId" class="form-control" v-model="current_company_id">
          <option v-for="c in company_list" value="{{c.id}}">{{c.name}}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="exampleInputFile">请上传文件：</label>
        <input type="file" name="file1" id="file1">
        <p class="help-block">* 仅允许上传‘.csv’文件（格式：公司,车牌号,座位数,备注）.</p>
      </div>
      <button type="submit" class="btn btn-default">上传</button>
    </form>
  </div>
</template>

<style scoped lang="scss">
  .help-block {
    color: red;
  }
</style>

<script>
  import Vue from 'vue'
  import Vue_reourse from 'vue-resource'
  Vue.use(Vue_reourse)

  export default {
    data () {
      return {
        company_list: [],
        current_company_id: ''
      }
    },
    ready () {
      var vm = this
      this.$http.post('/api/web/company/getAll').then(res => {
        if (res.body.code !== 0) {
          return alert(res.body.message)
        } else {
          var companies = res.body.data.rows
          vm.company_list = companies
        }
      })
    }
  }
</script>