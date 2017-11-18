const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const formatError = require('../../helpers/errors.js').formatError;

const mongoose = require('mongoose');
const Asset = mongoose.model('Asset');

const UPLOAD_PATH = 'uploads';

const upload = multer({ dest: `${UPLOAD_PATH}/` }); // multer configuration

// TODO: resize images. currently accepts 4MB everywhere.

router.post('/avatar', upload.single('avatar'), passport.authenticate('jwt', { session: false }), function (req, res, next) {
    Asset.createAvatarAsset(req.body, req.file, req.user, (err, asset) => {
      if (err) res.status(500).json({code: 500, status: 'error', errors: [formatError(err)]});
      else res.status(201).json({code: 201, status: 'created', data: {asset: asset}});
    });
  });

router.post('/image', upload.single('image'), passport.authenticate('jwt', { session: false }), function (req, res, next) {
  console.log(JSON.stringify(req.body));
  console.log('filezise:' + JSON.stringify(req.file));
  Asset.createAsset(req.body, req.file, req.user, (err, asset) => {
    if (err) res.status(500).json({code: 500, status: 'error', errors: [formatError(err)]});
    else res.status(201).json({code: 201, status: 'created', data: {asset: asset}});
  });
});


module.exports = router;