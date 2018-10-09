const { param, body, validationResult } = require('express-validator/check');
const Mesh = require('../models/mesh');

const validateMeshPayload = [
  body('bg').isNumeric(),
  body('fps').isNumeric(),
  body('title')
    .not().isEmpty()
    .isLength({ min: 1, max: 25 })
    .trim()
    .escape(),
  (req, res, next) => {
    if (
      !validationResult(req).isEmpty()
      || !req.file
      || !req.file.buffer
      || req.file.mimetype.indexOf('image/png') !== 0
    ) {
      res.status(422).end();
    } else {
      next();
    }
  },
];

module.exports.create = [
  validateMeshPayload,
  (req, res) => {
    const mesh = new Mesh({
      creator: req.user._id,
      bg: req.body.bg,
      fps: req.body.fps,
      texture: req.file.buffer,
      title: req.body.title,
    });
    mesh.save((err) => {
      if (err) {
        res.status(500).end();
        return;
      }
      res.json(mesh._id);
    });
  },
];

module.exports.update = [
  param('id').isMongoId(),
  validateMeshPayload,
  (req, res) => {
    Mesh
      .findOne({
        _id: req.params.id,
        creator: req.user._id,
      }, (err, mesh) => {
        if (err || !mesh) {
          res.status(err ? 500 : 404).end();
          return;
        }
        mesh.bg = req.body.bg;
        mesh.fps = req.body.fps;
        mesh.texture = req.file.buffer;
        mesh.title = req.body.title;
        mesh.save(err => (
          res.status(err ? 500 : 200).end()
        ));
      });
  },
];

module.exports.get = [
  param('id').isMongoId(),
  (req, res) => {
    if (!validationResult(req).isEmpty()) {
      res.status(422).end();
      return;
    }
    Mesh
      .findById(req.params.id)
      .select('creator bg fps title')
      .populate('creator', 'name')
      .exec((err, mesh) => {
        if (err || !mesh) {
          res.status(err ? 500 : 404).end();
          return;
        }
        res.json(mesh);
      });
  },
];

module.exports.getTexture = [
  param('id').isMongoId(),
  (req, res) => {
    if (!validationResult(req).isEmpty()) {
      res.status(422).end();
      return;
    }
    Mesh.findById(req.params.id, 'texture', (err, mesh) => {
      if (err || !mesh) {
        res.status(err ? 500 : 404).end();
        return;
      }
      res
        .type('image/png')
        .send(mesh.texture);
    });
  },
];

module.exports.list = (req, res) => {
  Mesh
    .find()
    .select('creator bg fps title')
    .populate('creator', 'name')
    .sort('-createdAt')
    .limit(12)
    .exec((err, meshes) => {
      if (err) {
        res.status(500).end();
        return;
      }
      res.json(meshes);
    });
};
