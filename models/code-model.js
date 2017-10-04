const mongoose = require('mongoose');

const CodeSchema = new mongoose.Schema({
    type: { // ['neighbour', 'reviewer', 'admin'] respect to neighbourhoods
        type: String,
        default: 'code'
    },
    neighbourhood: { // neighbourhood this code is associated with
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Neighbourhood'   
      },
    token: { // actual invite tokens
        type: String,
        index: true
    },
    creator: { // user who created the code
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  
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

CodeSchema.static.createCode = function (opts, callback) { // opts should hold: neighbourhood, (amount,) leftCount, actionType
    const Code = mongoose.model('Code');

    //     // TODO: mark code as redeamed, add user to eighbourhood, grant priviliges

}

CodeSchema.static.redeamCode = function (token, callback) {
    const Code = mongoose.model('Code');
    Code.findOne({token: token}).exec(function (err, code) {
      if (err) console.log(err);

        // TODO: mark code as redeamed, add user to eighbourhood, grant priviliges

      callback(err, result);
    });
}


mongoose.model('Code', CodeSchema);
