<template type="text/html">

	<div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
		<h2 class="sub-header">临时票管理</h2>
    <form class="form-choose-date form-inline">
			<div class="form-group" v-show="companySelect">
				<label class="col-sm-6 col-form-label">公司名称</label>
				<div class="col-sm-6">
					<select class="form-control" v-model="data.companyId">
              <option v-for="company in company_list" :value="company.id">{{company.name}}</option>
					</select>
				</div>
			</div>
      <div class="form-group" style="margin-left: 15px;">
				<label class="col-sm-2 col-form-label" style="text-align: right;">班次</label>
				<div class="col-sm-10" style="padding-left: 0;">
					<select class="form-control" v-model="data.batch_id">
              <option v-for="batch in batch_list" :value="batch.id">{{formatDate(batch.start_time)+'-'+formatDate(batch.end_time)}}</option>
					</select>
				</div>
			</div>
			<button class="btn btn-primary" type="submit" @click.prevent="filter">查询</button>
			<button class="btn btn-success" @click.prevent="fetch">显示全部</button>
		</form>
    <table class="table table-striped">
      <thead>
      <tr>
        <th>派车编号</th>
        <th>发车日期</th>
        <th>公交公司</th>
        <th>所属线路</th>
        <th>发车时间</th>
        <th>座位数</th>
        <th>已售票</th>
        <th>临时票数</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <form>
        <tr v-for="item in current_list">
          <td>{{item.serial_no}}</td>
          <td>{{formatDate(item.start_time)}}</td>
          <td>{{item.company}}</td>
          <td>{{item.name}}</td>
          <td>{{item.begin_time.replace(/:00$/, '')}}{{item.end_time==="00:00:00"?'':'-'+item.end_time.replace(/:00$/, '')}}</td>
          <td>{{item.seat_count}}</td>
          <td>{{item.sold_count}}</td>
          <td>{{item.full_price_seat_count}}</td>
          <td>
            <button class="btn btn-primary" @click="openDialog(item)">设置临时票数</button>
          </td>
        </tr>
      </form>

      </tbody>
    </table>
    <div id="pagination" class="col-sm-8">
      <pagination @getnewres='callback' :url="url" :count="count" :limit="pagination_data.limit" :order="pagination_data.order" :option="data" ></pagination>
    </div>
    <modal_residual  @savesuccess='afterSave' :element_in_edit='element_in_edit' @close="closeDialog" v-show="modal_residual_show"></modal_residual>
	</div>

</template>
<style scoped>

</style>
<script>
  import pagination from './../pagination.vue'
  import Vue from 'vue'
  import vue_resource from 'vue-resource'
  import util from '../../../common/util'
  import modal_residual from './modal_residual.vue'
  Vue.use(vue_resource)
  export default{
    data(){
      return {
        current_list:[],
        company_list:[],
        batch_list:[],
        element_in_edit:'',
        modal_residual_show:false,
        companySelect:true,
				url:'/api/web/v_Ddetail/getPage',
				count:0,
        pagination_data:{
          limit:10,
          order: 'start_time desc, begin_time',
					offset:"0"
        },
        inFilter:false,
        data:{
					companyId:'',
					batch_id:''
				},
        option:{}
      }
    },
    components: {
      pagination,
      modal_residual
    },
    methods: {
      formatDate(date){
        return util.formatDate(date)
      },
      fetch() {
				var json={}
				for(var key in this.data){
					if(key!='companyId')
						this.data[key]=''
				}
				for(var key in this.data){
					if(this.data[key])
						json[key]=this.data[key]
				}
				Object.assign(json,this.pagination_data)

        util.nextPage.call(this, this.url, {
          data:json
        },this.callback)
      },
			filter(){
				var json={}
				for(var key in this.data){
					if(this.data[key])
						json[key]=this.data[key]
				}
				Object.assign(json,this.pagination_data)

        util.nextPage.call(this, this.url, {
          data:json
        },this.callback)
			},
      callback(res){
        console.log(res)
        this.$set('current_list',res.body.data.rows)
        this.count=res.body.data.count
      },
      fetchCompany(){
        this.$http.post('/api/web/company/getAll',{})
        .then(function(res){
          this.$set('company_list',res.body.data.rows)
        })
      },
      fetchBatch(){
        this.$http.post('/api/web/dispatch_batch/getAll',{
          data:{
            order:"start_time desc"
          }
        }).then(function(res){
          this.$set('batch_list',res.body.data.rows)
        })
      },

      openDialog(item){
        console.log('in open dialog')
        this.modal_residual_show=true
        this.element_in_edit=item
      },
      closeDialog(){
        this.modal_residual_show=false
        this.element_in_edit=''
      },
      afterSave(){
        this.closeDialog()
        this.fetch()
        this.inFilter=false
      },
      readyFunc(){
        if(__session.admin.company_id){
          this.data.companyId=__session.admin.company_id
          this.option.companyId=__session.admin.company_id
          this.companySelect=false
          return this.fetch()
        }
        this.fetchCompany()
        this.fetch()
      }
    },
    ready(){
      this.fetchBatch()
      this.readyFunc()
    }
  }
</script>
