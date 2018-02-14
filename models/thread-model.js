const mongoose = require('mongoose');
const moment = require('moment');

const ThreadSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'thread' // also: 'newsfeed', 'idea'
    },
    title: {
        type: String
        // ,
        // unique: true,
        // index: true
    },
    meta: {
        type: {} // TODO: type-specific data
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
        type : data.type,
        parentNeighbourhood : data.parentNeighbourhood,
        created: {byUser : user._id},
      }).save((err, thread) => {
          if (data.parentNeighbourhood) {
            Neighbourhood.findOneAndUpdate({_id: data.parentNeighbourhood}, {$addToSet:{threads: thread._id}}, {upsert: true}, (err, doc) => {
                if (err) {
                console.log(err);
                } else {
                    console.log(`added thread ${thread._id} to neighbourhood ${doc ? doc._id + 'to neighbourhood' : ''}`);
                callback(undefined, thread);
                }
            });
          } else {
            callback(undefined, thread);
          }
        
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

ThreadSchema.statics.getThreadById = function (threadId, callback) {
    const Thread = mongoose.model('Thread');
    Thread.findOne({_id: threadId}).populate('assets').exec(function (err, res) {
        if (err) console.log(err);
        callback(err, res);
      });
};

ThreadSchema.statics.getNewsfeed = function (user, callback) {
    const Thread = mongoose.model('Thread');
    // console.log(user._id);
    Thread.findOne({type: 'newsfeed', 'created.byUser': user._id}).populate({path: 'posts', options: {where: {disabled: false}, sort: {'created.date': -1}, limit: 100}}).exec(function (err, res) {
        if (err) console.log(err);
        // console.log(err, res);
        callback(err, res);
      });
};

ThreadSchema.statics.getNewsfeedByNeighbourhood = function (neighbourhoodId, user, callback) {
    const Thread = mongoose.model('Thread');
    console.log(user._id, neighbourhoodId);
    Thread.findOne({type: 'newsfeed', 'created.byUser': user._id}).populate({path: 'posts', match: {disabled: false, 'meta.neighbourhood': neighbourhoodId}, options: {sort: {'created.date': -1}, limit: 100}}).exec(function (err, res) {

    if (err) console.log(err);
        // console.log(err, res);
        callback(err, res);
      });
};

mongoose.model('Thread', ThreadSchema);