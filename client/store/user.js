import decode from 'jwt-decode';
import API from '../services/api';

export default {
  namespaced: true,
  state: {
    isAuth: false,
    isShowingAuth: false,
    profile: {},
  },
  mutations: {
    SHOW_AUTH(state) {
      state.isShowingAuth = true;
    },
    HIDE_AUTH(state) {
      state.isShowingAuth = false;
    },
    SIGN_IN(state, token) {
      state.isAuth = true;
      state.isShowingAuth = false;
      state.profile = decode(token);
      API.auth.setToken(token);
    },
    SIGN_OUT(state) {
      state.isAuth = false;
      state.profile = {};
      API.auth.setToken();
    },
  },
  actions: {
    initAuth({ commit }) {
      const storedToken = API.auth.getStoredToken();
      if (storedToken) {
        commit('SIGN_IN', storedToken);
        API.auth.refreshToken()
          .then(({ data: token }) => API.auth.setToken(token))
          .catch(() => commit('SIGN_OUT'));
      }
    },
    showAuth({ commit }) {
      commit('SHOW_AUTH');
    },
    hideAuth({ commit }) {
      commit('HIDE_AUTH');
    },
    signin({ commit }, { email, password }) {
      API.user.signin(email, password)
        .then(({ data: token }) => (
          commit('SIGN_IN', token)
        ))
        .catch(err => console.error(err));
    },
    signout({ commit }) {
      commit('SIGN_OUT');
    },
    signup({ commit }, { name, email, password }) {
      API.user.signup(name, email, password)
        .then(({ data: token }) => (
          commit('SIGN_IN', token)
        ))
        .catch(err => console.error(err));
    },
  },
};
