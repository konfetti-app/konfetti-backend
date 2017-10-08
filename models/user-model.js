const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const moment = require('moment');
const shortid = require('shortid');

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
  spokenLanguages: { // ['de', 'en', 'ar']
    type: Array,
    default: []
  },
  preferredLanguage: { // e.g.: 'en'
    type: String
  } ,
  lastSeen: { // timestamp
    type: Number,
    default: moment(new Date).unix(),
  },
  created: { // timestamp
    type: Number,
    default: moment(new Date).unix(),
  },
  push: { // Array of Strings
    tokens: []
  },
  passwordReset: { // wann? // resetcode?

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
  }).save((err, user) => {
    if (err) console.log(err);
    // console.log(`hashedPassword: ${genHashedPassword(data.password)}`);
    callback(err, user);
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
