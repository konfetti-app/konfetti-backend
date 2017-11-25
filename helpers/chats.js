const mongoose = require('mongoose');
const ChatMessage = mongoose.model('ChatMessage');
const ChatChannel = mongoose.model('ChatChannel');

const mubsub = require('mubsub');
const mubsubClient = mubsub(`mongodb://${process.env.RUNS_IN_DOCKER ? 'mongo' : 'localhost'}/konfetti-mubsub`);

function init(server) {
  const io = require('socket.io')(server);
  const socketioJwt = require('socketio-jwt')

  io.on('connection', socketioJwt.authorize({
    secret: process.env.JWT_SECRET || 'shhhhh',
    timeout: 15000 // 15 seconds to send the authentication message
  })).on('authenticated', function(socket) {
    

    //socket is authenticated, we are good to handle more events from it.
    console.log(`new socket connection: ${socket.decoded_token.username} ${socket.id}`);
    socket.emit('connection established');

    socket.on('room selection', function(data){
		
        socket.join(data.roomID);
        console.log(`socket: ${socket.decoded_token.username} ${socket.id} joined room: ${ data.roomID}`);

        const mubsubChannel = mubsubClient.channel(data.roomID);
        
        mubsubClient.on('error', console.error);
        mubsubChannel.on('error', console.error);

        //DEBUG
        setInterval(() => {
          let date = Date()
          console.log(`inserting new pubsub message: into room ${ data.roomID}: ${date}`);
          mubsubChannel.publish('chat message', date);
        }, 10000); // every 10 sec
        // do shit and send.

        mubsubChannel.subscribe('chat message', (msg) => {
          console.log(`socket emitting to user: ${socket.decoded_token.username} socket: ${socket.id} room: ${ data.roomID}`)
          socket.to(data.roomID).emit('chat message', msg);
        })
    

    // socket.on('subscribe', function(channelId) {
    //     console.log(`subscribing ${socket.decoded_token.username} to channel ${channelId}`)
    //     mubsubChannel.subscribe(channelId, function (message) {
    //         console.log(`subscribed ${socket.decoded_token.username} to channel ${channelId}`);
            
    //       });
    //       socket.on('chat message', function(msg){
    //         console.log(`new message from io: ${socket.decoded_token.username} ${socket.id} ${msg}`);
    //         mubsubChannel.publish(channelId, msg);
    //       });
    // });
  });
    
    
    

    socket.on('disconnect', function() {
      console.log(`client disconnected: ${socket.decoded_token.username} ${socket.id}`)
      delete socket;
      delete mubsubChannel;
    });
  });
}

exports.init = init;
