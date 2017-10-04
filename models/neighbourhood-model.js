const mongoose = require('mongoose');

const NeighbourhoodSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'neighbourhood'
    },
    name: {
        type: String
    },
    admins: [{ // Array of admins for this neighbourhood
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  
    }],
    members: [{ // Array of members for this neighbourhood
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  
    }],
    reviewers: [{ // Array of reviewers for this neighbourhood
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  
    }],
    disabled: {
        type: Boolean,
        default: false
    },
    reviewLevel: { // TODO: define review model

    },
    geoData: { // TODO: define geodata model

    },
    activeModules: { // special features on this neighbourhood

    }

});


mongoose.model('Neighbourhood', NeighbourhoodSchema);
