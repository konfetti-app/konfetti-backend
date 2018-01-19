const mongoose = require('mongoose');
const moment = require('moment');

const mubsub = require('mubsub');
const mubsubClient = mubsub(`mongodb://${process.env.RUNS_IN_DOCKER ? 'mongo' : 'localhost'}/konfetti-mubsub`);

const ChatMessageSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'chatMessage'
    },
    text: {
        type: String,
        default: ''
    },
    parentChannel: { // reference to parentChannel
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatChannel'  
    },
    channelName: {
        type: String
    },
    // assets: [{ // Array of assets (items linked to this chatMessage)
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Asset'  
    // }],
    parentUser: { // reference to parentUser
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  
    },
    // disabled: {
    //     type: Boolean,
    //     default: false
    // },
    date: {
        type: Number,
        default: moment(new Date).unix(),
        index: true
    },
    avatar: {
        type: Object
    },
    nickname: {
        type: String
    }
});

// ChatMessageSchema.statics.getChatById = function (chatId, callback) {
//     const Chat = mongoose.model('Chat');
//     Chat.findOne({_id: chatId}).populate('assets').exec(function (err, res) {
//         if (err) console.log(err);
//         callback(err, res);
//     });
// };

ChatMessageSchema.statics.getChatMessage = function (chatMessageId, callback) {
    const ChatMessage = mongoose.model('ChatMessage');
    // ChatMessage.findOne({_id:chatMessageId}).populate('parentUser', 'nickname avatar').populate('parentUser.avatar').then(chatMessage => {
    ChatMessage.findOne({_id:chatMessageId}).populate({path: 'parentUser', select: 'nickname avatar', populate: {path: 'avatar', select: 'filename'}}).then(chatMessage => {
    // console.log('blubb:' + JSON.stringify(chatMessage));
        callback(null, chatMessage);
    });
};


ChatMessageSchema.statics.createChatMessage = function (data, channel, userId, callback) {
    // console.log(JSON.stringify(userId));
    // console.log(JSON.stringify(channel));
    console.dir(channel);
    const ChatMessage = mongoose.model('ChatMessage');
    const ChatChannel = mongoose.model('ChatChannel');
//     const Thread = mongoose.model('Thread');
   
    let now = moment(new Date).unix();
    let newChatMessage = new ChatMessage({ // TODO: add user-data: nickname, avatar
    text : data,
    parentChannel : channel,
    parentUser: userId,
    date : now 
    }).save((err, doc) => {
    if (err) {
        console.log('Error saving new chat: ' + err.message);
        callback(err, undefined);
    } else {
        mubsubClient.channel(channel).publish('chat message', doc._id);
        ChatChannel.findOneAndUpdate({_id: doc.parentChannel}, {$addToSet:{chatMessages: doc._id, members: userId}}, {upsert: true}, (err, channel) => {
            if (err) console.log(err);
            if (!channel) {
                if(callback && typeof callback === "function") {
                    callback('parentChannel not found', null);
                }
            } else {
                console.log(`added chatMessages ${doc._id} to Channel ${channel ? channel._id : undefined}`);
                if(callback && typeof callback === "function") {
                    callback(err, doc);
                }
            }
        });
        }
    });
  };
  

mongoose.model('ChatMessage', ChatMessageSchema);