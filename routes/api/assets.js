const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const formatError = require('../../helpers/errors.js').formatError;

const mongoose = require('mongoose');

const UPLOAD_PATH = 'uploads';

const upload = multer({ dest: `${UPLOAD_PATH}/` }); // multer configuration

router.post('/avatar', upload.single('avatar'), passport.authenticate('jwt', { session: false }), function (req, res, next) {
    console.log(JSON.stringify(req.body));
    console.log(`setting avatar for user ${req.user.username}: ${JSON.stringify(req.file)}`);
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    // if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
    // else 
    res.status(201).json({code: 201, status: 'success', data: {asset: JSON.stringify(req.file)}});
  });

router.post('/', upload.single('image'), function (req, res, next) {
console.log(JSON.stringify(req.body));
console.log('filezise:' + JSON.stringify(req.file));
// req.file is the `avatar` file
// req.body will hold the text fields, if there were any
// if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
// else 
res.status(201).json({code: 201, status: 'success', data: {asset: 'JSON.stringify(req.file)'}});
});

// Servied via static
// router.get('/avatar/:id', passport.authenticate('jwt', { session: false }), function (req, res, next) {
// res.status(201).json({code: 201, status: 'success', data: {asset: JSON.stringify(req.file)}});
// });


module.exports = router;