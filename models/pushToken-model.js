const mongoose = require('mongoose');
const moment = require('moment');

const PushTokenSchema = new mongoose.Schema({
    type: {
      type: String,
      default: 'pushToken'
    },
    parentUser: { // reference to parentUser
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    playerId: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    lastUsed: { // timestamp
      type: Number,
      default: undefined,
    },
    lastReveived: { // timestamp
      type: Number,
      default: moment(new Date).unix(),
    }
  });
  
  PushTokenSchema.statics.updateTokenForUser = function (user, data, callback) {
    const PushToken = mongoose.model('PushToken');
    const User = mongoose.model('User');
    PushToken.findOne({playerId: data.playerId}).exec((err, token) => {
        if (token) { // we have this playerId already
            token.lastReveived = moment(new Date).unix();
            callback(undefined, token);
        } else { // playerId is new - save it.
            let newToken = new PushToken({
                playerId : data.playerId,
                parentUser : user._id
              }).save((err, doc) => {
                User.findOneAndUpdate({_id: user._id}, {$addToSet: {pushTokens: doc._id}}, {upsert: true, new: true}, (err, user) => {
                    if (err) {
                        console.log(err);
                        callback(err, undefined);
                    } else {
                        console.log(`added playerId ${doc.playerId} to user ${user._id}`);
                        callback(err, doc);
                    }
                });
            });
        }
    });
  };

  mongoose.model('PushToken', PushTokenSchema);