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

// defaults
const UPLOAD_PATH = 'uploads';
const AVATAR_IMAGE_SIZE = 768; // scaling target for avatar images (single value is width, X * X is witdth * hight)
const OTHER_IMAGE_SIZE = 768; // scaling target for other images (single value is width, X * X is witdth * hight)

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

function isImage (file) {
  // console.log(JSON.stringify(file));
  let ext = path.extname(file.originalname);
  if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') { // accept only images
    fs.unlink(`${UPLOAD_PATH}/temp/${file.filename}`, (err) => {
      if (err) throw err;
      console.log(`successfully deleted not processed due to invalid extesion: ${UPLOAD_PATH}/temp/${file.filename}`);
    });
    return false;
  } else {
    return true;
  }
}

router.post('/avatar', upload.single('avatar'), passport.authenticate('jwt', { session: false }), function (req, res, next) {
  // console.log('storing new asset:' + JSON.stringify(req.file));
  if (!req.file || !isImage(req.file)) {
    res.status(500).json({code: 500, status: 'error', errors: [formatError('Please supply an image file.')]});
  } else {
    sharp(`${UPLOAD_PATH}/temp/${req.file.filename}`).resize(AVATAR_IMAGE_SIZE).toFile(`${UPLOAD_PATH}/${req.file.filename}`)
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
      fs.unlink(`${UPLOAD_PATH}/temp/${req.file.filename}`, (err) => {
        if (err) throw err;
        console.log(`successfully deleted file after exeption: ${UPLOAD_PATH}/temp/${req.file.filename}`);
      });
      console.log(reason);
      res.status(500).json({code: 500, status: 'error', errors: [formatError(reason)]});
    });
  }
});

router.post('/image', upload.single('image'), passport.authenticate('jwt', { session: false }), function (req, res, next) {
  // console.log('storing new asset:' + JSON.stringify(req.file));
  if (!req.file || !isImage(req.file)) {
    res.status(500).json({code: 500, status: 'error', errors: [formatError('Please supply an image file.')]});
  } else {
    sharp(`${UPLOAD_PATH}/temp/${req.file.filename}`).resize(OTHER_IMAGE_SIZE).toFile(`${UPLOAD_PATH}/${req.file.filename}`)
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
      fs.unlink(`${UPLOAD_PATH}/temp/${req.file.filename}`, (err) => {
        if (err) throw err;
        console.log(`successfully deleted file after exeption: ${UPLOAD_PATH}/temp/${req.file.filename}`);
      });
      console.log(reason);
      res.status(500).json({code: 500, status: 'error', errors: [formatError(reason)]});
    });
  }
});


module.exports = router;