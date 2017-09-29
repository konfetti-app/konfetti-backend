const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('../helpers/jwt');
const formatError = require('../helpers/errors.js').formatError;


const mongoose = require('mongoose');
const User = mongoose.model('User');

/* GET users listing. */
router.get('/', passport.authenticate('basic', { session: false }), function(req, res, next) {
  User.find().exec(function (err, users) {
    if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
    else res.status(200).json({code: 200, status: 'success', data: {users: users}});
  });
});

/* GET users listing via token auth. */
router.get('/listJWT', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  console.log(req.body);
  User.find().exec(function (err, users) {
    if (err) res.status(500).json({code: 500, status: 'error', errors: [formatError(err)]});
    else res.status(200).json({code: 200, status: 'success', data: {users: users}});
  });
});

/* POST create new user. */
router.post('/add', function(req, res, next) {
  // console.log(req.body);
  User.addUser(req.body, (err, result) => {
    if (err) res.status(500).json({code: 500, status: 'error', errors: [formatError(err)]});
    else res.status(201).json({code: 201, status: 'created', data: {result}});
  });

});

/* POST get new token. */
router.post('/authenticate', passport.authenticate('basic', { session: false }), function(req, res, next) {
  // console.log(req.body);
  jwt.issueToken(req.user.username)
  .then(token => {
    res.status(200).json({code: 200, status: 'success', data: {token: token}});
  })
  .catch(err => {
    console.log(`auth error: ${req.body.username}`);
    res.status(500).json({code: 500, status: 'error', errors: [{err}]});
  });
});

module.exports = router;
