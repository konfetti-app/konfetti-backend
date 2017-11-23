const express = require('express');
const router = express.Router();
const passport = require('passport');
const formatError = require('../../helpers/errors.js').formatError;

const mongoose = require('mongoose');
const Thread = mongoose.model('Thread');

/*
    api routes

    authenticate via basic auth against /api/authenticate and receive a JWT

    afterwards, call endpoints with JWT in Header ("Authorization" : "Bearer <token>")
    Also see supplied postman collection in /stuff/ for how to construct the Authorization Header
*/

/* POST create new thread within a neigbourhood. */
router.post('/', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    // console.log(req.body);
    if (req.body.parentNeighbourhood) {
        Thread.createThread(req.body, req.user, (err, thread) => {
        if (err) res.status(500).json({code: 500, status: 'error', errors: [formatError(err)]});
        else res.status(201).json({code: 201, status: 'created', data: {thread: thread}});
        });
    } else {
        res.status(500).json({code: 500, status: 'error', errors: ['missing parentNeighbourhood']});
    }
});

/* GET thread by id. */
router.get('/:id', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    // console.log(req.body);
    Thread.getThreadById({_id : req.params.id}, (err, thread) => {
        if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
        else res.status(200).json({code: 200, status: 'success', data: {thread: thread}});
    });
});

/* GET all (active) threads within a neigbourhood. */
router.get('/', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    // console.log(req.body);
    Neighbourhood.getAllNeighbourhoods((err, neighbourhoods) => {
        if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
        else res.status(200).json({code: 200, status: 'success', data: {neighbourhoods: neighbourhoods}});
    });
});

module.exports = router;
