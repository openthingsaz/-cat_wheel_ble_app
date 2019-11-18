import Vue from 'vue'
import Router from 'vue-router'
import { routerHistory, writeHistory } from 'vue-router-back-button'

Vue.use(Router)
Vue.use(routerHistory)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      components: {page: require('./components/Home.vue').default},
      children: [

      ]
    },
    {
      path: '/connect-dialog',
      components: {
        bluetoothConnect: require('./components/home/bluetoothConnectDialog.vue').default
      }
    },
    {
      path: '/led-setting',
      name: 'LED Setting',
      components: {page: require('./components/led-setting/led-setting.vue').default}
    },
    {
      path: '/tmp-setting',
      name: 'Temp Setting',
      components: {page: require('./components/tmp-setting/tmp-setting.vue').default}
    },

    {
      path: '/chart/distance',
      name: 'Chart distance',
      components: {page: require('./components/chart/distance.vue').default}
    },

    {
      path: '/chart/turn',
      name: 'Chart turn',
      components: {page: require('./components/chart/turn.vue').default}
    },

    {
      path: '/chart/burn',
      name: 'Chart burn',
      components: {page: require('./components/chart/burn.vue').default}
    },

    {
      path: '/setting',
      name: 'Setting',
      components: {page: require('./components/setting/setting.vue').default}
    },
    {
      path: '/login',
      name: 'Login',
      components: {login: require('./components/LoginDialog.vue').default}
    }
  ]
})

export default router

router.afterEach(writeHistory)
