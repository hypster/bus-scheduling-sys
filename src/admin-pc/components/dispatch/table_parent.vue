<template type="text/html">

	<div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
		<h2 class="sub-header">批次管理</h2>
		<form class="form-choose-date form-inline">
			<div class="form-group">
				<label for="start_time" class="col-sm-4 col-form-label">开始时间</label>
				<div class="col-sm-4">
					<input class="form-control form_date" type="text" value="" id="start_time" v-model="date1">
				</div>
			</div>
			<div class="form-group">
				<label for="end_time" class="col-sm-4 col-form-label">结束时间</label>
				<div class="col-sm-4">
					<input class="form-control form_date" type="text" value="" id="end_time" v-model="date2">
				</div>
			</div>
			<button class="btn btn-primary" type="submit" @click.prevent="filter">查询</button>
			<button class="btn btn-success" v-show="show_all_show" @click="showAll">显示全部</button>
		</form>

		<div>
			<ul class="nav nav-tabs">
				<li role="presentation" :class='{active:this.active==1}'><a data-value="1" href="#" @click="setActive">批次维护</a>
				</li>
				<li role="presentation" :class='{active:this.active==2}'><a href="#" data-value="2" @click="setActive">派车维护</a>
				</li>
			</ul>

			<div class="table-responsive">
				<table-batch :in-filter="inFilter" :active='active' :date_list="date_list" v-show='active==1'></table-batch>
				<table-dispatch :in-filter="inFilter" :active='active' :date_list="date_list" v-show="active==2"></table-dispatch>
			</div>
		</div>
	</div>

</template>
<style>

</style>
<script>
  import table_batch from './bus_batch_table.vue'
  import table_dispatch from './bus_dispatch_table.vue'
  import modal from './modal_date.vue'
  export default{
    data(){
      return {
        active: 1,
        date1:'',
        date2:'',
        date_list:[],
        show_all_show:false,
        inFilter:false
      }
    },
    components: {
      "table-batch": table_batch,
      "table-dispatch": table_dispatch
    },
    methods: {
      setActive: function (event) {
//        if(event.target.dataset!=undefined){
//          var v = event.target.dataset.value
//
//        }else{
//          event.target
//        }
        var v=$(event.target).data('value')
        this.active = v

      },
      filter:function(){
        if(this.date1==''||this.date2==''){
          return alert('请填写日期')
        }
        this.$set('date_list',[this.date1,this.date2])
        this.inFilter=true
        this.show_all_show=true
      },
      showAll:function(){
        this.inFilter=false
        this.show_all_show=false
        this.$set('date_list',['',''])
      }
    }
  }
</script>