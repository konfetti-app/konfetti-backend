const mongoose = require('mongoose');
const moment = require('moment');

const PostSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'post'
    },
    // name: {
    //     type: String,
    //     unique: true,
    //     index: true
    // },
    content: { // TODO: allow events here. Probably another content-type?
        title: {
            type: String,
            default: ''
        },
        text: {
            type: String,
            default: ''
        }
    },
    meta: {
        type: Object
    },
    assets: [{ // Array of assets (items in this post)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset'  
    }],
    parentThread: { // reference to parentThread
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Thread'  
    },
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
    }
});

PostSchema.statics.getPostById = function (postId, callback) {
    const Post = mongoose.model('Post');
    Post.findOne({_id: postId}).populate('assets').exec(function (err, res) {
        if (err) console.log(err);
        callback(err, res);
      });
};

PostSchema.statics.createNewsfeedEntry = function (data, user, type, meta, callback) {
    const Post = mongoose.model('Post');
    const Thread = mongoose.model('Thread');

    let now = moment(new Date).unix();
    let newPost = new Post({
      content : {
          title: data.title || '',
          text: data.text || ''
      },
      meta: meta,
      type: type,
      parentThread : user._id,
      created : {
          date: now,
          byUser: user._id
      }
    }).save((err, doc) => {
      if (err) {
        console.log('Error saving new post: ' + err.message);
        callback(err, undefined);
      } else {
        Thread.findOneAndUpdate({type: 'newsfeed', 'created.byUser': user._id}, {$addToSet:{posts: doc._id}}, {upsert: true}, (err, thread) => {
            if (err) console.log(err);
            if (!thread) {
                callback('parenttread not found', null);
            } else {
                console.log(`added post ${doc._id} to thread ${thread ? thread._id : undefined}`);
                callback(err, doc);
            }
            });
      }
    });
  };
  
PostSchema.statics.deletePost = function (postId, user, callback) {
    const Post = mongoose.model('Post');
    Post.findOne({_id: postId},
        function(err, foundEntry){
            if (err) console.log(err);
            foundEntry.disabled = true;
            callback(err, foundEntry);
            console.log(`removed ${foundEntry._id}`);
        });
    // .then(foundEntry => {
    //     foundEntry.disabled = true;
};

PostSchema.statics.createPost = function (data, user, callback) {
    const Post = mongoose.model('Post');
    const Thread = mongoose.model('Thread');

    // TODO: check if user is allowed for neighbourhood (and thread, permisson model not yet defined)

    let now = moment(new Date).unix();
    let newPost = new Post({
      content : {
          title: data.title || '',
          text: data.text || ''
      },
      parentThread : data.parentThread,
      created : {
          date: now,
          byUser: user._id
      }
    }).save((err, doc) => {
      if (err) {
        console.log('Error saving new post: ' + err.message);
        callback(err, undefined);
      } else {
        Thread.findOneAndUpdate({_id: data.parentThread}, {$addToSet:{posts: doc._id}}, {upsert: true}, (err, thread) => {
            if (err) console.log(err);
            if (!thread) {
                callback('parenttread not found', null);
            } else {
                console.log(`added post ${doc._id} to thread ${thread ? thread._id : undefined}`);
                callback(err, doc);
            }
            });
      }
    });
  };

mongoose.model('Post', PostSchema);