import Vue from 'vue'
import Page from '{{Page}}'
import mixins from '../../common/mixins'

Vue.mixin(mixins)

/* eslint-disable no-new */
new Vue({
  el: 'body',
  components: { app: Page }
})
