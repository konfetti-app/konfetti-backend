const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('../helpers/jwt');

const mongoose = require('mongoose');
const User = mongoose.model('User');

/*
    api routes

    authenticate via basic auth against /api/authenticate and receive a JWT

    afterwards, call endpoints with JWT in Header ("Authorization" : "Bearer <token>")
    Also see supplied postman collection in /stuff/ for how to construct the Authorization Header
*/


/* GET users listing via token auth. */
router.get('/users', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  console.log(req.body);
  User.getAllUsers((err, users) => {
    if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
    else res.status(200).json({code: 200, status: 'success', data: {users: users}});
  })
});

/* POST authenticate. */
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
