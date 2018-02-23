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
    konfettiSpent: [{ // TODO: connected to wallet-model, one konfetti is free, others mach agains users wallet
        byUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'  
        },
        amount: {
            type: Number
        }
    }],
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
        console.log('Error saving new idea: ' + err.message);
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
                resolve(savedIdea);
            }
        });
    })
    .then(savedIdea => {callback(null, savedIdea);})
    .catch(reason => {callback(reason, null);});
    });
};

IdeaSchema.statics.updateIdeaStatus = function (ideaId, data, user, callback) {
    const Idea = mongoose.model('Idea');
    console.log(JSON.stringify(data));
    // let now = moment(new Date).unix();

    return new Promise(async(resolve, reject) => {
        //  function() {
            if (String(data.isAttending) === 'true') {
                await Idea.findByIdAndUpdate({_id: ideaId}, {$addToSet:{guests: user._id}}, {upsert: true, new: true}, (err, subscriptions) => {
                    console.log(`attendence of user ${user._id} updated for idea ${ideaId}- true`);
                });
            } else {
                await Idea.findByIdAndUpdate({_id: ideaId}, {$pull:{guests: user._id}}, {upsert: true, new: true}, (err, subscriptions) => {
                    console.log(`attendence of user ${user._id} updated for idea ${ideaId} - false`);
                });
            }
            if (String(data.isHelping) === 'true') {
                await Idea.findByIdAndUpdate({_id: ideaId}, {$addToSet:{helpers: user._id}}, {upsert: true, new: true}, (err, subscriptions) => {
                    console.log(`help-status of user ${user._id} updated for idea ${ideaId} - true`);
                });
            } else {
                await Idea.findByIdAndUpdate({_id: ideaId}, {$pull:{guests: user._id}}, {upsert: true, new: true}, (err, subscriptions) => {
                    console.log(`help-status of user ${user._id} updated for idea ${ideaId} - false`);
                });
            }
            let status = await {isAttending: data.isAttending, isHelping: data.isHelping};
        // }
        
        resolve(status); // TODO: no error-handling here.
    })

    .then(status => {
        callback(null, status);
    })
    .catch(reason => {
        console.log('rejected: ' + reason);
        callback(reason, null);
    });
};

IdeaSchema.statics.getIdeas = function (params, callback) {

    const Idea = mongoose.model('Idea');
    Idea.find({context: params.context, parentNeighbourhood: params.parentNeighbourhood, disabled: false}).populate({path: 'created.byUser', select: 'nickname avatar', populate: {path: 'avatar', select: 'filename'}}).exec(function (err, res) {
        if (err) console.log(err);
        callback(err, res);
    });
};

IdeaSchema.statics.getIdeaById = function (ideaId, callback) {
    const Idea = mongoose.model('Idea');
    Idea.findOne({_id: ideaId}).exec(function (err, res) {
        if (err) console.log(err);
        callback(err, res);
    });
};

IdeaSchema.statics.getIdeasForNeighbourhood = function (neighbourhoodId, user, callback) {
    const Idea = mongoose.model('Idea');
    Idea.find({parentNeighbourhood: neighbourhoodId}).limit(500).sort('date').populate({path: 'created.byUser', select: 'nickname avatar', populate: {path: 'avatar', select: 'filename'}}).then(results => {
        return new Promise(async(resolve, reject) => {
            await results.forEach((result, index, array) => {

                if (result.helpers.indexOf(user._id) > -1) {
                    results[index].userIsHelping = true;
                } else {
                    results[index].userIsHelping = false;
                }
                if (result.guests.indexOf(user._id) > -1) {
                    results[index].userIsAttending = true;
                } else {
                    results[index].userIsAttending = false;
                }
                results[index].helpers;
                results[index].guests;
            });
            resolve(results);
        })
        .then(modifiedIdeas => {
            callback(null, modifiedIdeas);
        })
        .catch(reason => {
            callback(reason, null);
        });
    });
};

IdeaSchema.statics.deleteIdea = function (ideaId, user, callback) {
    const Idea = mongoose.model('Idea');
    Idea.findOne({_id: ideaId}).then(idea => {
        if (idea.created.byUser.equals(user._id) || user.isAdmin) {
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
            callback('You are not allowed to delete this Idea', undefined);
        }
    });
};
function getTotalKonfetti (konfettiSpent) {
    let konfettiTotal = 0;
    konfettiSpent.forEach(el => {
        konfettiTotal = konfettiTotal + el.amount;
    });
    console.log('konfettiTotal', konfettiTotal);
    return konfettiTotal;
}

