process.env.NODE_ENV = 'test';
const assert = require('assert');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const request = require('supertest');
const api = require('../');

const testUser = {
  email: 'test@test.com',
  name: 'test',
  password: '1234',
};

describe('Create a user', () => {
  before(done => (
    mongoose.connection.once('connected', done)
  ));
  it('PUT /user without params should return a 422', () => (
    request(api)
      .put('/user')
      .expect(422)
  ));
  it('PUT /user should return a session token', () => (
    request(api)
      .put('/user')
      .send({
        email: testUser.email,
        name: testUser.name,
        password: testUser.password,
      })
      .expect(200)
      .then(({ body: token }) => {
        api.set('testUserToken', token);
        return jwt.decode(token);
      })
      .then((session) => {
        assert(session.name === testUser.name);
        api.set('testUserID', session._id);
      })
  ));
});

describe('Profile', () => {
  it('GET /user/:id with a bad id should return a 422', () => (
    request(api)
      .get('/user/badid')
      .expect(422)
  ));
  it('GET /user/:id with an unknown id should return a 404', () => (
    request(api)
      .get('/user/000000000000000000000000')
      .expect(404)
  ));
  it('GET /user/:id should return the user meta', () => (
    request(api)
      .get(`/user/${api.get('testUserID')}`)
      .expect(200)
      .then(({ body: user }) => {
        assert(user._id === api.get('testUserID'));
        assert(user.name === testUser.name);
      })
  ));
});

describe('Sessions', () => {
  it('POST /user without params should return a 422', () => (
    request(api)
      .post('/user')
      .expect(422)
  ));
  it('POST /user should return a session token', () => (
    request(api)
      .post('/user')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200)
      .then(({ body: token }) => jwt.decode(token))
      .then((session) => {
        assert(session._id === api.get('testUserID'));
        assert(session.name === testUser.name);
      })
  ));
  it('GET  /user without a token should return a 401', () => (
    request(api)
      .get('/user')
      .expect(401)
  ));
  it('GET  /user should return a session token', () => (
    request(api)
      .get('/user')
      .set('Authorization', `Bearer ${api.get('testUserToken')}`)
      .expect(200)
      .then(({ body: token }) => jwt.decode(token))
      .then((session) => {
        assert(session._id === api.get('testUserID'));
        assert(session.name === testUser.name);
      })
  ));
});
