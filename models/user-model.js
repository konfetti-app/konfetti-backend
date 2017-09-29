const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'user'
  },
  name: {
    first: String,
    last: String
  },
  username: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  password: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  email: String,
  //   parentOrganisation: {type: mongoose.Schema.Types.ObjectId,
  // 	  ref: 'Organisation'
  //   },
  isAdmin: {
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

UserSchema.statics.addUser = function(data, callback) {
  const User = mongoose.model('User');
  let user = new User({
    username : data.username,
    password : genHashedPassword(data.password),
    name : data.name
  }).save((err, user) => {
    if (err) console.log(err);
    // console.log(`hashedPassword: ${genHashedPassword(data.password)}`);
    callback(err, user);
  });
};

mongoose.model('User', UserSchema);
