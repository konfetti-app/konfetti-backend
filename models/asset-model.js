const mongoose = require('mongoose');
const moment = require('moment');

const AssetSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'asset'
    },
    mimetype: {
        type: String
    },
    size: {
        type: Number
    },
    width: {
        type: Number
    },
    height: {
        type: Number
    },
    fieldname: {
        type: String,
    },
    originalname: {
        type: String,
    },
    filename: {
        type: String,
        default: '',
        index: true
    },
    parentUser: { // reference to parentUser if one (for avatars only)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  
    },
    parentNeighbourhood: { // reference to parentNeighbourhood if one
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Neighbourhood'  
    },
    parentThread: { // reference to parentThread if one
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Thread'  
    },
    parentPost: { // reference to parentThread if one
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'  
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

AssetSchema.statics.createAsset = function (data, file, user, callback) {
    const Asset = mongoose.model('Asset');
    const Post = mongoose.model('Post');
    const Thread = mongoose.model('Thread');
    const Neighbourhood = mongoose.model('Neighbourhood');
    let now = moment(new Date).unix();
    let newAsset = new Asset({
      content : {
          title: data.title || '',
          text: data.text || ''
      },
      parentPost : data.parentPost && data.parentPost.length > 0 ? data.parentPost : undefined,
      parentThread : data. parentThread && data.parentThread.length > 0 ? data.parentThread : undefined,
      parentNeighbourhood : data.parentNeighbourhood && data.parentNeighbourhood.length > 0 ? data.parentNeighbourhood : undefined,
      created : {
          date: now,
          byUser: user._id
      },
      mimetype: file.original.mimetype,
      filename: file.original.filename,
      size: file.resized.size,
      fieldname: file.original.fieldname,
      originalname: file.original.originalname,
      height: file.resized.height,
      width: file.resized.width
    }).save((err, doc) => {
      if (err) {
        console.log('Error saving new asset: ' + err.message);
        callback(err, undefined);
      } else {
        if (data.parentThread && data.parentThread.length > 0) {
            Thread.findOneAndUpdate({_id: data.parentThread}, {$addToSet:{assets: doc._id}}, {upsert: true}, (err, thread) => {
                if (err) console.log(err);
                if (!thread) {
                    return callback('parentTread not found', null);
                } else {
                    console.log(`added asset ${doc._id} to thread ${thread ? thread._id : undefined}`);
                    // callback(err, doc);
                }
            });
        }
        if (data.parentNeighbourhood && data.parentNeighbourhood.length > 0) {
            console.log('data.parentNeighbourhood:'+data.parentNeighbourhood);
            Neighbourhood.findOneAndUpdate({_id: data.parentNeighbourhood}, {$addToSet:{assets: doc._id}}, {upsert: true}, (err, neighbourhood) => {
                if (err) console.log(err);
                if (!neighbourhood) {
                    return callback('parentNeighbourhood not found', null);
                } else {
                    console.log(`added asset ${doc._id} to neighbourhood ${neighbourhood ? neighbourhood._id : undefined}`);
                    // callback(err, doc);
                }
            });
        }
        if (data.parentPost && data.parentPost.length > 0) {
            console.log('data.parentPost:'+data.parentPost);
            Post.findOneAndUpdate({_id: data.parentPost}, {$addToSet:{assets: doc._id}}, {upsert: true}, (err, post) => {
                if (err) console.log(err);
                if (!post) {
                    return callback('parentPost not found', null);
                } else {
                    console.log(`added asset ${doc._id} to post ${post ? post._id : undefined}`);
                    // callback(err, doc);
                }
            });
        }
        callback(err, doc);
      }
    });
  };

  AssetSchema.statics.createAvatarAsset = function (data, file, user, callback) {
    const Asset = mongoose.model('Asset');
    const User = mongoose.model('User');
    let now = moment(new Date).unix();
    let newAsset = new Asset({
      content : {
          title: data.title || '',
          text: data.text || ''
      },
      parentUser : user._id,
      created : {
          date: now,
          byUser: user._id
      },
      mimetype: file.original.mimetype,
      filename: file.original.filename,
      size: file.resized.size,
      fieldname: file.original.fieldname,
      originalname: file.original.originalname,
      height: file.resized.height,
      width: file.resized.width
    }).save((err, doc) => {
      if (err) {
        console.log('Error saving new asset: ' + err.message);
        callback(err, undefined);
      } else {
        if (user) {
            User.findOneAndUpdate({_id: user._id}, {$set:{avatar: doc._id}},  (err, user) => {
                if (err) console.log(err);
                if (!user) {
                    return callback('user not found', null);
                } else {
                    console.log(`updated avatar ${doc._id} for user ${user ? user._id : undefined}`);
                    // callback(err, doc);
                }
            });
        }
        callback(err, doc);
      }
    });
  };

mongoose.model('Asset', AssetSchema);