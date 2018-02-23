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

/* POST user's status for existing idea. */
router.post('/:id/vote', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  Idea.upvoteIdea(req.params.id, req.body.amount, req.user, (err, result) => {
    if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
    else res.status(200).json({code: 200, status: 'success', data: {result: result}});
  });
});

/* POST user's status for existing idea. */
router.post('/:id/distribute', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  Idea.distributeKonfettiForIdea(req.params.id, req.body, req.user, (err, result) => {
    if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
    else res.status(200).json({code: 200, status: 'success', data: {result: result}});
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


module.exports = router;