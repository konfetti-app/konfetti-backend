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
        unique: true
    },
    chatMessages: [{ // Array of messages (items in this channel)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatMessage'  
    }],
    members: [{ // Array of members in this channel
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

ChatChannelSchema.statics.getChatById = function (chatId, callback) {
    const ChatChannel = mongoose.model('ChatChannel');
    ChatChannel.findOne({_id: chatId}).exec(function (err, res) {
        if (err) console.log(err);
        callback(err, res);
    });
};

ChatChannelSchema.statics.createChatChannel = function (channelName, userId, callback) {
    const ChatChannel = mongoose.model('ChatChannel');
    ChatChannel.findOne({name: channelName})
    .then((channel) => {
        if (!channel) {
            console.log('channelName not found. creating new channelName: ' + channelName);
            let now = moment(new Date).unix();
            let newChat = new ChatChannel({
                name : channelName,
                created : {
                    date: now,
                    byUser: userId
                }
            }).save((err, doc) => {
              if (err) {
                console.log('Error saving new chat: ' + err.message);
                callback(err, undefined);
              } else {
                callback(undefined, doc);
              }
            });
    } else { // channel is already present
        callback(undefined, callback);
    }
  });
};


mongoose.model('ChatChannel', ChatChannelSchema);