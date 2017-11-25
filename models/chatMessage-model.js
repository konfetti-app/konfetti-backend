const mongoose = require('mongoose');
const moment = require('moment');

const ChatMessageSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'chatMessage'
    },
    text: {
        type: String,
        default: ''
    },
    // parentChannel: { // reference to parentChannel
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'ChatChannel'  
    // },
    channel: {
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
    // created: {
    date: {
        type: Number,
        default: moment(new Date).unix(),
        index: true
    }
});

// ChatMessageSchema.statics.getChatById = function (chatId, callback) {
//     const Chat = mongoose.model('Chat');
//     Chat.findOne({_id: chatId}).populate('assets').exec(function (err, res) {
//         if (err) console.log(err);
//         callback(err, res);
//     });
// };

ChatMessageSchema.statics.createChatMessage = function (data, channel, userId, callback) {
    // console.log(JSON.stringify(userId));
    const ChatMessage = mongoose.model('ChatMessage');
    const ChatChannel = mongoose.model('ChatChannel');
//     const Thread = mongoose.model('Thread');

    let now = moment(new Date).unix();
    let newChatMessage = new ChatMessage({
//       content : {
//           title: data.title || '',
//           text: data.text || ''
//       },
      text : data,
      channel : channel,
      parentUser: userId,
      date : now
    //   created : {
    //       date: now,
    //       byUser: user._id
    //   }
    }).save((err, doc) => {
      if (err) {
        console.log('Error saving new chat: ' + err.message);
        callback(err, undefined);
      } else {
        // ChatChannel.findOneAndUpdate({name: channel}, {$addToSet:{messages: doc._id}}, {upsert: true}, (err, channel) => {
        //     if (err) console.log(err);
        //     if (!channel) {
        //         callback('parentChannel not found', null);
        //     } else {
        //         console.log(`added chatMessages ${doc._id} to Channel ${channel ? channel._id : undefined}`);
        //         callback(err, doc);
        //     }
        //     });
      }
    });
  };

mongoose.model('ChatMessage', ChatMessageSchema);