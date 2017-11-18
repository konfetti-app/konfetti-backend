const mongoose = require('mongoose');
const moment = require('moment');

const ThreadSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'thread'
    },
    title: {
        type: String
        // ,
        // unique: true,
        // index: true
    },
    parentNeighbourhood: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Neighbourhood'  
    },
    // members: [{ // Array of members for this neighbourhood
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User'  
    // }],
    posts: [{ // Array of posts (items in this thread)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'  
    }],
    assets: [{ // Array of assets (items in this thread)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset'  
    }],
    disabled: {
        type: Boolean,
        default: false
    },
    approved: {
        state: {
            type: Boolean, // needs to be validated in connectino with neighbourhoods approval-config (TBD, TODO)
            default: false
        },
        date: {
            type: Number, // TODO: map approval states (not defined yet)
            default: moment(new Date).unix()
        },
        byUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
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
    }
});

ThreadSchema.statics.createThread = function (data, user, callback) {
    console.log(`creating new tread ${JSON.stringify(data)} for user ${JSON.stringify(user._id)}`);
    const Thread = mongoose.model('Thread');
    const Neighbourhood = mongoose.model('Neighbourhood');
    let thread = new Thread({
        title : data.title,
        parentNeighbourhood : data.parentNeighbourhood,
        created: {byUser : user._id},
      }).save((err, thread) => {
        Neighbourhood.findOneAndUpdate({_id: data.parentNeighbourhood}, {$addToSet:{threads: thread._id}}, {upsert: true}, (err, doc) => {
                    if (err) console.log(err);
                    console.log(`added thread ${thread._id} to neighbourhood ${doc._id}`);
                    callback(err, thread);
                  });

    //     if (err) console.log(err);
    //     
      });
};

ThreadSchema.statics.addNewPostToThread = function (user, threadId, content, callback) {
    const Thread = mongoose.model('Thread');
    const Post = mongoose.model('Post');
    const User = mongoose.model('User');
    // Add user to neighbourhood - TODO: currently does not check if already member of this neighbourhood but does not add duplicates
    Thread.findOneAndUpdate({_id: threadId}, {$addToSet:{posts: user._id}}, {upsert: true}, (err, doc) => {
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

mongoose.model('Thread', ThreadSchema);