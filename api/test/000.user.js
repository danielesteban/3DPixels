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

describe('Create user', () => {
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

describe('User Sign-In', () => {
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
});
