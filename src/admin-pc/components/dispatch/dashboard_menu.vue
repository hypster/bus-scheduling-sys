<template>
  <nav class="navbar navbar-inverse navbar-fixed-top">
    <div class="container-fluid">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="#">学生班车管理平台</a>
      </div>
      <div id="navbar" class="navbar-collapse collapse">
        <ul class="nav navbar-nav navbar-right">
          <li><span class="welcome">欢迎，{{adminName}}</span></li>
          <li><a href="javascript:;" @click="signout">登出</a></li>
        </ul>
        <!--<form class="navbar-form navbar-right">-->
          <!--<input type="text" class="form-control" placeholder="Search...">-->
        <!--</form>-->
      </div>
    </div>
  </nav>
</template>
<style>
  span.welcome {
    line-height: 20px;
    padding: 15px 0;
    display: block;
    color: #fff;
  }
</style>
<style>
</style>
<script>
  import Vue from 'vue'
  import vueResource from 'vue-resource'
  Vue.use(vueResource)

  export default {
    data () {
        return{
          admin: {
            username: '',
            realname: ''
          }
        }
    },
    computed: {
      adminName () {
        var vm = this
        if (vm.admin.realname) {
          return vm.admin.realname
        }
        if (vm.admin.username) {
          return vm.admin.username
        }
        return '管理员'
      }
    },
    methods: {
      signout () {
        var vm = this
        vm.$http.post('/api/web/admin/signout').then( res => {
          location.href = 'signin.html'
        })
      }
    },
    ready () {
      this.admin = __session.admin
    }
  }
</script>
