<template>
  <div class="entry" id="entry">

    <div class="weui-cells__title page-title">上师大校车班车在线购票</div>
    <div class="weui-cells">
      <div class="weui-cell weui-cell_select start">
        <div class="weui-cell__hd">
          <label class="weui-label">始发站</label>
        </div>
        <div class="weui-cell__bd">
          <select name="start" class="weui-select"  v-model="currentId">
            <option v-for="(index,station) in stations" :value='station.id'>{{station.name}}</option>
          </select>
        </div>
      </div>
      <div class="weui-cell weui-cell_select end">
        <div class="weui-cell__hd">
          <label class="weui-label">终点站</label>
        </div>
        <div class="weui-cell__bd">
          <select name="end" class="weui-select" v-model='currentId2'>
            <option :value="station.id" v-for="station in stations2">{{station.name}}</option>
          </select>
        </div>
      </div>
      <div class="weui-cell weui-cell_select end">
        <div class="weui-cell__hd">
          <label class="weui-label">班车公司</label>
        </div>
        <div class="weui-cell__bd">
          <select name="end" class="weui-select" v-model='currentCompanyId'>
            <option value="00000000-0000-0000-0000-000000000000" selected>全部</option>
            <option :value="company.id" v-for="(index, company) in companies">{{company.name}}</option>
          </select>
        </div>
      </div>
    </div>
    <div class="weui-btn-area"><a href='./schedule.html' @click='clickHandler' class="weui-btn weui-btn_primary">确定</a></div>
    <weui-toast :options="toast"></weui-toast>
  </div>
</template>
<style src="./assets/main.scss" lang="scss">
</style>
<script>
  import Vue from 'vue'
  //  import routes from './components/Routes.vue'
  import vue_resource from 'vue-resource'
  Vue.use(vue_resource)
//stations
//bus_lines
  export default {
    data() {
      return {
        currentId:'',
        currentId2:'',
        stations:[],
        stations2:[],
        bus_lines:[],
        companies:[],
        currentCompanyId:'',
        lineId:''
      }
    },
    watch: {
      currentId: "setStations2"
    },
    methods: {
      setStations2:function () {
        //in case bus_lines not loaded
        if (!this.bus_lines.length)
          return false
        var arr = [],
          id,
          i,
          stations = this.stations,
          length = stations.length,
          vm=this,

        filteredStations2keys=this.bus_lines.filter(function(line){
          return line.start_station_id==vm.currentId
        }).map(function(line){
          return line.terminal_station_id
        })

        var stations2=this.stations.filter(function(station){
          return filteredStations2keys.indexOf(station.id)!=-1
        })
        this.$set('stations2',stations2)
        if(!this.stations2.length){
          this.currentId2=''
          return false
        }
        this.$set("currentId2",this.stations2[0].id)
      },
      updateLineId:function(){
        var l = this.bus_lines,
                length=l.length,
                i,
                current,
                id

          for(i=0;i<length;i++){
            current=l[i]
            if(current.start_station_id==this.currentId&&current.terminal_station_id==this.currentId2){
              this.$set('lineId',current.id)
              localStorage.setItem('lineId',current.id)
              return
            }
          }
      },
      clickHandler:function(event){
        if(!this.bus_lines.length||!this.currentId||!this.currentId2){
          event.preventDefault()
          return false
        }

        localStorage.setItem('companyId', this.currentCompanyId)
        this.updateLineId()
        this.lineId=''
      }
    },
    ready: function(){
      var vm = this
      loadBaseScript.done(function() {
        var cnt=0
        vm.$http.get('/api/stations').then(function(response){
          vm.$set('stations',response.body.data)
          cnt++
          if(cnt==2) {
            let index = 0
            do {
              vm.currentId=vm.stations[index++].id
              vm.setStations2()
            } while (!vm.currentId2 && index<vm.stations.length)
          }
        })

        vm.$http.get('/api/bus_lines').then(function(response){
          vm.$set('bus_lines',response.body.data)
          cnt++
          if(cnt==2) {
            let index = 0
            do {
              vm.currentId=vm.stations[index++].id
              vm.setStations2()
            } while (!vm.currentId2 && index<vm.stations.length)
          }
        })

        vm.$http.get('/api/companies').then(function(response){
          var companies = response.body.data
          if (companies.length) {
            // vm.currentCompanyId = companies[0].id
          }
          vm.$set('companies', companies)
        })
      })
    }
  }
</script>
