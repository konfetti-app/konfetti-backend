const express = require('express');
const router = express.Router();
const passport = require('passport');
const formatError = require('../../helpers/errors.js').formatError;

const mongoose = require('mongoose');
const Subscriptions = mongoose.model('Subscriptions');

/*
    api routes

    authenticate via basic auth against /api/authenticate and receive a JWT

    afterwards, call endpoints with JWT in Header ("Authorization" : "Bearer <token>")
    Also see supplied postman collection in /stuff/ for how to construct the Authorization Header
*/

/* POST subscribe to channel. */
router.post('/', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    // console.log(req.body);
    // if (req.user.isAdmin) {
        Subscriptions.subscribe(req.body, req.user, (err, subscriptions) => {
            if (err) res.status(500).json({code: 500, status: 'error', errors: [formatError(err)]});
            else res.status(200).json({code: 200, status: 'ok', data: {subscriptions: subscriptions}});
        });
    // } else {
    //     res.status(403).json({code: 403, status: 'error', errors: ['not allowed to subscribe to this channel']});
    // }
});

router.delete('/:id', passport.authenticate('jwt', { session: false }), function(req, res, next) {
        Subscriptions.unsubscribe(req.params.id, req.user, (err, subscriptions) => {
            if (err) res.status(500).json({code: 500, status: 'error', errors: [formatError(err)]});
            else res.status(200).json({code: 200, status: 'ok', data: {subscriptions: subscriptions}});
        });
});

/* GET subscriptions for current user. */
router.get('/', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    // console.log(req.body);
    Subscriptions.getSubscriptionsForUser(req.user, (err, subscriptions) => {
      if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
      else res.status(200).json({code: 200, status: 'success', data: {subscriptions: subscriptions}});
    });
});


module.exports = router;
