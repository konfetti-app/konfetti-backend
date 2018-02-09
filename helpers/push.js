const mongoose = require('mongoose');
const User = mongoose.model('User');

const request = require('request');

// basic account setup
// set process.env.ONESIGNAL_URL, process.env.ONESIGNAL_APPID and process.env.ONESIGNAL_KEY in docker environment

function createPushMessage(channel) {
    return new Promise((resolve, reject) => {
        const ChatChannel = mongoose.model('ChatChannel');

        ChatChannel.findOne({ _id: channel })
        .populate({
            path:'chatMessages',
            options: {
                limit: 1,
                sort: { created: -1}
            }
        })
        .populate({
            path:'subscribers',
            select:'pushTokens',
            options: {
                populate: 'pushTokens'
            }
        }).lean().exec((err, res) => {
            console.log('***', err, res);
            if (res.subscribers.length < 1) {
                reject('no subscribers. aborting.');
            } else {
                resolve({recipients: res.subscribers, data: {message: res.chatMessages[0], channelDescription: res.description}});
            }
        });
    })
    .then(data => {
        return new Promise((resolve, reject) => {
            data.subscribers = [];
            data.recipients.forEach((recipient, index, array) => {
                recipient.pushTokens.forEach(token => {
                    data.subscribers.push(token.playerId);
                });
                // data.subscribers.push(recipient.pushTokens.playerId); // can have multiple pushTokens
                if (array.lenght = index + 1) {
                    resolve(data);
                }
            });
        }).then(data => {
            console.log('creating notificaton - recipients:', JSON.stringify(data.recipients), 'data:', JSON.stringify(data.data));
        createNotification(data.subscribers, data.data); // where does message come from?
        });
    })
    .catch((reason) => {console.log(reason);});
} 

function createNotification(recipients, message) {
    // returns notificationId https://documentation.onesignal.com/reference#create-notification
    return new Promise((resolve, reject) => {
        let data = {
                body: {
                include_player_ids: recipients, // Array
                app_id: process.env.ONESIGNAL_APPID, // String
                contents: {"en": `${message.message.text}`}, // Object {"en": "English Message", "es": "Spanish Message"}
                headings: {"en": `${message.channelDescription}`} // Object {"en": "English Title", "es": "Spanish Title"}
            }
        };
        data.metaData = {
            uri: '/notifications',
            reqType: 'POST'
        };
        resolve(data);
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

exports.createPushMessage = createPushMessage;