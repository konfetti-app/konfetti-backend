const mongoose = require('mongoose');
const User = mongoose.model('User');
const ChatChannel = mongoose.model('ChatChannel');

const request = require('request');

// basic account setup
// set ONESIGNAL_URL, ONESIGNAL_APPID and ONESIGNAL_KEY in docker environment

function getPlayers(channel) {
    return new Promise((resolve, reject) => {
        // 1 ChatChannel.members.subscriptionTokens .populate('pushTokens')
        // ChatChannel.find({_id: channel})
        // .populate('members')
        // .populate('pushTokens')
        // .then(result => {
        //     Subscription.find({parentChannel: channel}).then(subscribed)
        // })
        // .then()
        ChatChannel.findOne({ _id: channel }).exec((err, res) => {
            console.log('***', err, res);
        });
        // *IF* User has subscribed to Channel
        // 3. resolve as an Array
        let recipients = 'result of extensive DB query';
        resolve(recipients);
    })
    .catch((reason) => {console.log(reason);});
} 

getPlayers.then(recipients => {
    createNotifications(recipients, message); // where does message come from?
})
.catch((reason) => {console.log(reason);});

function createNotification(recipients, message) {
    // returns notificationId https://documentation.onesignal.com/reference#create-notification
    return new Promise(resolve, reject => {
        let data = {
            include_player_ids: recipients, // Array
            app_id: '', // String
            contents: {}, // Object {"en": "English Message", "es": "Spanish Message"}
            headings: {} // Object {"en": "English Title", "es": "Spanish Title"}
        };
        data.metaData = {
            uri: '/notifications',
            reqType: 'POST'
        };
        resolve(data);
    })
    .then((data) => {
        sendRequest(data).then(res => {
            console.log(`notification sent: ${JSON.stringify(res)}`); // TODO: continue here.
        });
    })
    .catch(reason => {console.log(reason);});
}

function cancelNotification(recipient, notificationId) {
    // returns status
}


// function addDevice(data, user, callback) { // removed. Seems to be handled by cordova-plugin on device.
//     // returns playerid (recipient) https://documentation.onesignal.com/reference#add-a-device
//     return new Promise(resolve, reject => {
//         let outData = {
//             app_id: '', // String
//             device_type: data.type || '', // Int
//             identifier: data.id || '', // see doc
//             language: '' // 'en', 'de', ...
//         };
//         outData.metaData = {
//             uri: '/players',
//             reqType: 'POST'
//         };
//         resolve(outData);
//     })
//     .then((data) => {
//         sendRequest(data).then(res => {
//             console.log(`adddevice: ${JSON.stringify(res)}`);
//             if (res.success) User.addDevice(res.id, user);
//             callback(null, res.id);
//         });
//     })
//     .catch(reason => {
//         console.log(reason);
//         callback(err, null);
//     });
// }


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
                'Authorization': 'Basic ONESIGNAL_KEY',
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

exports.getPlayers = getPlayers;