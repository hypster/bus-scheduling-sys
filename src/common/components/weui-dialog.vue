<template>
	<div class="js_dialog" id="iosDialog1" v-if="options.type=='confirm'" v-show="options.show">
		<div class="weui-mask"></div>
		<div class="weui-dialog">
			<div class="weui-dialog__hd"><strong class="weui-dialog__title">{{options.title}}</strong></div>
			<div class="weui-dialog__bd">{{options.body}}</div>
			<div class="weui-dialog__ft">
				<a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_default" @click="options.default.click">{{options.default.text}}</a>
				<a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_primary" @click="options.primary.click">{{options.primary.text}}</a>
			</div>
		</div>
	</div>

	<div class="js_dialog" id="iosDialog2" v-if="options.type=='notice'" v-show="options.show">
		<div class="weui-mask"></div>
		<div class="weui-dialog">
			<div class="weui-dialog__bd">{{options.body}}</div>
			<div class="weui-dialog__ft">
				<a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_primary" @click="options.default.click">{{options.default.text}}</a>
			</div>
		</div>
	</div>
</template>

<style></style>

<script>
  export default {
    props: ['options']
  }
</script>