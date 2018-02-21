const express = require('express');
const router = express.Router();
const passport = require('passport');
const formatError = require('../../helpers/errors.js').formatError;

const mongoose = require('mongoose');
const Idea = mongoose.model('Idea');

/*
    api routes

    authenticate via basic auth against /api/authenticate and receive a JWT

    afterwards, call endpoints with JWT in Header ("Authorization" : "Bearer <token>")
    Also see supplied postman collection in /stuff/ for how to construct the Authorization Header
*/

/* POST create a new idea. */
router.post('/', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  Idea.createIdea(req.body, req.user, (err, idea) => {
    if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
    else res.status(201).json({code: 201, status: 'success', data: {idea: idea}});
  });
});

/* POST update existing idea. */
router.post('/:id', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  Idea.updateIdea(req.params.id, req.body, req.user, (err, idea) => {
    if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
    else res.status(200).json({code: 200, status: 'success', data: {idea: idea}});
  });
});

router.delete('/:id', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  Idea.deleteIdea(req.params.id, req.user, (err, idea) => {
    if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
    else res.status(200).json({code: 200, status: 'success', data: {idea: idea}});
  });
});

/* POST user's status for existing idea. */
router.post('/:id/status', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  Idea.updateIdeaStatus(req.params.id, req.body, req.user, (err, status) => {
    if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
    else res.status(200).json({code: 200, status: 'success', data: {status: status}});
  });
});

/* GET ideas for neighbourhood. */
router.get('/neighbourhood/:id', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    // console.log(req.body);
    Idea.getIdeasForNeighbourhood(req.params.id, req.user, (err, modifiedIdeas) => {
      if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
      else res.status(200).json({code: 200, status: 'success', data: {ideas: modifiedIdeas}});
    });
});

// /* GET chatMessages since timestamp for channel. */
// router.get('/channel/:chatChannelId/since/:since', passport.authenticate('jwt', { session: false }), function(req, res, next) {
//   // if no timestamp -> get all. result is array of ChatMessages.
//   // console.log(req.body);
//   ChatChannel.getChatMessagesSince(req.params.chatChannelId, req.params.since, req.user, (err, chatMessages, subscribed) => {
//     if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
//     else res.status(200).json({code: 200, status: 'success', data: {chatMessages: chatMessages, subscribed: subscribed}});
//   });
// });

// /* POST subscribe to channel. */
// router.post('/subscriptions', passport.authenticate('jwt', { session: false }), function(req, res, next) {
//   console.log(req.body);
//   // if (req.user.isAdmin) {
//       ChatChannel.subscribe(req.body, req.user, (err, subscription) => {
//           if (err) res.status(500).json({code: 500, status: 'error', errors: [formatError(err)]});
//           else res.status(200).json({code: 200, status: 'ok', data: {subscription}});
//       });
//   // } else {
//   //     res.status(403).json({code: 403, status: 'error', errors: ['not allowed to subscribe to this channel']});
//   // }
// });
// /* DELETE unsubscribe from channel */
// router.delete('/subscriptions/:id', passport.authenticate('jwt', { session: false }), function(req, res, next) {
//       ChatChannel.unsubscribe(req.params.id, req.user, (err, subscription) => {
//           if (err) res.status(500).json({code: 500, status: 'error', errors: [formatError(err)]});
//           else res.status(200).json({code: 200, status: 'ok', data: {subscription}});
//       });
// });


module.exports = router;