import API from '../services/api';

export default {
  namespaced: true,
  state: {
    meshes: [],
    pages: 0,
  },
  mutations: {
    SET_MESHES(state, { meshes, pages }) {
      state.meshes = meshes || [];
      state.pages = pages || 0;
    },
  },
  actions: {
    fetch({ commit }, page) {
      API.meshes.list(page)
        .then(({ data: results }) => (
          commit('SET_MESHES', results)
        ))
        .catch(() => commit('SET_MESHES', {}));
    },
    reset({ commit }) {
      commit('SET_MESHES', {});
    },
  },
};
