const socketIO = require('socket.io');
const socketAuthMiddleware = require('./middlewares/socketAuth');
const { getCardsFromRoom } = require('./services/room.service');

module.exports = function (server) {
  if (global['_io'] === undefined) {
    const { getRoomById } = require('./services/room.service');
    const io = socketIO(server, {
      cors: {
        origin: 'http://localhost:8080',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Load socket middleware
    io.use(socketAuthMiddleware);

    const isValidSocketRequest = (socket) => {
      // TODO: CHeck for user and room and do forward
      // TODO: Check for uiser action with player's turn
      // console.log(token);
      return true;
    };

    io.use((socket, next) => {
      if (isValidSocketRequest(socket)) {
        next();
      } else {
        const err = new Error('Not authorized');
        err.data = { content: 'Please join some room' };
        next(err);
      }
    });

    // Load socket routes
    io.on('connection', function (socket) {
      // Join room event
      socket.on('join_room', async function () {
        const user = socket.request.user;
        // Make the user join the given room
        socket.join(user.roomId);

        const room = await getRoomById(user.roomId);
        // Send broad cast event to all members
        socket.to(user.roomId).emit('room_updated', room);
        socket.emit('room_joined');
      });

      // Leave room event
      socket.on('leave_room', async function () {
        const user = socket.request.user;
        // Make the user join the given room
        socket.leave(user.roomId);

        const room = await getRoomById(user.roomId);
        // Send broad cast event to all members
        socket.to(user.roomId).emit('room_updated', room);
        // Send broad cast event to all members
        socket.emit('room_left');
      });

      // Flip the card
      socket.on('i_flipped_card', function (data) {
        // TODO: User can flip only twice, then it's next player's turn
        const user = socket.request.user;
        socket.to(user.roomId).emit('card_flipped', data);
      });

      // Set back image
      socket.on('ask_for_back_image', async function (cardIndex) {
        const user = socket.request.user;
        const room = await getCardsFromRoom(user.roomId);
        if (cardIndex >= 0 && cardIndex < room.cards.length) {
          socket.emit('set_back_image', room.cards[cardIndex]);
        }
      });

      // Socket disconnect
      socket.on('disconnect', function () {
        const user = socket.request.user;
        socket.to(user.roomId).emit('room_updated', user);
      });
    });
    global._io = io;
    return io;
  }
  return global['_io'];
};
