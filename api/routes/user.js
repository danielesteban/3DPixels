const { body, param, validationResult } = require('express-validator/check');
const User = require('../models/user');

module.exports.create = [
  body('email')
    .isEmail()
    .normalizeEmail(),
  body('name')
    .not().isEmpty()
    .isLength({ min: 1, max: 25 })
    .trim()
    .escape(),
  body('password')
    .not().isEmpty()
    .trim()
    .escape(),
  (req, res) => {
    if (!validationResult(req).isEmpty()) {
      res.status(422).end();
    }
    const user = new User({
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
    });
    user.save()
      .then(() => res.json(user.issueToken()))
      .catch(() => res.status(500).end());
  },
];

module.exports.get = [
  param('id').isMongoId(),
  (req, res) => {
    if (!validationResult(req).isEmpty()) {
      res.status(422).end();
      return;
    }
    User
      .findById(req.params.id)
      .select('name createdAt')
      .exec((err, mesh) => {
        if (err || !mesh) {
          res.status(err ? 500 : 404).end();
          return;
        }
        res.json(mesh);
      });
  },
];

module.exports.login = [
  body('email')
    .isEmail()
    .normalizeEmail(),
  body('password')
    .not().isEmpty()
    .trim()
    .escape(),
  (req, res) => {
    if (!validationResult(req).isEmpty()) {
      res.status(422).end();
    }
    User
      .findOne({ email: req.body.email }, (err, user) => {
        if (err || !user) {
          res.status(err ? 500 : 401).end();
          return;
        }
        user.comparePassword(req.body.password, (err, isMatch) => {
          if (err || !isMatch) {
            res.status(err ? 500 : 401).end();
            return;
          }
          res.json(user.issueToken());
        });
      });
  },
];
