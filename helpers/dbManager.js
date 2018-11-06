const mongoose = require('mongoose');
const mongoURL = `mongodb://${process.env.RUNS_IN_DOCKER ? 'mongo' : 'localhost'}/konfetti`;
mongoose.connect(mongoURL, { useNewUrlParser: true });
mongoose.Promise = global.Promise;

const db = mongoose.connection;
db.once('open', function() {
  console.log(`connected to ${mongoURL}.`);
});

function requireModels(){
  module.exports = function(){
    const mongoose = require('mongoose');
    const files = [ 'user-model.js', 'code-model.js', 'thread-model.js', 'neighbourhood-model.js', 'post-model.js', 'asset-model.js', 'chatMessage-model.js', 'chatChannel-model.js', 'moduleConfig-model.js', 'pushToken-model.js', 'idea-model.js', 'wallet-model.js'];
    let fn = 0;
    for(fn in files) {

      let path_fn = "../models/" + files[fn];
      console.log('Loading model: ' + files[fn]);
      require(path_fn);
    }
  }();  //immediately load models.
};
requireModels();
