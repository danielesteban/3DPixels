import API from '../services/api';

export default {
  namespaced: true,
  state: {
    meshes: [],
    meta: {},
    pages: 0,
  },
  mutations: {
    SET_MESHES(state, { meshes, pages }) {
      state.meshes = meshes || [];
      state.pages = pages || 0;
    },
    SET_META(state, meta) {
      state.meta = meta || {};
    },
  },
  actions: {
    fetch({ commit }, { id, page }) {
      API.user.meshes(id, page)
        .then(({ data: meshes }) => (
          commit('SET_MESHES', meshes)
        ))
        .catch(() => commit('SET_MESHES', {}));
      API.user.get(id)
        .then(({ data: meta }) => (
          commit('SET_META', meta)
        ))
        .catch(() => commit('SET_META', false));
    },
    reset({ commit }) {
      commit('SET_MESHES', {});
      commit('SET_META', false);
    },
  },
};
