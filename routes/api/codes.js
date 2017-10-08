const express = require('express');
const router = express.Router();
const passport = require('passport');
const formatError = require('../../helpers/errors.js').formatError;

const mongoose = require('mongoose');
const Code = mongoose.model('Code');

/*
    api routes

    authenticate via basic auth against /api/authenticate and receive a JWT

    afterwards, call endpoints with JWT in Header ("Authorization" : "Bearer <token>")
    Also see supplied postman collection in /stuff/ for how to construct the Authorization Header
*/

/* POST create new code(s) */
router.post('/', passport.authenticate('jwt', { session: false }), function(req, res, next) {

    // TODO: who is allowed to do this? Better do this in models?
    //       should this route be unprotected / should there be a second unprotected route?

    // if (req.user.isAdmin) {
        Code.createCode(req.body, req.user, (err, result) => {
        if (err) res.status(500).json({code: 500, status: 'error', errors: [formatError(err)]});
        else res.status(201).json({code: 201, status: 'created', data: {result}});
        });
    // } else {
    //     res.status(403).json({code: 403, status: 'error', errors: ['not allowed.']})
    // }
});

/* POST redeam code */
router.post('/:token', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    // console.log('processing token: '+ req.params.token);
    Code.redeamCode(req.params.token, req.user || null, (err, result) => {
        if (err) res.status(500).json({code: 500, status: 'error', errors: [formatError(err)]});
        else res.status(200).json({code: 200, status: 'ok', data: {result}});
    });
});

/* POST redeam code (anonymous) */
router.post('/:token/anonymous', function(req, res, next) {
    console.log('processing token (anonymous): '+ req.params.token);
    Code.redeamCode(req.params.token, null, (err, result) => {
        if (err) {
            res.status(500).json({code: 500, status: 'error', errors: [formatError(err)]});
        } else if (result.user) {
            res.status(201).json({code: 201, status: 'created', data: result});
        } else {
            res.status(200).json({code: 200, status: 'ok', data: result});
        }
    });
});

/* GET neigbourhood listing via token auth. */
router.get('/', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    // console.log(req.body);
    Neighbourhood.getAllNeighbourhoods((err, neighbourhoods) => {
      if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
      else res.status(200).json({code: 200, status: 'success', data: {neighbourhoods: neighbourhoods}});
    })
});

module.exports = router;
