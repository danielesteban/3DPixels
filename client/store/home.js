import API from '../services/api';

export default {
  namespaced: true,
  state: {
    results: [],
  },
  mutations: {
    SET_RESULTS(state, results) {
      state.results = results || [];
    },
  },
  actions: {
    fetch({ commit }) {
      API.meshes.list()
        .then(({ data: results }) => (
          commit('SET_RESULTS', results)
        ))
        .catch(() => commit('SET_RESULTS', false));
    },
    reset({ commit }) {
      commit('SET_RESULTS', false);
    },
  },
};
