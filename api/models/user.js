const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const API_SECRET = process.env.API_SECRET || 'superunsecuresecret';
if (
  process.env.NODE_ENV === 'production'
  && API_SECRET === 'superunsecuresecret'
) {
  console.warn('\nSecurity warning:\nYou must provide a random API_SECRET.\n');
}

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    index: true,
    unique: true,
  },
  name: String,
  password: String,
}, { timestamps: true });

UserSchema.pre('save', function onSave(next) {
  const user = this;
  if (!user.isModified('password')) return next();
  return bcrypt.genSalt(5, (err, salt) => {
    if (err) return next(err);
    return bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      return next();
    });
  });
});

UserSchema.methods = {
  comparePassword(candidatePassword) {
    const user = this;
    return new Promise((resolve, reject) => (
      bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(isMatch);
      })
    ));
  },
  issueToken() {
    return jwt.sign(
      {
        _id: this._id,
        name: this.name,
      },
      API_SECRET,
      { expiresIn: '24h' }
    );
  },
};

UserSchema.statics = {
  fromToken(token) {
    const User = this;
    return new Promise((resolve, reject) => (
      jwt.verify(token, API_SECRET, (err, decoded) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(User.findById(decoded._id));
      })
    ));
  },
};

module.exports = mongoose.model('User', UserSchema);
