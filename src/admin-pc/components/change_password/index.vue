<template type="text/html">

	<div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
		<h2 class="sub-header">密码管理</h2>
		<form>
      <div class="form-group">
        <label for="password1">原始密码</label>
        <input type="password" class="form-control" v-model="oldPassword" placeholder="原始密码">
      </div>
      <div class="form-group">
        <label for="password2">新密码</label>
        <input type="password" class="form-control" v-model="newPassword" placeholder="新密码">
      </div>
      <div class="form-group">
        <label for="password3">确认密码</label>
        <input type="password" class="form-control" v-model="confirmNewPassword" placeholder="确认新密码">
      </div>
      <button type="button" class="btn btn-default" @click="changePassword">提交</button>
    </form>
	</div>

</template>
<style>

</style>
<script>

  import Vue from 'vue'
  import vue_resource from 'vue-resource'
  import util from '../../../common/util'
  Vue.use(vue_resource)
  export default{
    data () {
      return {
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }
    },
    methods: {
      changePassword () {
        let vm = this
        if (!vm.oldPassword || !vm.newPassword || !vm.confirmNewPassword) {
          return alert('原始密码、新密码、确认密码不能为空')
        } else if (vm.newPassword !== vm.confirmNewPassword) {
          return alert('确认密码与新密码不匹配')
        }
        vm.$http.post(`/api/web/admin/${__session.admin.id}/changePassword`, {
          oldPassword: vm.oldPassword,
          newPassword: vm.newPassword
        }).then(res => {
          var result = res.body
          if (result.code !== 0) {
            alert(result.message)
          } else {
            alert('密码修改成功，下次请使用新密码进行登录')
            vm.clearForm()
          }
        })
      },
      clearForm () {
        var vm = this
        vm.oldPassword = ''
        vm.newPassword = ''
        vm.confirmNewPassword = ''
      }
    },
    ready(){

    }
  }
</script>
