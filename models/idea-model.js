const mongoose = require('mongoose');
const moment = require('moment');

const IdeaSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'idea'
    },
    title: {
        type: String
    },
    description: {
        type: String,
    },
    address: {
        type: String
    },
    geoData: { // differs from template to be closer to Neighbourhood
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
    date: {
        type: Date
    },
    wantsHelper: {
        type: Boolean
    },
    helpDescription: {
        type: String
    },
    wantsGuest: {
        type: Boolean
    },
    reviewStatus: {
        type: String // allowed: 'WAIT', 'OK', 'REJECTED'
    },
    konfettiTotal: {
        type: Number
    },
    // konfettiUser // ? field is unclear.
    context: {
        type: String,
        index: true
    },
    parentNeighbourhood: { // reference to parentNeighbourhood
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Neighbourhood'  
    },
    helpers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  
    }],
    guests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  
    }],
    subscribers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  
    }],
    // konfettiSpent: [{ // TODO: not implemented yet
    //     byUser: { // Array of members in this channel
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'User'  
    //     },
    //     amount: {
    //         type: Number
    //     }
    // }],
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
});


IdeaSchema.statics.createIdea = function (data, user, callback) {
    const Idea = mongoose.model('Idea');
    // console.log(JSON.stringify(data));
    let now = moment(new Date).unix();
    let newIdea= new Idea({
        title : data.title,
        parentNeighbourhood: data.parentNeighbourhood,
        geoData: data.geoData,
        date: data.date,
        address: data.address,
        wantsHelper: data.wantsHelper,
        wantsGuest: data.wantsGuest,
        description: data.description,
        helpDescription: data.helpDescription,
        created : {
            date: now,
            byUser: user._id
        }
    }).save((err, doc) => {
        if (err) {
        console.log('Error saving new chat: ' + err.message);
        callback(err, undefined);
        } else {
        callback(undefined, doc);
        }
    });
};

IdeaSchema.statics.updateIdea = function (ideaId, data, user, callback) {
    const Idea = mongoose.model('Idea');
    // console.log(JSON.stringify(data));
    // let now = moment(new Date).unix();

    Idea.findOne({_id : ideaId}).exec((err, idea) => {
        return new Promise((resolve, reject) => {
        idea.title = data.title || idea.title;
        idea.parentNeighbourhood = data.parentNeighbourhood || idea.parentNeighbourhood;
        idea.geoData = data.geoData || idea.geoData;
        idea.date = data.date || idea.date;
        idea.address = data.address || idea.address;
        idea.wantsHelper = data.wantsHelper;
        idea.wantsGuest = data.wantsGuest;
        idea.description = data.description || idea.description;
        idea.helpDescription = data.helpDescription || idea.helpDescription;
        idea.save((err, savedIdea) => {
            if (err) {
                reject(err);
            } else {
                resolve(idea);
            }
        });
    })
    .then(savedIdea => {callback(null, savedIdea);})
    .catch(reason => {callback(reason, null);});
    });
};

IdeaSchema.statics.getIdeas = function (params, callback) {

    // TODO: remove Messages from results

    const Idea = mongoose.model('Idea');
    Idea.find({context: params.context, parentNeighbourhood: params.parentNeighbourhood, disabled: false}).populate({path: 'created.byUser', select: 'nickname avatar', populate: {path: 'avatar', select: 'filename'}}).exec(function (err, res) {
        if (err) console.log(err);
        callback(err, res);
    });
};

IdeaSchema.statics.getChatById = function (chatId, callback) {
    const Idea = mongoose.model('Idea');
    Idea.findOne({_id: chatId}).exec(function (err, res) {
        if (err) console.log(err);
        callback(err, res);
    });
};

// IdeaSchema.statics.createIdea = function (channelName, userId, callback) {
//     const Idea = mongoose.model('Idea');
//     Idea.findOne({name: channelName})
//     .then((channel) => {
//         if (!channel) {
//             console.log('channelName not found. creating new channelName: ' + channelName);
//             let now = moment(new Date).unix();
//             let newChat = new Idea({
//                 name : channelName,
//                 created : {
//                     date: now,
//                     byUser: userId
//                 }
//             }).save((err, doc) => {
//               if (err) {
//                 console.log('Error saving new chat: ' + err.message);
//                 callback(err, undefined);
//               } else {
//                 callback(undefined, doc);
//               }
//             });
//     } else { // channel is already present
//         callback(undefined, callback);
//     }
//   });
// };

IdeaSchema.statics.getChatMessagesSince = function (channel, since, user, callback) {
    const ChatMessage = mongoose.model('ChatMessage');
    const Idea = mongoose.model('Idea');
    ChatMessage.find({parentChannel: channel, date : { $gt: since }}).limit(500).sort('date').populate({path: 'parentUser', select: 'nickname avatar', populate: {path: 'avatar', select: 'filename'}}).then(chatMessages => {
        Idea.findOne({_id: channel}).select('subscribers').then(result =>{
            // console.log('result:', JSON.stringify(result));
            callback(null, chatMessages, result.subscribers.indexOf(user._id) > -1 ? true : false);
        });
    });
};

IdeaSchema.statics.deleteIdea = function (channel, user, callback) {
    const Idea = mongoose.model('Idea');
    Idea.findOne({_id: channel}).populate({path: 'created.byUser'}).then(idea => {
        if (idea.created.byUser.equals(user) || user.isAdmin) {
            idea.disabled = true;
            idea.save((err, doc) => {
                if (err) {
                    console.log('Error deleting idea: ' + err.message);
                    callback(err, undefined);
                } else {
                    console.log(`deleted idea ${doc._id} on behalf of user ${user._id}`);
                    callback(undefined, doc);
                }
            });
        } else {
            callback('You are not allowed to delete this Channel', undefined);
        }
    });
};

// IdeaSchema.statics.createIdea = function (data, user, callback) {
//     const Idea = mongoose.model('Idea');

//     let now = moment(new Date).unix();
//     let newChat = new Idea({
//         // name : data.name,
//         // parentNeighbourhood: data.parentNeighbourhood,
//         // context: data.context,
//         description: data.description,
//         created : {
//             date: now,
//             byUser: user._id
//         }
//     }).save((err, doc) => {
//         if (err) {
//         console.log('Error saving new chat: ' + err.message);
//         callback(err, undefined);
//         } else {
//         callback(undefined, doc);
//         }
//     });
// };

IdeaSchema.statics.subscribe = function (body, user, callback) { // requires body.ideaId
    const Idea = mongoose.model('Idea');
    if (body.id && user._id) {
        Idea.findOneAndUpdate({_id: body.id}, {$addToSet:{subscribers: user._id}}, {upsert: true, new: true}, (err, subscriptions) => {
            if (err) {
                console.log(err);
                callback(err, undefined);
            } else {
                console.log(`subscribed user ${user._id} to idea ${body.id}`);
                callback(err, 'subscribed');
            }
        });
    } else {
        callback('invalid input', undefined);
    }
};

IdeaSchema.statics.unsubscribe = function (someId, user, callback) { // requires body.ideaId
    const Idea = mongoose.model('Idea');
    if (someId && user._id) {
        Idea.findOneAndUpdate({_id: someId}, {$pull:{subscribers: user._id}}, {upsert: true, new: true},
            (err, subscriptions) => {
                if (err) {
                    console.log(err);
                    callback(err, undefined);
                } else {
                    console.log(`unsubscribed ${user._id} from channel ${someId}`);
                    callback(undefined, 'unsubscribed');
                }
            });
    } else {
        callback('invalid input', undefined);
    }
};


mongoose.model('Idea', IdeaSchema);