const express = require('express');
const router = express.Router();
const passport = require('passport');

const mongoose = require('mongoose');
const Neighbourhood = mongoose.model('Neighbourhood');

/*
    api routes

    authenticate via basic auth against /api/authenticate and receive a JWT

    afterwards, call endpoints with JWT in Header ("Authorization" : "Bearer <token>")
    Also see supplied postman collection in /stuff/ for how to construct the Authorization Header
*/

module.exports = router;
