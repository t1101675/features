import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store/index'
import MainApp from '@/components/main'
Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'main',
      component: MainApp
    }
  ]
});

router.beforeEach((to, from, next) => {
  let token = store.state.token;
  if (to.meta.requiresAuth) {
    if (token) {
      next();
    } else {
      next({
        path: '/',
        query: {
          redirect: to.fullPath
        }
      });
    }
  } else {
    next();
  }
});
export default router;