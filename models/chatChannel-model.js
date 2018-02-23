const mongoose = require('mongoose');
const moment = require('moment');

const ChatChannelSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'chatChannel'
    },
    name: {
        type: String,
        index: true,
    },
    description: {
        type: String,
    },
    context: {
        type: String,
        index: true
    },
    parentNeighbourhood: { // reference to parentNeighbourhood
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Neighbourhood'  
    },
    parentIdea: { // reference to parentIdea, if any
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Idea'  
    },
    chatMessages: [{ // Array of messages (items in this channel)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatMessage'  
    }],
    members: [{ // Array of members in this channel
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  
    }],
    subscribers: [{ // Array of members in this channel
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  
    }],
    disabled: { // not clear how to manage this yet
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

ChatChannelSchema.statics.getChatChannels = function (params, callback) {

    // TODO: remove Messages from results

    const ChatChannel = mongoose.model('ChatChannel');
    ChatChannel.find({context: params.context, parentNeighbourhood: params.parentNeighbourhood, disabled: false}).populate({path: 'created.byUser', select: 'nickname avatar', populate: {path: 'avatar', select: 'filename'}}).exec(function (err, res) {
        if (err) console.log(err);
        callback(err, res);
    });
};

ChatChannelSchema.statics.getChatChannelById = function (chatChannelId, callback) {
    const ChatChannel = mongoose.model('ChatChannel');
    ChatChannel.find({_id: chatChannelId}).exec(function (err, chatChannels) {
        if (err) console.log(err);
        callback(err, chatChannels);
    });
};

// ChatChannelSchema.statics.createChatChannel = function (channelName, userId, callback) {
//     const ChatChannel = mongoose.model('ChatChannel');
//     ChatChannel.findOne({name: channelName})
//     .then((channel) => {
//         if (!channel) {
//             console.log('channelName not found. creating new channelName: ' + channelName);
//             let now = moment(new Date).unix();
//             let newChat = new ChatChannel({
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

ChatChannelSchema.statics.getChatMessagesSince = function (channel, since, user, callback) {
    const ChatMessage = mongoose.model('ChatMessage');
    const ChatChannel = mongoose.model('ChatChannel');
    ChatMessage.find({parentChannel: channel, date : { $gt: since }}).limit(500).sort('date').populate({path: 'parentUser', select: 'nickname avatar', populate: {path: 'avatar', select: 'filename'}}).then(chatMessages => {
        ChatChannel.findOne({_id: channel}).select('subscribers').then(result =>{
            // console.log('result:', JSON.stringify(result));
            callback(null, chatMessages, result.subscribers.indexOf(user._id) > -1 ? true : false);
        });
    });
};

ChatChannelSchema.statics.deleteChatChannel = function (channel, user, callback) {
    const ChatChannel = mongoose.model('ChatChannel');
    ChatChannel.findOne({_id: channel}).populate({path: 'created.byUser'}).then(chatChannel => {
        if (chatChannel.created.byUser.equals(user) || user.isAdmin) {
            chatChannel.disabled = true;
            chatChannel.save((err, doc) => {
                if (err) {
                    console.log('Error deleting chatChannel: ' + err.message);
                    callback(err, undefined);
                } else {
                    console.log(`deleted chatChannel ${doc._id} on behalf of user ${user._id}`);
                    callback(undefined, doc);
                }
            });
        } else {
            callback('You are not allowed to delete this Channel', undefined);
        }
    });
};

ChatChannelSchema.statics.createChatChannel = function (data, user, callback) {
    const ChatChannel = mongoose.model('ChatChannel');

    let now = moment(new Date).unix();
    let newChat = new ChatChannel({
        name : data.name,
        parentNeighbourhood: data.parentNeighbourhood,
        context: data.context,
        description: data.description,
        parentIdea: data.parentIdea,
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

ChatChannelSchema.statics.subscribe = function (body, user, callback) { // requires body.chatChannelId
    const ChatChannel = mongoose.model('ChatChannel');
    if (body.id && user._id) {
        ChatChannel.findOneAndUpdate({_id: body.id}, {$addToSet:{subscribers: user._id}}, {upsert: true, new: true}, (err, subscriptions) => {
            if (err) {
                console.log(err);
                callback(err, undefined);
            } else {
                console.log(`subscribed user ${user._id} to channel ${body.id}`);
                callback(err, 'subscribed');
            }
        });
    } else {
        callback('invalid input', undefined);
    }
};

ChatChannelSchema.statics.unsubscribe = function (someId, user, callback) { // requires body.chatChannelId
    const ChatChannel = mongoose.model('ChatChannel');
    if (someId && user._id) {
        ChatChannel.findOneAndUpdate({_id: someId}, {$pull:{subscribers: user._id}}, {upsert: true, new: true},
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


mongoose.model('ChatChannel', ChatChannelSchema);