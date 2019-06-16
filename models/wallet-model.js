const mongoose = require('mongoose');
const moment = require('moment');

const mubsub = require('mubsub');
// const pushHelper = require('../helpers/push.js');
const mubsubClient = mubsub(`mongodb://${process.env.RUNS_IN_DOCKER ? 'mongo' : 'localhost'}/konfetti-mubsub`);

const WalletSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'wallet'
    },
    amount: {
        type: Number,
        default: 0
    },
    // assets: [{ // Array of assets (items linked to this wallet)
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Asset'
    // }],
    parentUser: { // reference to parentUser
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    parentNeighbourhood: { // reference to parentUser
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Neighbourhood'
    }
});



WalletSchema.statics.createWalletWithBalance = function (data, userId, callback) {
    // const Idea = mongoose.model('Idea');
    const Wallet = mongoose.model('Wallet');
    // console.log(JSON.stringify(data));
    // let now = moment(new Date).unix();
    let newWallet= new Wallet({
        title : data.title,
        parentNeighbourhood: data.parentNeighbourhood,
        parentUser: data.parentUser,
        amount: data.amount
    }).save((err, doc) => {
        if (err) {
        console.log('Error saving new wallet: ' + err.message);
        callback(err, undefined);
        } else {
        callback(undefined, doc);
        }
    });
};
mongoose.model('Wallet', WalletSchema);
