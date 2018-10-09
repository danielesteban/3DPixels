import API from '../services/api';

export default {
  namespaced: true,
  state: {
    color: '#ffffff',
    frame: 0,
    frames: 0,
    mesh: {},
    tool: 'paint',
  },
  mutations: {
    RESET(state) {
      state.frame = 0;
      state.frames = 0;
      state.mesh = {};
    },
    SET_BACKGROUND(state, bg) {
      state.mesh.bg = bg;
    },
    SET_COLOR(state, color) {
      state.color = color;
    },
    SET_FPS(state, fps) {
      state.mesh.fps = fps;
    },
    STEP_FRAME(state, inc) {
      state.frame = (
        Math.min(Math.max(state.frame + inc, 0), state.frames - 1)
      );
    },
    SET_FRAMES(state, frames) {
      state.frames = frames;
    },
    SET_ID(state, { id, creator }) {
      state.mesh._id = id;
      state.mesh.creator = creator;
    },
    SET_MESH(state, mesh) {
      state.mesh = mesh || {};
    },
    SET_TEXTURE(state, texture) {
      state.mesh.texture = texture;
    },
    SET_TITLE(state, title) {
      state.mesh.title = title;
    },
    SET_TOOL(state, tool) {
      state.tool = tool;
    },
  },
  actions: {
    create({ commit, rootState }) {
      const SIZE = 32;
      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', () => {
          commit('RESET');
          commit('SET_MESH', {
            _id: false,
            creator: rootState.user.isAuth ? rootState.user.profile : false,
            bg: 0x555555,
            fps: 3,
            texture: reader.result,
            title: 'Untitled',
          });
        });
        reader.readAsArrayBuffer(blob);
      }, 'image/png');
    },
    fetch({ commit }, id) {
      Promise.all([
        API.meshes.meta(id),
        API.meshes.texture(id),
      ])
        .then(responses => commit('SET_MESH', {
          ...responses[0].data,
          texture: responses[1].data,
        }))
        .catch(() => commit('SET_MESH', false));
    },
    reset({ commit }) {
      commit('RESET');
    },
    save({ commit, rootState, state }) {
      API.meshes.save(state.mesh)
        .then(({ data: id }) => {
          if (id) commit('SET_ID', { id, creator: rootState.user.profile });
        })
        .catch(console.error);
    },
    setBackground({ commit }, bg) {
      commit('SET_BACKGROUND', bg);
    },
    setColor({ commit }, color) {
      commit('SET_COLOR', color);
    },
    setFPS({ commit }, fps) {
      commit('SET_FPS', fps);
    },
    stepFrame({ commit }, inc) {
      commit('STEP_FRAME', inc);
    },
    setFrames({ commit }, frames) {
      commit('SET_FRAMES', frames);
    },
    setTexture({ commit }, texture) {
      commit('SET_TEXTURE', texture);
    },
    setTitle({ commit }, title) {
      commit('SET_TITLE', title);
    },
    setTool({ commit }, tool) {
      commit('SET_TOOL', tool);
    },
  },
};
