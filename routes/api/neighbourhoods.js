const express = require('express');
const router = express.Router();
const passport = require('passport');
const formatError = require('../../helpers/errors.js').formatError;

const mongoose = require('mongoose');
const Neighbourhood = mongoose.model('Neighbourhood');

/*
    api routes

    authenticate via basic auth against /api/authenticate and receive a JWT

    afterwards, call endpoints with JWT in Header ("Authorization" : "Bearer <token>")
    Also see supplied postman collection in /stuff/ for how to construct the Authorization Header
*/

/* POST create new neigbourhood. */
router.post('/', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    // console.log(req.body);
    if (req.user.isAdmin) {
        Neighbourhood.createNeighbourhood(req.body, req.user, (err, neighbourhood) => {
        if (err) res.status(500).json({code: 500, status: 'error', errors: [formatError(err)]});
        else res.status(201).json({code: 201, status: 'created', data: {neighbourhood: neighbourhood}});
        });
    } else {
        res.status(403).json({code: 403, status: 'error', errors: ['not allowed to create new neighbourhoods']});
    }
});

/* GET neigbourhood listing via token auth. */
router.get('/', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    // console.log(req.body);
    Neighbourhood.getAllNeighbourhoods((err, neighbourhoods) => {
      if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
      else res.status(200).json({code: 200, status: 'success', data: {neighbourhoods: neighbourhoods}});
    });
  });

module.exports = router;
