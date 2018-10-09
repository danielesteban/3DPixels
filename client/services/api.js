import axios from 'axios';
import store from 'store';

const client = axios.create({
  baseURL: __API__,
});

const jwtStoreKey = '3DPixels::JWT';

const API = {
  auth: {
    getStoredToken() {
      return store.get(jwtStoreKey);
    },
    setToken(token) {
      const headers = client.defaults.headers.common;
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        store.set(jwtStoreKey, token);
      } else {
        delete headers.Authorization;
        store.remove(jwtStoreKey);
      }
    },
  },

  meshes: {
    list() {
      return client.get('meshes');
    },
    meta(id) {
      return client.get(`meshes/${id}`);
    },
    save({
      _id,
      bg,
      fps,
      texture,
      title,
    }) {
      const data = new FormData();
      data.append('bg', bg);
      data.append('fps', fps);
      data.append('texture', new Blob([texture], { type: 'image/png' }));
      data.append('title', title);
      return client.put(`meshes/${_id || ''}`, data);
    },
    texture(id) {
      return client.get(
        `meshes/${id}/texture`,
        { responseType: 'arraybuffer' }
      );
    },
  },

  user: {
    signin(email, password) {
      return client
        .post('user', { email, password });
    },
    signup(name, email, password) {
      return client
        .put('user', { name, email, password });
    },
  },
};

export default API;
