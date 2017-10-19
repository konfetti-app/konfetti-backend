const mongoose = require('mongoose');
const moment = require('moment');

const NeighbourhoodSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'neighbourhood'
    },
    name: {
        type: String,
        unique: true,
        index: true
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
    reviewLevel: { // TODO: define review model

    },
    geoData: {
        longitude: {
            type: Number
        },
        latitude: {
            type: Number
        },
        radius: {
            type: Number
        }

    },
    activeModules: { // Array of Strings, special features on this neighbourhood
        type: []
    }
});

NeighbourhoodSchema.post('save', function(doc) { // TODO propably also triggers on property update
    // also add new Neighbourhood to User.neighbourhoods (creator)
    const User = mongoose.model('User');
    User.findOneAndUpdate({_id: doc.created.byUser}, {$push:{neighbourhoods: doc._id}}, {upsert: true},
        function(err, user){
            if (err) console.log(err);
            console.log(`added new neighbourhood ${doc._id} to user ${user._id}`);
        });   
});

NeighbourhoodSchema.statics.createNeighbourhood = function (data, user, callback) {
    console.log(`creating new neighbourhood ${JSON.stringify(data)} for user ${JSON.stringify(user)}`);
    const Neighbourhood = mongoose.model('Neighbourhood');
    let neighbourhood = new Neighbourhood({
        name : data.name,
        admins : [user._id],
        members : [user._id],
        reviewers : [user._id],
        created: {byUser : user._id},
        activeModules: data.activeModules || [], // TODO define and validate
        geoData: data.geoData
      }).save((err, result) => {
        if (err) console.log(err);
        callback(err, result);
      });
};

NeighbourhoodSchema.statics.getAllNeighbourhoods = function (callback) {
    const Neighbourhood = mongoose.model('Neighbourhood');
    Neighbourhood.find().exec(function (err, res) {
        if (err) console.log(err);
        callback(err, res);
      });
};

NeighbourhoodSchema.statics.addNeighbour = function (user, neighbourhoodId, callback) {
    const Neighbourhood = mongoose.model('Neighbourhood');
    const User = mongoose.model('User');
    // Add user to neighbourhood - TODO: currently does not check if already member of this neighbourhood but does not add duplicates
    Neighbourhood.findOneAndUpdate({_id: neighbourhoodId}, {$addToSet:{members: user._id}}, {upsert: true}, (err, doc) => {
        if (err) console.log(err);
        console.log(`added user ${user._id} to neighbourhood ${doc._id}`);
        // Add neighbourhood to user
        User.findOneAndUpdate({_id: user._id}, {$addToSet:{neighbourhoods: doc._id}}, {upsert: true},
            (err, user) => {
                if (err) console.log(err);
                console.log(`added neighbourhood ${neighbourhoodId} to user ${user._id}`);
                callback(err, user);
            });
        
      });
};


mongoose.model('Neighbourhood', NeighbourhoodSchema);
