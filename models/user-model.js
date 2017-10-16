const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const moment = require('moment');
const shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_');

const UserSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'user'
  },
  name: {
    first: String,
    last: String
  },
  username: { // should this be a globally valid email-address?
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  password: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  spokenLanguages: { // ['de', 'en', 'ar']
    type: Array,
    default: []
  },
  preferredLanguage: { // e.g.: 'en'
    type: String
  } ,
  lastSeen: { // timestamp
    type: Number,
    default: undefined,
  },
  created: { // timestamp
    type: Number,
    default: moment(new Date).unix(),
  },
  push: { // Array of Strings
    tokens: []
  },
  passwordReset: {
    type: String
  },
  neighbourhoods: [{ // Array of neighbourhoods
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Neighbourhood'   
  }],
  isAdmin: { // system level
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

UserSchema.statics.updateUserData = function (userId, data, callback) {
  const User = mongoose.model('User');
  // name, username, profileImage (store), language-settings, ...
  // notification-preferences
  // profileImage is _id in /assets (to be protected somehow) // TODO : image-store (fs)
  User.findOne({_id: userId}).exec((err, user) => {
    if (err) console.log(err);
    user.username = data.username;
    user.preferredLanguage = data.preferredLanguage;
    user.spokenLanguages = data.spokenLanguages;
    user.description = data.description;
    if (data.password) user.password = genHashedPassword(data.password);
    user.save((err, savedUser) => {
      if (err) console.log(err);
      callback(err, savedUser);
    });
  });
}

function randomValueBase64 (len) {
  return crypto.randomBytes(Math.ceil(len * 3 / 4))
      .toString('base64')   // convert to base64 format
      .slice(0, len)        // return required number of characters
      .replace(/\+/g, '0')  // replace '+' with '0'
      .replace(/\//g, '0'); // replace '/' with '0'
}

UserSchema.statics.triggerPasswordReset = function (userId, data, callback) {
  const User = mongoose.model('User');
  User.findOne({_id: userId}).exec((err, user) => {
    if (err) console.log(err);
    user.passwordReset = randomValueBase64(36);
    user.save((err, savedUser) => {
      if (err) console.log(err);
      callback(err, null); // dont return a user here (unauthenticated route).
    });
  });
}
UserSchema.statics.setPassword = function (magicKey, data, callback) {
  const User = mongoose.model('User');
  User.findOne({passwordReset: magicKey}).exec((err, user) => {
    if (err) console.log(err);
    if (user) {
      user.passwordReset = undefined;
      user.password = genHashedPassword(data.password);
      user.save((err, savedUser) => {
        if (err) console.log(err);
        callback(err, null); // dont return a user here (unauthenticated route).
      });
    } else {
      callback('not found', null);
    }

  });
}

function genHashedPassword (clearPassword) {
  let salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(clearPassword, salt);
  return hash;
}

UserSchema.statics.addUser = function (data, callback) {
  const User = mongoose.model('User');
  let now = moment(new Date).unix();
  let user = new User({
    username : data.username ? data.username : 'konfettiUser-' + shortid.generate(),
    password : data.password ? genHashedPassword(data.password) : genHashedPassword(now.toString()), //If we create an anonymous user (i.e. no password provided), the password is the timestamp of creation.
    name : data.name,
    created : now
  }).save((err, doc) => {
    if (err) console.log(err);
    callback(err, doc);
  });
};

UserSchema.statics.getSingleUser = function (username, callback) {
  const User = mongoose.model('User');
  User.findOne({username: username}).populate('neighbourhoods').exec(function (err, user) {
    if (err) console.log(err);
    callback(err, user);
  });
}

UserSchema.statics.getAllUsers = function (callback) {
  const User = mongoose.model('User');
  User.find().exec(function (err, users) {
    if (err) console.log(err);
    callback(err, users);
  });
}

mongoose.model('User', UserSchema);
