const mongoose = require('mongoose');
const moment = require('moment');

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
    leftCount: { // how often this code is redeamable: decreases when used, -1 is unlimited
        type: Number,
        default: 1
    },
    lastRedeamed: {
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

}

CodeSchema.statics.redeamCode = function (token, user, callback) {
    const Code = mongoose.model('Code');
    const Neighbourhood = mongoose.model('Neighbourhood');
    Code.findOne({token: token}).exec((err, code) => {
      if (err) console.log(err);
      if (code.leftCount !== 0) { // token is valid
        code.leftCount = code.leftCount -1;
        code.lastRedeamed = {byUser: user ? user._id : undefined, date: moment(new Date).unix()}
        code.save((err, doc) => {

            // TODO: complete logic on what habbens now...
            //       first: add user to a neighbourhood 

            switch(doc.actionType) {
                case 'newNeighbour':
                if (user) {
                    Neighbourhood.addNeighbour(user, code.neighbourhood, callback(err, doc));
                } else {
                    // TODO: create user, then subscribe to neighbourhood, then return both
                    console.log('no user');
                }
                break;
                default:
                console.log(`*** unknown actionType redeaming code ${code._id}`)
            }


            
        })
      } else {
        callback('token is already redeamed', null);
      }
    });
}


mongoose.model('Code', CodeSchema);
