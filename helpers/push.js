const mongoose = require('mongoose');
const User = mongoose.model('User');
const Post = mongoose.model('Post');

const request = require('request');

// basic account setup
// set process.env.ONESIGNAL_URL, process.env.ONESIGNAL_APPID and process.env.ONESIGNAL_KEY in docker environment

function createChatPushMessage(channel) {
    return new Promise((resolve, reject) => {
        const ChatChannel = mongoose.model('ChatChannel');

        ChatChannel.findOne({ _id: channel })
        .populate({
            path:'chatMessages',
            options: {
                sort: { 'date': -1},
                limit: 1,
                populate: {
                    path: 'parentUser',
                    model: 'User',
                    select: 'nickname'
                // },
                // populate: {
                //     path: 'parentChannel',
                //     model: 'ChatChannel',
                //     select: 'parentNeighbourhood'
                }
            }
        })
        .populate({
            path:'subscribers',
            select:'pushTokens',
            options: {
                populate: 'pushTokens'
            }
        })
        .populate('parentChannel')
        .exec((err, res) => {
            // console.log('***', err, res); 
            if (!res || !res.subscribers || res.subscribers.length < 1) {
                reject('no subscribers. aborting.');
            } else {
                resolve({
                    recipients: res.subscribers, 
                    data: {message: res.chatMessages[0], channelDescription: res.description,
                    meta: {
                        pushIDs: [],//['xxxx1', 'xxxx2'],
                        neighbourhood: res.parentNeighbourhood,
                        module: res.context,//'groupchats',
                        itemID: res._id,//'5a61d10d11adf00fcb7c3452',
                        subID: null
                        }
                    }
                });
            }
        });
    })
    .then(data => {
        return new Promise((resolve, reject) => {
            data.subscribers = [];
            data.recipients.forEach((recipient, index, array) => {
                if (!(data.data.message.parentUser.equals(recipient))) { // don't notify parentUser
                // console.log('generating newsfeed entry:' + JSON.stringify({title: 'New chat activity in ' + data.channelDescription, text: data.message.parentUser.nickname + ': ' + data.message.text}, user, callback));
                // console.log('generating newsfeed entry:' + JSON.stringify(data.data));

                    Post.createNewsfeedEntry({title: 'New chat activity in ' + data.data.channelDescription, text: data.data.message.parentUser.nickname + ': ' + data.data.message.text}, recipient, data.meta, (err, res) => {console.log('newsfeed entry generated.', res ? res._id : err);});
                    recipient.pushTokens.forEach(token => {
                    data.subscribers.push(token.playerId);
                    });
                } else {
                    console.log('skipping', recipient._id, '(parentUser)');
                }
                // data.subscribers.push(recipient.pushTokens.playerId); // can have multiple pushTokens
                if (array.lenght = index + 1) {
                    resolve(data);
                }
            });
        }).then(data => {
            // console.log('creating notificaton - recipients:', JSON.stringify(data.recipients), 'data:', JSON.stringify(data.data));
            createNotification(data.subscribers, data.data, data.meta);
        });
    })
    .catch((reason) => {console.log(reason);});
} 

function createNotification(recipients, message, meta) {
    // returns notificationId https://documentation.onesignal.com/reference#create-notification
    return new Promise((resolve, reject) => {
        if (recipients.length > 0) {
            let data = {
                    body: {
                    include_player_ids: recipients, // Array
                    app_id: process.env.ONESIGNAL_APPID, // String
                    contents: {"en": `${message.message.text}`}, // Object {"en": "English Message", "es": "Spanish Message"}
                    headings: {"en": `${message.channelDescription}`}, // Object {"en": "English Title", "es": "Spanish Title"}
                    data: JSON.stringify(meta)
                } // TODO: add refs to neighbourhoodId, moduleId (context), Origin "chat", OriginId -- data: {"abc": "123", "foo": "bar"}
            };
            data.metaData = {
                uri: '/notifications',
                reqType: 'POST'
            };
            resolve(data);
        } else {
            reject('no playerIds to be notified. Aborted.');
        }
    })
    .then((data) => {
        console.log(`dispatching to oneSignal: ${JSON.stringify(data)}`);
        sendRequest(data).then(res => {
            console.log(`notification sent: ${JSON.stringify(res)}`); // TODO: continue here.
        });
    })
    .catch(reason => {console.log(reason);});
}

function cancelNotification(recipient, notificationId) {
    // returns status
}


function sendRequest(data) { // data is expected as {body: JSON payload, metaData: {uri: specific uri} ()}
    return new Promise((resolve, reject) => {
        if (!data) {
            reject('no data');
        }

        let options = {
            url: `${process.env.ONESIGNAL_URL}${data.metaData.uri}`,
            method: data.metaData.reqType,
            json: data.body,
            headers: {
                'Authorization': 'Basic ' + process.env.ONESIGNAL_KEY,
                'Content-Type': 'application/json; charset=utf-8'
            }
        };

        request(options, function (err, res, body) {
            if (err || res.statusCode > 201) {
                console.log(`${data.metaData.reqType} ${data.metaData.uri} failed with error: ${err}, code: ${res ? JSON.stringify(res.statusCode) + ' res.body: ' + JSON.stringify(res.body) : 'no statusCode'} type: ${process.env.HTTP_CONNECTOR_TYPE} req.body: ${JSON.stringify(data.body)}`);
            } else {
                console.log(`onesignal:`, `${data.metaData.reqType} ${data.metaData.uri} :: ExternalID: ${data.metaData.ExternalID} result: ${res.statusCode}`);
                resolve(res.statusCode);
            }
        });
    })
        .catch(reason => console.log('onsignal call failed due to rejected promise:', reason));
}

exports.createChatPushMessage = createChatPushMessage;