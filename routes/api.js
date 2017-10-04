const express = require('express');
const router = express.Router();

/*
    api routes

    authenticate via basic auth against /api/authenticate and receive a JWT

    afterwards, call endpoints with JWT in Header ("Authorization" : "Bearer <token>")
    Also see supplied postman collection in /stuff/ for how to construct the Authorization Header
*/

// This file does nothing more than mounting all files in ./api/ as routes according to their name.

const fs = require('fs');
fs.readdirSync(__dirname+'/api').forEach(function(file) {
  console.log('Loading api-route: ' +file)
  let name = file.substr(0, file.indexOf('.'));
  router.use('/' + name, require('./api/' + file));
});

module.exports = router