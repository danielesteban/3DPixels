import API from '../services/api';

export default {
  namespaced: true,
  state: {
    meshes: [],
    meta: {},
  },
  mutations: {
    SET_MESHES(state, meshes) {
      state.meshes = meshes || [];
    },
    SET_META(state, meta) {
      state.meta = meta || {};
    },
  },
  actions: {
    fetch({ commit }, id) {
      API.user.meshes(id)
        .then(({ data: meshes }) => (
          commit('SET_MESHES', meshes)
        ))
        .catch(() => commit('SET_MESHES', false));
      API.user.get(id)
        .then(({ data: meta }) => (
          commit('SET_META', meta)
        ))
        .catch(() => commit('SET_META', false));
    },
    reset({ commit }) {
      commit('SET_MESHES', false);
      commit('SET_META', false);
    },
  },
};
