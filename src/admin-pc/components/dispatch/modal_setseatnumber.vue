<template>

    <div class="modal-mask" transition="modal">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
          <h3>设置座位数</h3>
          </div>

          <div class="modal-body">
            <slot name="body">
              <form class="form-horizontal" role="form">
                <div class="form-group">
                  <label for="seatNumber" class="col-sm-4 control-label">填写座位数</label>
                  <div class="col-sm-8">
                    <input type="number" v-model="number" class="form-control" id="seatNumber">
                  </div>
                </div>
              </form>
            </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              <div class="form-group">
                <div class="btn-group">
                  <button class="btn btn-default modal-default-button" @click="save">
                    保存
                  </button>
                  <button class="btn btn-default modal-default-button" @click="$emit('close')">
                    取消
                  </button>
                </div>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </div>

</template>
<style>
  /*.modal-mask {*/
    /*position: fixed;*/
    /*z-index: 9998;*/
    /*top: 0;*/
    /*left: 0;*/
    /*width: 100%;*/
    /*height: 100%;*/
    /*background-color: rgba(0, 0, 0, .5);*/
    /*display: table;*/
    /*transition: opacity .3s ease;*/
  /*}*/

  /*.modal-wrapper {*/
    /*display: table-cell;*/
    /*vertical-align: middle;*/
  /*}*/

  /*.modal-container {*/
    /*width: 500px;*/
    /*margin: 0px auto;*/
    /*padding: 20px 30px;*/
    /*background-color: #fff;*/
    /*border-radius: 2px;*/
    /*box-shadow: 0 2px 8px rgba(0, 0, 0, .33);*/
    /*transition: all .3s ease;*/
    /*font-family: Helvetica, Arial, sans-serif;*/
  /*}*/
  /*.modal-header{*/
    /*border:none;*/
  /*}*/
  /*.modal-header h3 {*/
    /*margin-top: 0;*/
    /*color: #42b983;*/
  /*}*/

  /*.modal-body {*/
    /*margin: 20px 0;*/
  /*}*/

  /*.modal-default-button {*/
    /*float: right;*/
  /*}*/

  /*
   * The following styles are auto-applied to elements with
   * transition="modal" when their visibility is toggled
   * by Vue.js.
   *
   * You can easily play with the modal transition by editing
   * these styles.
   */

  .modal-enter {
    opacity: 0;
  }

  .modal-leave-active {
    opacity: 0;
  }

  .modal-enter .modal-container,
  .modal-leave-active .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }

</style>
<script>

  export default{
    data(){
      return {
        number:0,
      }
    },
    props:['modalType','seat_changed'],
    methods:{

      save:function(event){
        console.log('in save')
        if(this.number<0)
          return alert('请设置正确座位数')
        this.$http.post('/api/web/dispatch_detail/setEdit',{
        data:{
          id:this.seat_changed.id,
          seat_count:Number(this.number).toString()
        }
        }).then(function(res){
          console.log(res)
          this.$emit('close',this.number)
        })
      }

    },
    watch:{
      seat_changed:function(){
          this.number=this.seat_changed.seat_count
      }
    },
    components: {}
  }
</script>
