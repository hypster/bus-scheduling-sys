<template>
	<div class="page-personal-info">
		<div class="weui-cells__title page-title">我的信息</div>
		<div class="weui-cells__title">我的余额</div>
		<div class="weui-cells">
			<div class="weui-cell pocket-money">
				<div class="weui-cell__hd">
					<label class="weui-label">余额</label>
				</div>
				<div class="weui-cell__bd">
					<p>{{user.balance}}元</p>
				</div>
			</div>
		</div>

		<div class="weui-cells__title">个人资料 (必填)</div>
		<div class="weui-cells">
			<div class="weui-cell" :class="{'weui-cell_warn': !nameValid}">
				<div class="weui-cell__hd">
					<label class="weui-label">姓名</label>
				</div>
				<div class="weui-cell__bd">
					<input class="weui-input" required type="text" placeholder="请输入姓名" v-model="user.name">
				</div>
        <div class="weui-cell__ft" v-show="!nameValid">
          <i class="weui-icon-warn"></i>
        </div>
			</div>
			<div class="weui-cell" :class="{'weui-cell_warn': !phoneValid}">
				<div class="weui-cell__hd">
					<label class="weui-label" pattern="[0-9]*">电话</label>
				</div>
				<div class="weui-cell__bd">
					<input class="weui-input" required type="text" placeholder="请输入联系电话" v-model="user.phone">
				</div>
        <div class="weui-cell__ft" v-show="!phoneValid">
          <i class="weui-icon-warn"></i>
        </div>
			</div>

			<div class="weui-cell weui-cell_select weui-cell_select-after">
				<div class="weui-cell__hd">
					<label class="weui-label">校区</label>
				</div>
				<div class="weui-cell__bd">

					<select class="weui-select" v-model="user.campus">
            <option v-for='item in campus' :value="item">{{item}}</option>
          </select>
				</div>
			</div>
		</div>
		<div class="btn-wrapper">
			<div class="weui-btn weui-btn_primary" :class="{'weui-btn_disabled': !allValid}" @click="save">提交</div>
		</div>
    <weui-toast :options="toast"></weui-toast>
	</div>
</template>
<style src="./assets/main.scss" lang="scss"></style>
<script>

  import Vue from 'vue'
  import vue_resource from 'vue-resource'
  Vue.use(vue_resource)

  export default{
    data(){
      return {
        user: {},
        campus:['杨浦','徐汇','奉贤']
      }
    },
    computed: {
      'nameValid': function () {
        return this.user.name
      },
      'phoneValid': function () {
        return this.user.phone
      },
      'allValid': function () {
        return (this.nameValid && this.phoneValid)
      }
    },
    ready () {
      var vm = this
      loadBaseScript.done(function() {
        var authedUser = __getAuthedUser()
        vm.$http.get(`/api/users/${authedUser.id}`).then((res) => {
          if (res.body.code != 0) {
            return this.showWarnToast(res.body.message)
          } else {
            var user = res.body.data
            vm.$set('user', user)
          }
        })
      })
    },
    methods: {
      save () {
        var vm = this
        if (!vm.allValid) {
          return this.showWarnToast('请填写完整信息')
        }
        vm.$http.post(`/api/users/${vm.user.id}/save`, vm.user).then((res)=>{
          if (res.body.code !== 0) {
            return this.showWarnToast(res.body.message)
          } else {
            this.showToast('已更新')
          }
        })
      }
    }
  }
</script>