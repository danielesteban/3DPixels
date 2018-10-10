const meshes = require('./meshes');
const user = require('./user');
const User = require('../models/user');

const requireAuth = (req, res, next) => {
  if (req.headers.authorization) {
    const header = req.headers.authorization.split(' ');
    if (
      header[0] === 'Bearer'
      && header[1]
    ) {
      User.fromToken(header[1], (err, user) => {
        if (err || !user) {
          res.status(err ? 500 : 401).end();
          return;
        }
        req.user = user;
        next();
      });
      return;
    }
  }
  res.status(401).end();
};

module.exports = (api) => {
  // Meshes
  api.put(
    '/meshes',
    requireAuth,
    api.get('multer').single('texture'),
    meshes.create
  );

  api.put(
    '/meshes/:id',
    requireAuth,
    api.get('multer').single('texture'),
    meshes.update
  );

  api.get(
    '/meshes',
    meshes.listAll
  );

  api.get(
    '/meshes/:id',
    meshes.get
  );

  api.get(
    '/meshes/:id/texture',
    meshes.getTexture
  );

  // User
  api.put(
    '/user',
    user.create
  );

  api.post(
    '/user',
    user.login
  );

  api.get(
    '/user/:id',
    user.get
  );

  api.get(
    '/user/:id/meshes',
    meshes.listByCreator
  );
};
