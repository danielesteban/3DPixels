const { body, param, validationResult } = require('express-validator/check');
const imageSize = require('image-size');
const Mesh = require('../models/mesh');

const SIZE = process.env.SIZE || 64;

const validateMeshPayload = [
  body('bg').isNumeric().toInt(),
  body('fps').isNumeric().toInt(),
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
      return;
    }
    next();
  },
  (req, res, next) => {
    try {
      const meta = imageSize(req.file.buffer);
      if (
        meta.type !== 'png'
        || !meta.width
        || (meta.width % SIZE) !== 0
        || meta.height !== SIZE
      ) {
        throw new Error();
      }
    } catch (e) {
      res.status(422).end();
      return;
    }
    next();
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
    mesh.save()
      .then(() => res.json(mesh._id))
      .catch(() => res.status(500).end());
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
      })
      .then((mesh) => {
        if (!mesh) {
          return res.status(404).end();
        }
        mesh.bg = req.body.bg;
        mesh.fps = req.body.fps;
        mesh.texture = req.file.buffer;
        mesh.title = req.body.title;
        return mesh
          .save()
          .then(() => res.status(200).end());
      })
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
    Mesh
      .findById(req.params.id)
      .select('createdAt creator bg fps title')
      .populate('creator', 'name')
      .then((mesh) => {
        if (!mesh) {
          res.status(404).end();
          return;
        }
        res.json(mesh);
      })
      .catch(() => res.status(500).end());
  },
];

module.exports.getTexture = [
  param('id').isMongoId(),
  (req, res) => {
    if (!validationResult(req).isEmpty()) {
      res.status(422).end();
      return;
    }
    Mesh
      .findById(req.params.id)
      .select('texture updatedAt')
      .then((mesh) => {
        if (!mesh) {
          res.status(404).end();
          return;
        }
        const lastModified = mesh.updatedAt.toUTCString();
        if (req.get('if-modified-since') === lastModified) {
          res.status(304).end();
          return;
        }
        res
          .set('Cache-Control', 'must-revalidate')
          .set('Content-Length', mesh.texture.byteLength)
          .set('Content-Type', 'image/png')
          .set('Last-Modified', lastModified)
          .send(mesh.texture);
      })
      .catch(() => res.status(500).end());
  },
];

const pageSize = 8;
const list = (req, res, selector) => {
  Promise.all([
    Mesh
      .find(selector)
      .countDocuments(),
    Mesh
      .find(selector)
      .select('creator bg fps title')
      .populate('creator', 'name')
      .sort('-createdAt')
      .skip(req.params.page * pageSize)
      .limit(pageSize),
  ])
    .then(([count, meshes]) => {
      res.json({
        meshes,
        pages: Math.ceil(count / pageSize),
      });
    })
    .catch(() => res.status(500).end());
};

module.exports.listAll = [
  param('page').isNumeric().toInt(),
  (req, res) => {
    if (!validationResult(req).isEmpty()) {
      res.status(422).end();
      return;
    }
    list(req, res);
  },
];

module.exports.listByCreator = [
  param('id').isMongoId(),
  param('page').isNumeric().toInt(),
  (req, res) => {
    if (!validationResult(req).isEmpty()) {
      res.status(422).end();
      return;
    }
    list(req, res, { creator: req.params.id });
  },
];
