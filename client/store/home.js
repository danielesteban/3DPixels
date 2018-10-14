import API from '../services/api';

export default {
  namespaced: true,
  state: {
    meshes: [],
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
  },
  actions: {
    fetch({ commit }, page) {
      API.meshes.list(page)
        .then(({ data }) => (
          commit('SET_MESHES', data)
        ))
        .catch(() => commit('RESET'));
    },
    reset({ commit }) {
      commit('RESET');
    },
  },
};
