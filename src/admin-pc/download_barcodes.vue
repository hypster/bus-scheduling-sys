<template>
  <div>
    <h1>hello world!</h1>

            

</head>
<body onload="draw()">
    <canvas width=200 height=200 id="thecanvas"></canvas>
    <div><button onclick="downloadImage()">Download</button></div>
    <image id="theimage"></image>

  </div>
</template>
<style src='./assets/main.scss' lang="scss">


</style>
<script>
  import vue_resource from 'vue-resource'
  import Vue from 'vue'
  Vue.use(vue_resource)
  export default{
    data(){
      return {

      }
    },
    methods:{

    },
    watch:{

    },
    components: {

    },
    ready: function() {

    }
  }
</script>
