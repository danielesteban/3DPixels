import API from '../services/api';
import router from '../routes';

export default {
  namespaced: true,
  state: {
    meshes: [],
    meta: {},
    pages: 0,
  },
  mutations: {
    RESET(state) {
      state.meshes = [];
      state.pages = 0;
      state.meta = {};
    },
    SET_MESHES(state, { meshes, pages }) {
      state.meshes = meshes;
      state.pages = pages;
    },
    SET_META(state, meta) {
      state.meta = meta;
    },
  },
  actions: {
    fetch({ commit }, { id, page }) {
      Promise.all([
        API.user.meshes(id, page)
          .then(({ data }) => (
            commit('SET_MESHES', data)
          )),
        API.user.get(id)
          .then(({ data }) => (
            commit('SET_META', data)
          )),
      ]).catch(() => router.push({ name: 'home' }));
    },
    reset({ commit }) {
      commit('RESET');
    },
  },
};
