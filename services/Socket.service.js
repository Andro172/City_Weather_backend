const debug = require('debug')('server:io');
const socketIo = require('socket.io');
const server = require('../app');

const io = socketIo(server);

// When socket connects
io.on('connection', (socket) => {
  debug('socket connected', socket.id);

  // when socket wants to join room
  socket.on('room', (roomName) => {
    socket.join(roomName, (err) => {
      if (err) {
        debug(err);
      }
      debug('joined', 'room:', roomName);
    });
  });

  // when socket wants to leave room
  socket.on('leaveRoom', (roomName) => {
    socket.leave(roomName, (err) => {
      if (err) {
        debug(err);
      }
      debug('left', 'room:', roomName);
    });
  });

  // When socket disconnects
  socket.on('disconnect', () => {
    debug('socket disconnected', socket.id);
  });
});

module.exports = io;
