const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const User = mongoose.model('User');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET and POST routes for password reset. */
router.get('/passwordReset/:magicKey', function(req, res, next) {
  res.render('passwordReset', { title: 'Konfetti password reset', formAction: (process.env.BASEURL || 'http://localhost:3000/passwordReset/') + req.params.magicKey, magicKey: req.params.magicKey });
});

router.post('/passwordReset/:magicKey', function(req, res, next) {
  console.log(JSON.stringify(req.body));
  User.setPassword(req.body.magicKey, req.body, function(err, result) {
    if (err) {
      console.log(err);
      res.render('index', { title: 'Password change failed!', err: err });
    } else {
      res.render('index', { title: 'Password changed!' });
    }
  });
});

module.exports = router;
