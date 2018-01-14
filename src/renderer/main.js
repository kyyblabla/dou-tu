import Vue from 'vue'
import axios from 'axios'
import App from './App'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import directive from 'element-ui/packages/popover/src/directive'
Vue.directive('popover', directive)

Vue.use(Element)
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: {App},
  template: '<App/>'
}).$mount('#app')
