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
      return;
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
      .then((user) => {
        if (!user) {
          res.status(404).end();
          return;
        }
        res.json(user);
      })
      .catch(() => res.status(500).end());
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
      return;
    }
    User
      .findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          return res.status(401).end();
        }
        return user
          .comparePassword(req.body.password)
          .then((isMatch) => {
            if (!isMatch) {
              res.status(401).end();
              return;
            }
            res.json(user.issueToken());
          });
      })
      .catch(() => res.status(500).end());
  },
];

module.exports.refreshToken = (req, res) => {
  res.json(req.user.issueToken());
};
