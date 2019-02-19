import Vue from 'vue'
import Router from 'vue-router'
import ElementUI from 'element-ui';
import 'vue-social-share/dist/client.css';
import App from './App.vue'
import store from './store'
import router from './router'
import 'element-ui/lib/theme-chalk/index.css';
import axios from './axios';
import Share from 'vue-social-share'
import 'vue-social-share/dist/client.css';
Vue.use(Share)
Vue.use(Router)
Vue.use(ElementUI)
Vue.config.productionTip = false
new Vue({
  el:'#app',
  render: h => h(App),
  store,
  router,
  axios
})
