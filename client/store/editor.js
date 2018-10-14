import API from '../services/api';
import router from '../routes';

export default {
  namespaced: true,
  state: {
    brush: 1,
    color: '#aaaaaa',
    frame: 0,
    frames: 0,
    hasChanged: false,
    isEditingTitle: false,
    mesh: false,
    tool: 'paint',
  },
  mutations: {
    EDIT_TITLE(state) {
      state.isEditingTitle = true;
    },
    RESET(state) {
      state.frame = 0;
      state.frames = 0;
      state.mesh = false;
      state.hasChanged = false;
      state.isEditingTitle = false;
    },
    SAVED(state) {
      state.hasChanged = false;
    },
    SET_BACKGROUND(state, bg) {
      state.mesh.bg = bg;
      state.hasChanged = true;
    },
    SET_BRUSH(state, brush) {
      state.brush = brush;
    },
    SET_COLOR(state, color) {
      state.color = color;
    },
    SET_FPS(state, fps) {
      state.mesh.fps = fps;
      state.hasChanged = true;
    },
    SET_FRAME(state, index) {
      state.frame = (
        Math.min(Math.max(index, 0), state.frames - 1)
      );
    },
    STEP_FRAME(state, inc) {
      state.frame = (
        Math.min(Math.max(state.frame + inc, 0), state.frames - 1)
      );
    },
    SET_FRAMES(state, { current, total }) {
      state.frame = current;
      state.frames = total;
    },
    SET_MESH(state, mesh) {
      state.mesh = mesh;
    },
    SET_TEXTURE(state, texture) {
      state.mesh.texture = texture;
      state.hasChanged = true;
    },
    SET_TITLE(state, title) {
      if (title && state.mesh.title !== title) {
        state.mesh.title = title;
        state.hasChanged = true;
      }
      state.isEditingTitle = false;
    },
    SET_TOOL(state, tool) {
      state.tool = tool;
    },
  },
  actions: {
    create({ commit, rootState }) {
      const SIZE = __SIZE__;
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
            fps: 2,
            texture: reader.result,
            title: 'Untitled',
          });
        });
        reader.readAsArrayBuffer(blob);
      }, 'image/png');
    },
    editTitle({ commit }) {
      commit('EDIT_TITLE');
    },
    fetch({ commit }, id) {
      Promise.all([
        API.meshes.meta(id),
        API.meshes.texture(id),
      ])
        .then(([{ data: meta }, { data: texture }]) => (
          commit('SET_MESH', {
            ...meta,
            texture,
          })
        ))
        .catch(() => router.push({ name: 'home' }));
    },
    reset({ commit }) {
      commit('RESET');
    },
    save({ commit, state }) {
      API.meshes.save(state.mesh)
        .then(({ data: id }) => {
          if (id) {
            router.replace({ name: 'editor', params: { id } });
          } else {
            commit('SAVED');
          }
        })
        .catch(console.error);
    },
    setBackground({ commit }, bg) {
      commit('SET_BACKGROUND', bg);
    },
    setBrush({ commit }, brush) {
      commit('SET_BRUSH', brush);
    },
    setColor({ commit }, color) {
      commit('SET_COLOR', color);
    },
    setFPS({ commit }, fps) {
      commit('SET_FPS', fps);
    },
    setFrame({ commit }, index) {
      commit('SET_FRAME', index);
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
