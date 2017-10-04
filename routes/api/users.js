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


/* GET users listing via token auth. */
router.get('/', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  console.log(req.body);
  User.getAllUsers((err, users) => {
    if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
    else res.status(200).json({code: 200, status: 'success', data: {users: users}});
  })
});

/* GET single user with populated neighbourhoods via token auth. */
router.get('/:username', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  console.log(req.body);
  if (req.params.username === req.user.username || req.user.isAdmin) { // only the logged in user or a sys-admin may get his full user object
    // console.log('congrats! same user.');
    User.getSingleUser(req.params.username, (err, user) => {
      if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
      else res.status(200).json({code: 200, status: 'success', data: {users: user}});
    });
  } else {
    res.status(403).json({code: 403, status: 'error', errors: ['not allowed.']})
  }
  
});

module.exports = router;
