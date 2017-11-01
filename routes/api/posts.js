const express = require('express');
const router = express.Router();
const passport = require('passport');
const formatError = require('../../helpers/errors.js').formatError;

const mongoose = require('mongoose');
const Post = mongoose.model('Post');

/*
    api routes

    authenticate via basic auth against /api/authenticate and receive a JWT

    afterwards, call endpoints with JWT in Header ("Authorization" : "Bearer <token>")
    Also see supplied postman collection in /stuff/ for how to construct the Authorization Header
*/

/* POST create new post. */
router.post('/', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    // console.log(req.body);
    if (true) { // 
        Post.createPost(req.body, req.user, (err, post) => {
        if (err) res.status(500).json({code: 500, status: 'error', errors: [formatError(err)]});
        else res.status(201).json({code: 201, status: 'created', data: {post: post}});
        });
    } else {
        res.status(403).json({code: 403, status: 'error', errors: ['not allowed to create new posts']});
    }
});

/* GET a post  via token auth. */
router.get('/:postId', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    // console.log(req.body);
    Post.getPostById(req.params.postId, (err, post) => {
      if (err) res.status(500).json({code: 500, status: 'error', errors: [{err}]});
      else res.status(200).json({code: 200, status: 'success', data: {post: post}});
    });
  });

module.exports = router;
