const express = require('express');
const router = express.Router();
const passport = require('passport');

const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const fs = require('fs');

const formatError = require('../../helpers/errors.js').formatError;
const path = require('path');

const mongoose = require('mongoose');
const Asset = mongoose.model('Asset');

const UPLOAD_PATH = 'uploads';

const storage = multer.diskStorage({
  destination: `${UPLOAD_PATH}/temp/`,
  // fileFilter: function (req, file, callback) {
  //   let ext = path.extname(file.originalname);
  //   if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') { // accept only images
  //       return callback(new Error('Only images are allowed'));
  //   }
  //   callback(null, true);
  // },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, (err, raw) =>{
      if (err) return cb(err);
      cb(null, file.fieldname + '-' + raw.toString('hex') + path.extname(file.originalname));
    });
  }
});

const upload = multer({ storage: storage });

router.post('/avatar', upload.single('avatar'), passport.authenticate('jwt', { session: false }), function (req, res, next) {
  // console.log('storing new asset:' + JSON.stringify(req.file));
  let ext = path.extname(req.file.originalname);
  if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') { // accept only images
    res.status(500).json({code: 500, status: 'error', errors: [formatError('Only images are allowed.')]});
  } else {
    sharp(`${UPLOAD_PATH}/temp/${req.file.filename}`).resize(768).toFile(`${UPLOAD_PATH}/${req.file.filename}`)
    .then(resized => {
      fs.unlink(`${UPLOAD_PATH}/temp/${req.file.filename}`, (err) => {
        if (err) throw err;
        // console.log(`successfully deleted: ${UPLOAD_PATH}/temp/${req.file.filename}`);
      });
      Asset.createAvatarAsset(req.body, {original: req.file, resized: resized}, req.user, (err, asset) => {
        if (err) res.status(500).json({code: 500, status: 'error', errors: [formatError(err)]});
        else res.status(201).json({code: 201, status: 'created', data: {asset: asset}});
      });
      // console.log(resized);
    })
    .catch(reason => {
      console.log(reason);
      res.status(500).json({code: 500, status: 'error', errors: [formatError(reason)]});
    });
  }
});

router.post('/image', upload.single('image'), passport.authenticate('jwt', { session: false }), function (req, res, next) {
  // console.log('storing new asset:' + JSON.stringify(req.file));
  let ext = path.extname(req.file.originalname);
  if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') { // accept only images
    res.status(500).json({code: 500, status: 'error', errors: [formatError('Only images are allowed.')]});
  } else {
    sharp(`${UPLOAD_PATH}/temp/${req.file.filename}`).resize(768).toFile(`${UPLOAD_PATH}/${req.file.filename}`)
    .then(resized => {
      fs.unlink(`${UPLOAD_PATH}/temp/${req.file.filename}`, (err) => {
        if (err) throw err;
        // console.log(`successfully deleted: ${UPLOAD_PATH}/temp/${req.file.filename}`);
      });
      Asset.createAvatarAsset(req.body, {original: req.file, resized: resized}, req.user, (err, asset) => {
        if (err) res.status(500).json({code: 500, status: 'error', errors: [formatError(err)]});
        else res.status(201).json({code: 201, status: 'created', data: {asset: asset}});
      });
      // console.log(resized);
    })
    .catch(reason => {
      console.log(reason);
      res.status(500).json({code: 500, status: 'error', errors: [formatError(reason)]});
    });
  }
});


module.exports = router;