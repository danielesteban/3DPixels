process.env.NODE_ENV = 'test';
const assert = require('assert');
const request = require('supertest');
const api = require('../');

const testMesh = {
  bg: 0xFFFFFF,
  fps: 2,
  title: 'test',
  texture: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAhElEQVR4Xu3VAREAMAwCseLfdIV85qAcGbv4W/z+E4AGxBNAIF4AnyACCMQTQCBeACuAAALxBBCIF8AKIIBAPAEE4gWwAgggEE8AgXgBrAACCMQTQCBeACuAAALxBBCIF8AKIIBAPAEE4gWwAgggEE8AgXgBrAACCMQTQCBeACuAQJ3AA2jYAEGs/2CBAAAAAElFTkSuQmCC',
    'base64'
  ),
  pixel: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII',
    'base64'
  ),
};

describe('Create a mesh', () => {
  it('PUT /meshes without a token should return a 401', () => (
    request(api)
      .put('/meshes')
      .expect(401)
  ));
  it('PUT /meshes/ without params should return a 422', () => (
    request(api)
      .put('/meshes')
      .set('Authorization', `Bearer ${api.get('testUserToken')}`)
      .expect(422)
  ));
  it('PUT /meshes with a bad texture should return a 422', () => (
    request(api)
      .put('/meshes')
      .set('Authorization', `Bearer ${api.get('testUserToken')}`)
      .field('bg', testMesh.bg)
      .field('fps', testMesh.fps)
      .field('title', testMesh.title)
      .attach('texture', Buffer.from([0, 0, 0]), 'texture.png')
      .expect(422)
  ));
  it('PUT /meshes with an incorrect texture size should return a 422', () => (
    request(api)
      .put('/meshes')
      .set('Authorization', `Bearer ${api.get('testUserToken')}`)
      .field('bg', testMesh.bg)
      .field('fps', testMesh.fps)
      .field('title', testMesh.title)
      .attach('texture', testMesh.pixel, 'texture.png')
      .expect(422)
  ));
  it('PUT /meshes should return the mesh id', () => (
    request(api)
      .put('/meshes')
      .set('Authorization', `Bearer ${api.get('testUserToken')}`)
      .field('bg', testMesh.bg)
      .field('fps', testMesh.fps)
      .field('title', testMesh.title)
      .attach('texture', testMesh.texture, 'texture.png')
      .expect(200)
      .then(({ body: mesh }) => {
        api.set('testMeshID', mesh);
        assert(!!mesh);
      })
  ));
  it('GET /meshes/:id should return the mesh meta', () => (
    request(api)
      .get(`/meshes/${api.get('testMeshID')}`)
      .expect(200)
      .then(({ body: { bg, fps, title } }) => {
        assert(bg === testMesh.bg);
        assert(fps === testMesh.fps);
        assert(title === testMesh.title);
      })
  ));
  it('GET /meshes/:id/texture should return the mesh texture', () => (
    request(api)
      .get(`/meshes/${api.get('testMeshID')}/texture`)
      .expect(200)
      .then(({ body: texture }) => {
        assert(texture.equals(testMesh.texture));
      })
  ));
});

describe('List user meshes', () => {
  it('GET /user/:id/meshes/:page should return a list of meshes', () => (
    request(api)
      .get(`/user/${api.get('testUserID')}/meshes/0`)
      .expect(200)
      .then(({ body: { meshes, pages } }) => {
        assert(meshes.length === 1 && pages === 1);
        assert(meshes[0]._id === api.get('testMeshID'));
      })
  ));
});

describe('List latest meshes', () => {
  it('GET /meshes/latest/:page should return a list of meshes', () => (
    request(api)
      .get('/meshes/latest/0')
      .expect(200)
      .then(({ body: { meshes, pages } }) => {
        assert(meshes.length === 1 && pages === 1);
        assert(meshes[0]._id === api.get('testMeshID'));
      })
  ));
});
