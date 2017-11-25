const mongoose = require('mongoose');
const moment = require('moment');

const ChatChannelSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'chatChannel'
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

// ChatSchema.statics.getChatById = function (chatId, callback) {
//     const Chat = mongoose.model('Chat');
//     Chat.findOne({_id: chatId}).populate('assets').exec(function (err, res) {
//         if (err) console.log(err);
//         callback(err, res);
//     });
// };

// ChatSchema.statics.createChat = function (data, user, callback) {
//     const Chat = mongoose.model('Chat');
//     const Thread = mongoose.model('Thread');

//     // TODO: check if user is allowed for neighbourhood (and thread, permisson model not yet defined)

//     let now = moment(new Date).unix();
//     let newChat = new Chat({
//       content : {
//           title: data.title || '',
//           text: data.text || ''
//       },
//       parentThread : data.parentThread,
//       created : {
//           date: now,
//           byUser: user._id
//       }
//     }).save((err, doc) => {
//       if (err) {
//         console.log('Error saving new chat: ' + err.message);
//         callback(err, undefined);
//       } else {
//         Thread.findOneAndUpdate({_id: data.parentThread}, {$addToSet:{chats: doc._id}}, {upsert: true}, (err, thread) => {
//             if (err) console.log(err);
//             if (!thread) {
//                 callback('parenttread not found', null);
//             } else {
//                 console.log(`added chat ${doc._id} to thread ${thread ? thread._id : undefined}`);
//                 callback(err, doc);
//             }
//             });
//       }
//     });
//   };

mongoose.model('ChatChannel', ChatChannelSchema);