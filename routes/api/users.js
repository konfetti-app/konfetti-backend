const express = require('express');
const router = express.Router();
const passport = require('passport');
const formatError = require('../../helpers/errors.js').formatError;

const mongoose = require('mongoose');
const User = mongoose.model('User');

/*
    api routes

    authenticate via basic auth against /api/authenticate and receive a JWT

    afterwards, call endpoints with JWT in Header ("Authorization" : "Bearer <token>")
    Also see supplied postman collection in /stuff/ for how to construct the Authorization Header
*/

/* POST users update profile via token auth. */
router.post('/:userId', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  if (req.user._id.toString() === req.params.userId) {
    User.updateUserData(req.params.userId, req.body, (err, user) => {
      if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
      else res.status(200).json({code: 200, status: 'success', data: {user: user}});
    });
  } else {
    res.status(500).json({code: 500, status: 'error', errors: ['not allowed.']});
  } 
});

/* GET trigger user password reset. (not authenticated) */
router.get('/:email/resetPassword', function(req, res, next) {
    User.triggerPasswordReset(req.params.email, req.body, (err, user) => {
      if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
      else res.status(200).json({code: 200, status: 'success'});
    });
});

/* POST set a password via /api/users/resetPassword/:magicKey (sent to user by email; stored in User object.) */
router.post('/resetPassword/:magicKey', function(req, res, next) {
  User.setPassword(req.params.magicKey, req.body, (err, user) => {
    if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
    else res.status(200).json({code: 200, status: 'success'});
  });
});

/* GET users listing via token auth. */
router.get('/', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  console.log(req.body);
  User.getAllUsers((err, users) => {
    if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
    else res.status(200).json({code: 200, status: 'success', data: {users: users}});
  });
});

/* GET single user with populated neighbourhoods (trimmed to user perspective) via token auth. */
router.get('/:username', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  console.log(req.body);
  if (req.params.username === req.user.username || req.user.isAdmin) { // only the logged in user or a sys-admin may get his full user object
    // console.log('congrats! same user.');
    User.getSingleUser(req.params.username, (err, user) => {
      if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
      else res.status(200).json({code: 200, status: 'success', data: {user: user}});
    });
  } else {
    res.status(403).json({code: 403, status: 'error', errors: ['not allowed.']});
  }
  
});

module.exports = router;
