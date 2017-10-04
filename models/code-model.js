const mongoose = require('mongoose');

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
        index: true
    },
    creator: { // user who created the code
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  
    },
    actionType: { // ['neighbour', 'reviewer', 'admin'] respect to neighbourhoods

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


mongoose.model('Code', CodeSchema);
