<template>
<div class="row">
  <div class="row-inline-block">
    <nav aria-label="Page navigation">
      <ul class="pagination">
        <li class="page-item">
          <a class="page-link" href="#" aria-label="Previous" @click="setCurrent('previous')">
            <span aria-hidden="true">&laquo;</span>
            <span class="sr-only">Previous</span>
          </a>
        </li>
        <li class="page-item"><a class="page-link"  href="#" v-for="index in displayPages" @click="linkTo(url,index+this.current)">{{current+index+1}}</a></li>
        <li class="page-item">
          <a class="page-link" href="#" aria-label="Next" @click="setCurrent('next')">
            <span aria-hidden="true">&raquo;</span>
            <span class="sr-only">Next</span>
          </a>
        </li>
      </ul>
    </nav>
  </div>
  <div class="row-inline-block">
    <div class="input-group">
      <span class="input-group-addon">共{{pages}}页，当前第{{offset+1}}页，前往第</span>
      <select id="userselect" type="text" style="max-width: 120px;" class="form-control" aria-label="go to designated page" v-model="userselect">
        <option :value="n" v-for="n in pages">{{n+1}}</option>
      </select>
      <span class="input-group-addon">页</span>
      <span class="input-group-btn">
        <button @click="linkTo(url,userselect,true)" class="btn btn-primary">GO</button>
      </span>
    </div>
</div>
</div>

</template>
<style>
select#userselect{
  min-width: 60px;
}
.pagination{
  margin:0;
}
.input-group-addon, .input-group-btn {
  width: auto;
}
.row-inline-block {
  display: inline-block;
}
</style>
<script>
  import vue_resource from 'vue-resource'
  import Vue from 'vue'
  import util from '../../common/util'
  Vue.use(vue_resource)
  export default{
    data(){
      return {
//      total pages
        pages: 0,
        //the current number of the first page marker on the page
        current: 0,
        pagination_limit: 5,
//        offset: 0,
        userselect: 0
      }
    },
    //count:number of datas
    //limit: how many data to display per page
    props: {
      "count": {},
      "limit": {},
      "order": {},
      "url": {},
      "current-item": {},
      "parent_show": {},
      "option": {},
      "offset": {
        default: 0
      }
    },
    computed: {
      //how many pages are left
      rest: function () {
        return this.pages - this.current
      },
      displayPages: function () {
        return this.rest > this.pagination_limit ? this.pagination_limit : this.rest
      }
    },
    watch: {
      //when count changes set the total page number using Math.ceil
      count: function () {
        var pages = Math.ceil(this.count / this.limit)
        this.pages = pages
        if (this.offset == undefined)
          this.offset = 0
      },
      parent_show: function () {
        if (this.parent_show == false) {
          this.current = 0;
        }
      }
    },

    methods: {
      linkTo: function (url, offset, isSelect) {
        if (isSelect) {
          this.current = Math.floor(offset / this.pagination_limit) * this.pagination_limit
        }
//        if (offset < 0 || offset > this.pages - 1)
//          return
        this.offset = offset
        this.$emit('currentoffset', this.offset)
        var msg = {
          data: {
            limit: this.limit,
            offset: '' + offset,
            order: this.order
          }
        }
        var json = {}
        for (let key in this.option) {
          if (this.option[key])
            json[key] = this.option[key]
        }
        Object.assign(msg.data, json)
        msg.data.offset = '' + offset
//        console.log(msg)
        if (this.currentItem) {
          msg.data.batch_id = this.currentItem.b_id
        }
        util.nextPage.call(this, url, msg, this.callback)

      },
      setCurrent: function (type) {

        switch (type) {
          case 'next':
            var next = this.current + this.pagination_limit
            if (next >= this.pages)
              return
            else
              this.current = next
            break
          case 'previous':
            var previous = this.current - this.pagination_limit
            if (previous < 0)
              return
            else
              this.current = previous
            break;
        }

      },
      callback: function (res) {
//        console.log(res)
        this.$emit('getnewres', res)
      }
    }
  };
</script>
