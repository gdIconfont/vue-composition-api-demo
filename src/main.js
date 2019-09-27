import Vue from 'vue'

// 先通过 Vue.use() 进行安装
import VueCompositionApi from '@vue/composition-api'
Vue.use(VueCompositionApi)

import App from './App.vue'
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
