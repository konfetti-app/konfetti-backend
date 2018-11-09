const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const jwt = require('../../helpers/jwt');
const formatError = require('../../helpers/errors.js').formatError;

/*
    api routes

    authenticate via basic auth against /api/authenticate and receive a JWT

    afterwards, call endpoints with JWT in Header ("Authorization" : "Bearer <token>")
    Also see supplied postman collection in /stuff/ for how to construct the Authorization Header
*/

router.post('/', passport.authenticate('basic', { session: false }), function(req, res, next) {
  // console.log(req.body);
  jwt.issueToken(req.user)
  .then(token => {
    res.status(200).json({code: 200, status: 'success', data: {token: token}});
  })
  .catch(err => {
    console.log(`auth error: ${req.body.username}`);
    res.status(500).json({code: 500, status: 'error', errors: [{err}]});
  });
});

module.exports = router;
