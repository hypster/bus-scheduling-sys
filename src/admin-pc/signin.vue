<template>
  <div class="container">

      <form class="form-signin" role="form">
        <h2 class="form-signin-heading">管理员登录</h2>
        <input type="text" class="form-control" placeholder="请输入用户名" required="" autofocus="" v-model="username">
        <input type="password" class="form-control" placeholder="请输入密码" required="" v-model="password">
        <div class="checkbox">
          <label>
            <input type="checkbox" v-model="rememberMe"> 记住账号
          </label>
        </div>
        <button class="btn btn-lg btn-primary btn-block" @click.prevent="signin">登录</button>
      </form>

    </div>
</template>

<style>
body {
  padding-top: 40px;
  padding-bottom: 40px;
  background-color: #eee;
}

.form-signin {
  max-width: 330px;
  padding: 15px;
  margin: 0 auto;
}
.form-signin .form-signin-heading,
.form-signin .checkbox {
  margin-bottom: 10px;
}
.form-signin .checkbox {
  font-weight: normal;
}
.form-signin .form-control {
  position: relative;
  height: auto;
  -webkit-box-sizing: border-box;
     -moz-box-sizing: border-box;
          box-sizing: border-box;
  padding: 10px;
  font-size: 16px;
}
.form-signin .form-control:focus {
  z-index: 2;
}
.form-signin input[type="text"] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
.form-signin input[type="password"] {
  margin-bottom: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>

<script>
  import Vue from 'vue'
  import vueResource from 'vue-resource'
  Vue.use(vueResource)

  function getCookie (name) {
    if (document.cookie.length > 0) {
      var start = document.cookie.indexOf(name + '=')
      if (start !== -1) {
        start = start + name.length + 1
        var end = document.cookie.indexOf(';', start)
        if (end === -1) end = document.cookie.length
        return decodeURIComponent(document.cookie.substring(start, end))
      }
    }
    return ''
  }

  function setCookie (name, value, expiredays) {
    var exdate = new Date()
    exdate.setDate(exdate.getDate() + expiredays)
    document.cookie = name + '=' + encodeURIComponent(value) +
      ((expiredays == null) ? '' : ';expires=' + exdate.toGMTString())
  }


  export default {
    data () {
      return {
        username: '',
        password: '',
        rememberMe: false
      }
    },
    computed: {
      formValid: function () {
        var vm = this
        return !(!vm.username || !vm.password)
      }
    },
    ready () {
      var vm = this
      vm.username = getCookie('username')
      vm.rememberMe = !!vm.username
    },
    methods: {
      signin () {
        var vm = this
        if (!vm.formValid) {
          return false
        }
        var body = {
          username: vm.username,
          password: vm.password
        }
        vm.$http.post('/api/web/admin/signin' + location.search, body).then(res => {
          var result = res.body
          if (result.code !== 0) {
            alert(result.message)
          } else {
            setCookie('username', (vm.rememberMe ? vm.username : ''))
            LoginSession.setSession(res.body.data)
            location.href = result.data.returnUrl
          }
        })
      }
    }
  }
</script>