<template>
  <div class="col-sm-2 sidebar">
    <!--<ul class="nav nav-sidebar">-->
      <!--<li class="active"><a href="#">Overview <span class="sr-only">(current)</span></a></li>-->
      <!--<li><a href="#">Reports</a></li>-->
      <!--<li><a href="#">Analytics</a></li>-->
      <!--<li><a href="#">Export</a></li>-->
    <!--</ul>-->
    <!--<ul class="nav nav-sidebar">
      <li class=""><a href="#" @click.prevent="">派车管理</a>
        <ul class="secondary">
          <li><a href="" @click.prevent="openMenu('dispatch')">批次管理</a></li>
          <li><a href="" @click.prevent="openMenu('residual_ticket')">临时票管理</a></li>
        </ul>
      </li>
    </ul>

    <ul class="nav nav-sidebar">
      <li class=""><a href="#" @click.prevent="">数据统计</a>
        <ul class="secondary">
          <li><a href="" @click.prevent="openMenu('statistic_order')">售票统计</a></li>
          <li><a href="" @click.prevent="openMenu('statistic_fee')">车费统计</a></li>
          <li><a @click.prevent="openMenu('stop')">站点管理</a></li>
        </ul>
      </li>
    </ul>

    <ul class="nav nav-sidebar">
      <li class=""><a href="#" @click.prevent="">基本信息管理</a>
        <ul class="secondary">
          <li><a href="" @click.prevent="openMenu('company')">班车公司管理</a></li>
          <li><a href="" @click.prevent="openMenu('stop')">站点管理</a></li>
          <li><a href="" @click.prevent="openMenu('line')">班车线路管理</a></li>
          <li><a href="" @click.prevent="openMenu('schedule')">车次管理</a></li>
          <li><a href="" @click.prevent="openMenu('bus')">班车信息管理</a></li>
        </ul>
      </li>
    </ul>
    <ul class="nav nav-sidebar">
      <li><a href="" @click.prevent="">预定管理</a>
        <ul class="secondary">
          <li><a href="" @click.prevent="openMenu('order')">售票明细查询</a></li>
          <li><a href="" @click.prevent="openMenu('order_switch')">售票开关设置</a></li>
        </ul>
      </li>
    </ul>-->
    <ul class="nav nav-sidebar">
      <li v-for="m in menu"><a href="" @click.prevent="">{{m.text}}</a>
        <ul class="secondary">
          <li v-for="sm in m.subMenu"><a href="" @click.prevent="openMenu(sm.navTo)">{{sm.text}}</a></li>
        </ul>
      </li>
    </ul>
  </div>
</template>
<style lang="scss">

  .sidebar{
    padding-right: 0;
  }
  .sidebar ul a:hover{
    background:none;
  }

.nav>li>a{
  color:#000;
}
.sidebar ul a{
  text-decoration: none;
  &:hover{
    text-decoration: none;
    background-color: #eee;
}
}
  .secondary{
    li{
      margin-left: 30px;
      list-style: none;
      }
    }


.nav>li>a:focus, .nav>li>a:hover {
    text-decoration: none;
    /*background-color: #eee;*/
  }
</style>
<script>
    export default{
        data(){
            return{
              menu: [],
              admin: {
                username: '',
                realname: ''
              }
            }
        },
        methods:{
          openMenu: function(item){
            this.$emit('openmenu', item)
          }
        },
        ready () {
          this.menu = __session.menu
          this.openMenu(this.menu[0].subMenu[0].navTo)
        }
    }
</script>
