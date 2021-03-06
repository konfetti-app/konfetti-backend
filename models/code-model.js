const mongoose = require('mongoose');
const moment = require('moment');
const crypto = require('crypto');

const CodeSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'code'
    },
    neighbourhood: { // neighbourhood this code is associated with
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Neighbourhood'   
      },
    token: { // actual invite tokens
        type: String,
        index: true,
        unique: true
    },
    created: {
        date: {
            type: Number,
            default: moment(new Date).unix()
        },
        byUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    actionType: { // ['newNeighbour', 'newReviewer', 'newAdmin'] respect to neighbourhoods

    },
    leftCount: { // how often this code is redeemable: decreases when used, -1 is unlimited
        type: Number,
        default: 1
    },
    lastredeemed: {
        byUser: { // user who created the code
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'  
        },
        date: {
            type: Number, // timestamp of date code was used last time
        }
    }
});

CodeSchema.statics.createCode = function (data, user, callback) { // data should hold: neighbourhood, (amount,) leftCount, actionType
    const Code = mongoose.model('Code');
    // console.log(`creating new code(s) ${JSON.stringify(data)} for user ${JSON.stringify(user)}`);
    let code = new Code({
        neighbourhood : data.neighbourhood,
        token : data.token, // String (vanity!) or generate  something
        created: {byUser : user._id},
        actionType: data.actionType || '', // TODO define and validate
        leftCount: data.leftCount || 1
      }).save((err, result) => {
        if (err) console.log(err);
        callback(err, result);
      });

};

CodeSchema.statics.redeemCode = function (data, user, callback) {
    const Code = mongoose.model('Code');
    const Neighbourhood = mongoose.model('Neighbourhood');
    const User = mongoose.model('User');
    Code.findOne({token: data.token}).exec((err, code) => {
      if (err) console.log(err);
      if (!code) {
        callback('token not found', null);
      } else if (code.leftCount !== 0) { // token found and token is valid

            switch(code.actionType) {
                case 'newNeighbour':
                if (user) {
                    Neighbourhood.addNeighbour(user, code.neighbourhood, () => {
                        code.leftCount = code.leftCount -1; // decrease validation counter after redemption.
                        code.lastredeemed = {byUser: user ? user._id : undefined, date: moment(new Date).unix()};
                        code.save((err, doc) => {
                            User.findOne({_id: user._id}).populate('neighbourhoods').exec((err, user) => {
                                callback(err, {code: doc, user: user});
                            });
                        });
                    });
                } else {
                    let clearPassword = crypto.randomBytes(16).toString('hex');
                    User.addUser({password: clearPassword, body: data.body}, (err, user) => {
                        console.log(`no user, added new user ${user._id}`);
                        Neighbourhood.addNeighbour(user, code.neighbourhood, () => {
                            code.leftCount = code.leftCount -1; // decrease validation counter after redemption.
                            code.lastredeemed = {byUser: user ? user._id : undefined, date: moment(new Date).unix()};
                            code.save((err, doc) => {
                                User.findOne({_id: user._id}).populate('neighbourhoods').exec((err, user) => {
                                    callback(err, {code: doc, user: user, clearPassword: clearPassword });
                                });
                                
                            });
                        });
                    });
                }
                break;
                default:
                console.log(`*** unknown actionType while redeeming code ${code._id}`);
                callback('unknown actionType', null);
            }
            
      } else {
        callback('token is already redeemed', null);
      }
    });
};


mongoose.model('Code', CodeSchema);
