import Vue from 'vue';
import Layout from './components/layout';
import router from './routes';
import store from './store';

Vue.config.performance = !__PRODUCTION__;
Vue.config.productionTip = false;

// eslint-disable-next-line no-unused-vars
const app = new Vue({
  el: '#mount',
  components: { Layout },
  render: h => h('Layout'),
  router,
  store,
});
