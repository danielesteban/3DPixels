const mongoose = require('mongoose');

const MeshSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  bg: Number,
  fps: Number,
  texture: Buffer,
  title: String,
}, { timestamps: true });

module.exports = mongoose.model('Mesh', MeshSchema);
