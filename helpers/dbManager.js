var mongoose = require('mongoose');
let mongoURL = `mongodb://${process.env.RUNS_IN_DOCKER ? 'mongo' : 'localhost'}/konfetti`;
mongoose.connect(mongoURL, {useMongoClient: true});

mongoose.Promise = global.Promise;

var db = mongoose.connection;
db.once('open', function() {
  console.log(`connected to ${mongoURL}.`)
});

function requireModels(){
  module.exports = function(){
    var mongoose = require('mongoose');
    var files = [ 'user-model.js', 'code-model.js', 'neighbourhood-model.js' ];
    var fn = 0;
    for(fn in files) {

      var path_fn = "../models/" + files[fn];
      console.log('Loading model: ' + files[fn]);
      require(path_fn);
    }
  }();  //immediately load models.
};
requireModels();
