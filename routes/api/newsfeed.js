const express = require('express');
const router = express.Router();
const passport = require('passport');
const formatError = require('../../helpers/errors.js').formatError;

const mongoose = require('mongoose');
const Thread = mongoose.model('Thread');
const Post = mongoose.model('Post');

/*
    api routes

    authenticate via basic auth against /api/authenticate and receive a JWT

    afterwards, call endpoints with JWT in Header ("Authorization" : "Bearer <token>")
    Also see supplied postman collection in /stuff/ for how to construct the Authorization Header
*/

/* POST create new wsfeeditem (DEBUG). */ //createNewsfeedEntry = function (title, message, user, callback)
if (process.env.NODE_ENV === 'development') {
  router.post('/', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    Post.createNewsfeedEntry(req.body, req.user, 'notification', null, (err, post) => {
      if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
      else res.status(201).json({code: 201, status: 'success', data: {post: post}});
    });
  });
}

/* DELETE item in newsfeed for current user. */
router.delete('/:postId', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  Post.deletePost(req.params.postId, req.user, (err, post) => {
    if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
    else res.status(200).json({code: 200, status: 'success', data: {post: post}});
  });
});

/* GET newsfeed for current user. */
router.get('/', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    // console.log(req.body);
    Thread.getNewsfeed(req.user, (err, newsfeed) => {
      if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
      else res.status(200).json({code: 200, status: 'success', data: {newsfeed: newsfeed}});
    });
});

router.get('/neighbourhood/:id', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  // console.log(req.body);
  Thread.getNewsfeedByNeighbourhood(req.params.id, req.user, (err, newsfeed) => {
    if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
    else res.status(200).json({code: 200, status: 'success', data: {newsfeed: newsfeed}});
  });
});

module.exports = router;