<template>

  <div class="modal-mask" transition="modal">
    <div class="modal-wrapper">
      <div class="modal-container">

        <div class="modal-header">
          <h3>新增二维码</h3>
        </div>

        <div class="modal-body">
          <slot name="body">
            <div class="img-wrapper">
              <div id="imageHolder"></div>
            </div>
          </slot>
        </div>

        <div class="modal-footer">
          <slot name="footer">
            <div class="form-group">
              <div class="btn-group">
                <!--<a class="btn btn-success" :href="imageURL" :download="bus_in_edit.companyName+' '+bus_in_edit.license_plate+'.png'">下载图片</a>-->
                <button class="btn btn-success" @click="downloadBarcode()">下载二维码</button>
                <button class="btn btn-primary" @click="printBarcode">打印二维码</button>
                <button class="btn btn-default" @click="closeLogic">返回</button>
              </div>
            </div>
          </slot>
        </div>
      </div>
    </div>
  </div>


</template>
<style lang="scss">
.img-wrapper{
  display: inline-block;
  .img-text{
    margin-top: -35px;
    text-align: center;
  }

  .img-title{
    margin-bottom: -35px;
    z-index: 1000;
    position: relative;
  }
}

</style>
<script>
  import Vue from 'vue'
  import vue_resource from 'vue-resource'
  Vue.use(vue_resource)
  import util from '../../../common/util'

  export default{
    data(){
      return {
          imageURL:''
      }
    },
    computed:{
      computedUrl:function(){
        return '/api/web/getBusimg?license_plate=' + encodeURIComponent(this.bus_in_edit.license_plate)
        // return $('canvas')[0].toDataURL().replace(/^data:image\/png;base64,/, '')
      }
    },

    props: ['type','bus_in_edit'],
    watch:{
      bus_in_edit:function(){
        if(this.bus_in_edit){
          this.clearCanvas()
          this.drawCanvas(this.bus_in_edit)
        }
      }
    },
    methods: {
      closeLogic:function(){
        console.log('in close logic child')
        this.bus_in_edit=''
        this.$emit('close',this.type)
      },
      downloadBarcode () {
        var vm = this
        var filename = vm.bus_in_edit.companyName +' '+ vm.bus_in_edit.license_plate + '.png'
        var canvas = document.getElementById('myCanvas')
        if (canvas.msToBlob) { //for IE
            var blob = canvas.msToBlob()
            window.navigator.msSaveBlob(blob, filename)
          } else {
            //other browsers
            var link = document.createElement('a')
            link.href = canvas.toDataURL()
            link.download = filename
            link.click()
          }
      },
      printBarcode:function(){
        console.log('in print ')
        var popup=window.open()
        var str='<div style="display: inline-block;width: 600px;">'+
        '<h1 style="position:absolute;text-align:center;left:130px;font-size: 50px;z-index:1000;font-family: STHeiti,simHei,\'华文细黑\',serif">上师大学生班车</h1>'+
          '<img style="width: 600px;margin-top:20px;z-index:-1"  src="' + this.computedUrl + '" onload="javascript:window.print()">'+
          '<h1 style="text-align:center;margin-top: -60px;font-size: 50px;font-family: STHeiti,simHei,\'华文细黑\',serif">'+this.bus_in_edit.companyName+
          ' '+this.bus_in_edit.license_plate+
          '</h1>'+
        '</div>'
        popup.document.write(str)
        popup.focus()
      },
      updateURL(canvas){

        function dlCanvas(canvas) {
          var dt = canvas.toDataURL('image/png');
          /* Change MIME type to trick the browser to downlaod the file instead of displaying it */
          dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');

          /* In addition to <a>'s "download" attribute, you can define HTTP-style headers */
          dt = dt.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Canvas.png');

          return dt
        };
        this.$set('imageURL',dlCanvas(canvas))
      },
      clearCanvas(){
        $('#imageHolder').empty()
      },
      drawCanvas(bus){
          let name=bus.companyName,license_plate=bus.license_plate
          let canvas=document.createElement('canvas')
          $(canvas).attr('id', 'myCanvas')
          $(canvas).attr('width',400)
          $(canvas).attr('height',400)
          let ctx = canvas.getContext("2d");
          let base_image=new Image()
          $(base_image).attr('src','/api/web/getBusimg?license_plate='+encodeURIComponent(license_plate))
          $(base_image).load(()=>{
            console.log('in load')
            ctx.drawImage(base_image,(canvas.width-base_image.width)/2,(canvas.height-base_image.height)/2);
            ctx.font = "30px Arial";
            ctx.textAlign='center';
            ctx.fillText('上师大学生班车',canvas.width/2,canvas.height/6.5)
            ctx.font = "40px Arial";
            ctx.fillText(name+' '+license_plate,canvas.width/2,canvas.height-30)
            this.updateURL(canvas)
            $(canvas).appendTo($('#imageHolder'))
          })
      }
    }
  }
</script>
