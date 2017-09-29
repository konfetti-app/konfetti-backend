const mubsub = require('mubsub');

const client = mubsub(`mongodb://${process.env.RUNS_IN_DOCKER ? 'mongo' : 'localhost'}/konfetti-mubsub`);
const channel = client.channel('test');

client.on('error', console.error);
channel.on('error', console.error);

function init(server) {
  const io = require('socket.io')(server);
  const socketioJwt = require('socketio-jwt')

  io.on('connection', socketioJwt.authorize({
    secret: process.env.JWT_SECRET || 'shhhhh',
    timeout: 15000 // 15 seconds to send the authentication message
  })).on('authenticated', function(socket) {

    //this socket is authenticated, we are good to handle more events from it.
    console.log(`new socket connection: ${socket.decoded_token.username} ${socket.id}`);
    socket.emit('chat message', `Welcome, ${socket.decoded_token.username}.`);

    channel.subscribe('chat', function (message) {
      console.log(`emitting to io: ${socket.decoded_token.username} ${socket.id} ${message}`);
      socket.emit('chat message', message);
    });

    socket.on('chat message', function(msg){
      console.log(`new message from io: ${socket.decoded_token.username} ${socket.id} ${msg}`);
      channel.publish('chat', msg);
    });

    socket.on('disconnect', function() {
      console.log(`client disconnected: ${socket.decoded_token.username} ${socket.id}`)
      delete socket;
      delete channel;
    });
  });
}

exports.init = init;
