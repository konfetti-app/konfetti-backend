const mongoose = require('mongoose');
const moment = require('moment');

const ModuleConfigSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'moduleConfig'
    },
    options: {
        type: Object
    }
});

ModuleConfigSchema.statics.getModuelConfigById = function (moduleConfigId, callback) {
    const ModuleConfig = mongoose.model('ModuleConfig');
    ModuleConfig.findOne({_id: moduleConfigId}).exec(function (err, res) {
        if (err) console.log(err);
        callback(err, res);
    });
};


  

mongoose.model('ModuleConfig', ModuleConfigSchema);