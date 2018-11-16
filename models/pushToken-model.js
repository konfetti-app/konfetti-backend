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
    bindingType: { // The type of the Binding. This determines the transport technology to use. Allowed values: apn, fcm, gcm, sms, and facebook-messenger
        type: String,
        required: true
    },
    address: { // The address specific to the channel. For APNS it is the device token. For FCM and GCM it is the registration token. For SMS it is a phone number in E.164 format. For Facebook Messenger it is the Messenger ID of the user or a phone number in E.164 format.
        type: String,
        required: true
    },
    identity: { // The Identity to which this Binding belongs to. Identity is defined by your application. Up to 20 Bindings can be created for the same Identity in a given Service.
        type: String,
        required: true,
        index: true,
        unique: true
    },
    lastUsed: { // timestamp
      type: Number,
      default: undefined,
    },
    lastUpdated: { // timestamp of last update
      type: Number,
      default: moment(new Date).unix(),
    }
  });
  
  PushTokenSchema.statics.updateTokenForUser = function (user, data, callback) {
    const PushToken = mongoose.model('PushToken');
    const User = mongoose.model('User');
    PushToken.findOne({identity: data.identity}).exec((err, token) => {
        if (token) { // we have this playerId already
            token.lastReveived = moment(new Date).unix();
            callback(undefined, token);
        } else { // playerId is new - save it.
            let newToken = new PushToken({
                bindingType : data.bindingType,
                address : data.address,
                identity : user._id,
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