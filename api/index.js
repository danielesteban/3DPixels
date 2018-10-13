const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const multer = require('multer');
const nocache = require('nocache');

const setupExpress = () => {
  const api = express();
  api.set('port', process.env.PORT || 8081);
  api.set('multer', multer({
    storage: multer.memoryStorage(),
  }));

  if (process.env.NODE_ENV === 'production') {
    api.use(helmet());
  } else {
    api.use(nocache());
  }
  api.use(compression());
  api.use(cors());
  api.use(bodyParser.json());
  return api;
};

const setupMongoose = () => {
  const connectMongoose = () => {
    mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost/3dpixels',
      { useNewUrlParser: true },
      err => (err && console.log(err))
    );
  };
  mongoose.Promise = global.Promise;
  mongoose.set('useCreateIndex', true);
  mongoose.connection.on('error', console.error);
  mongoose.connection.on('disconnected', connectMongoose);
  connectMongoose();
};

const setupRoutes = require('./routes');

const api = setupExpress();
setupMongoose();
setupRoutes(api);
api.listen(api.get('port'), () => {
  console.log(`API server listening on port ${api.get('port')}`);
});