IdeaSchema.statics.upvoteIdea = function (ideaId, amount, user, callback) {
    const Idea = mongoose.model('Idea');
    const Wallet = mongoose.model('Wallet');
    // deduct from user's wallet
    return new Promise((resolve, reject) => {
        Wallet.findOne({parentUser: user._id, parentNeighbourhood: user.parentNeighbourhood})
        .then(wallet => {
            if (wallet && wallet.amount >= amount) { // TODO: Handle case wallet not found
                wallet.amount = wallet.amount - amount;
                wallet.save();
                resolve({konfettiIdea: -1, konfettiWallet: wallet ? wallet.amount : 0});
            } else {
                // insufficient balance. one konfetti is free
                Idea.findOne({_id: ideaId})
                .then(idea => {
                    return new Promise((resolve, reject) => {
                        let alreadyVoted = false;
                        idea.konfettiSpent.forEach(el => {
                            if (el.byUser.equals(user._id)) alreadyVoted = true;
                        })
                        resolve(alreadyVoted);
                    })
                })
                .then(alreadyVoted => {
                    if (alreadyVoted) {
                        reject('alreadyVoted');
                    } else {
                        amount = 1;
                        resolve({konfettiIdea: -1, konfettiWallet: 0});
                    }
                })
            }
        })
    })

    .then((konfetti) => {
        // add to idea
        return new Promise((resolve, reject) => {
            Idea.findByIdAndUpdate({_id: ideaId}, {$addToSet:{konfettiSpent: {byUser: user._id, amount: amount}}}, {upsert: true, new: true}, (err, idea) => {
                if (!idea) {
                    reject('idea not found');
                } else {
                    let konfettiIdea = getTotalKonfetti(idea.konfettiSpent);
                    resolve({konfettiIdea: konfettiIdea, konfettiWallet: konfetti.konfettiWallet});
                }
            }) 
        })
    })
    .then(konfettiTotal => {
        // console.log('konfettiTotal:', konfettiTotal);
        callback(null, {konfettiIdea: konfettiTotal});
    })
    .catch(reason => {
        console.log('rejected:', reason);
        callback(reason, null);
    });

};


IdeaSchema.statics.distributeKonfettiForIdea = function (ideaId, data, user, callback) {
    const Idea = mongoose.model('Idea');
    const Wallet = mongoose.model('Wallet');

    Idea.findOne({_id: ideaId})
        .then(idea => {
            return new Promise((resolve, reject) => {

                if (!idea.created.byUser.equals(user._id) || !user.isAdmin) {
                    reject('not allowed')
                } else if (data.amount && data.amount > getTotalKonfetti(idea.konfettiSpent)){
                    reject('not allowed to distribute more konfetti than spent on idea')
                } else { // ok to distribute.
                    // let numberOfRecipients = data.recipients.length; // <- temporaily disabled to get the economy running.
                    data.recipients.forEach(recipient => {
                        Wallet.findOne({parentUser: recipient, parentNeighbourhood: idea.parentNeighbourhood})
                        .then(wallet => {
                            if (!wallet) { // create a wallet.
                                Wallet.createWalletWithBalance({parentUser: recipient, parentNeighbourhood: idea.parentNeighbourhood, amount: data.amount}, recipient, (err, doc) => console.log('created new wallet:', JSON.stringify(doc)));
                            } else { // update existing wallet.

                                wallet.amount = wallet.amount + data.amount;
                                wallet.save()
                            }
                        })
                        .catch(reason => {
                            console.log('rejected: unable to distribute to ', recipient, JSON.stringify(reason));
                        });
                    })
                    idea.konfettiSpent = []; // reset.
                    idea.save((err, doc) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(doc.konfettiSpent); // TODO adapt.
                        }
                        
                    });
                }
                
            })
        })
        .then(konfettiTotal => {
            console.log('konfettiTotal:', konfettiTotal);
            callback(null, {konfettiIdea: konfettiTotal});
        })
        .catch(reason => {
            console.log('rejected:', reason);
            callback(reason, null);
        });


};

// IdeaSchema.statics.subscribe = function (body, user, callback) { // requires body.ideaId
//     const Idea = mongoose.model('Idea');
//     if (body.id && user._id) {
//         Idea.findOneAndUpdate({_id: body.id}, {$addToSet:{subscribers: user._id}}, {upsert: true, new: true}, (err, subscriptions) => {
//             if (err) {
//                 console.log(err);
//                 callback(err, undefined);
//             } else {
//                 console.log(`subscribed user ${user._id} to idea ${body.id}`);
//                 callback(err, 'subscribed');
//             }
//         });
//     } else {
//         callback('invalid input', undefined);
//     }
// };

// IdeaSchema.statics.unsubscribe = function (someId, user, callback) { // requires body.ideaId
//     const Idea = mongoose.model('Idea');
//     if (someId && user._id) {
//         Idea.findOneAndUpdate({_id: someId}, {$pull:{subscribers: user._id}}, {upsert: true, new: true},
//             (err, subscriptions) => {
//                 if (err) {
//                     console.log(err);
//                     callback(err, undefined);
//                 } else {
//                     console.log(`unsubscribed ${user._id} from channel ${someId}`);
//                     callback(undefined, 'unsubscribed');
//                 }
//             });
//     } else {
//         callback('invalid input', undefined);
//     }
// };


mongoose.model('Idea', IdeaSchema);