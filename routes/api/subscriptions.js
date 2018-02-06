const express = require('express');
const router = express.Router();
const passport = require('passport');
const formatError = require('../../helpers/errors.js').formatError;

const mongoose = require('mongoose');
const ChatChannel = mongoose.model('ChatChannel');

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
        ChatChannel.subscribe(req.body, req.user, (err, subscription) => {
            if (err) res.status(500).json({code: 500, status: 'error', errors: [formatError(err)]});
            else res.status(200).json({code: 200, status: 'ok', data: {subscription}});
        });
    // } else {
    //     res.status(403).json({code: 403, status: 'error', errors: ['not allowed to subscribe to this channel']});
    // }
});

router.delete('/:id', passport.authenticate('jwt', { session: false }), function(req, res, next) {
        ChatChannel.unsubscribe(req.params.id, req.user, (err, subscription) => {
            if (err) res.status(500).json({code: 500, status: 'error', errors: [formatError(err)]});
            else res.status(200).json({code: 200, status: 'ok', data: {subscription}});
        });
});


module.exports = router;
