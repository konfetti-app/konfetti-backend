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
    // admins: [{ // Array of admins for this neighbourhood
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User'  
    // }],
    // members: [{ // Array of members for this neighbourhood
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User'  
    // }],
    posts: [{ // Array of posts (items in this thread)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'  
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
            type: Number,
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