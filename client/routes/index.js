import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from './home';
import Editor from './editor';
import NotFound from './notfound';

Vue.use(VueRouter);

export default new VueRouter({
  base: __BASENAME__,
  routes: [
    {
      component: Home,
      name: 'home',
      path: '/',
    },
    {
      component: Editor,
      name: 'editor',
      path: '/editor/:id?',
    },
    {
      component: NotFound,
      name: '404',
      path: '*',
    },
  ],
});
