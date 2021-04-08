<template>
	<div class="page toast js_show">
		
		<!--BEGIN toast-->
		<div id="toast" v-show="options.showToast">
			<div class="weui-mask_transparent"></div>
			<div class="weui-toast">
				<i :class="{'weui-icon-success-circle': (!options.warn), 'weui-icon_toast': true, 'weui-icon-warn': (options.warn)}"></i>
				<p class="weui-toast__content">{{options.message}}</p>
			</div>
		</div>
		<!--end toast-->

		<!-- loading toast -->
		<div id="loadingToast" v-show="options.showLoadingToast">
			<div class="weui-mask_transparent"></div>
			<div class="weui-toast">
				<i class="weui-loading weui-icon_toast"></i>
				<p class="weui-toast__content">{{options.message}}</p>
			</div>
		</div>

	</div>
</template>

<style>

</style>

<script>
  export default {
    props: ['options'],
    watch: {
      'options.showToast': function (val, oldVal) {
        var vm = this
        if (val && !oldVal) {
          setTimeout(function () {
            vm.$dispatch('hideToast')
          }, vm.options.duration)
        }
      },
      'options.showLoadingToast': function (val, oldVal) {
        var vm = this
        if (val && !oldVal) {
          setTimeout(function () {
            vm.$dispatch('hideLoadingToast')
          }, v.options.duration)
        }
      }
    }
  }
</script>