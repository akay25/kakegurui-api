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
      socket.on('i_flipped_card', async function (card) {
        const user = socket.request.user;
        const room = await getRoomById(user.roomId, true);

        // Check if current user can flip the card or not
        if (room.players[room.currentPlayer].id === user.id) {
          // Use operation only card is flipped upside
          if (card.direction === 'up') {
            if (room.prevSelectedCard === -1 || room.prevSelectedCard === card.cardIndex) {
              room.prevSelectedCard = card.cardIndex;
              room.save();
            } else if (room.prevSelectedCard !== -1 || room.prevSelectedCard !== card.cardIndex) {
              // No flipping of any kind in here
              room.selectedCard = card.cardIndex;
              if (room.cards[room.selectedCard] === room.cards[room.prevSelectedCard]) {
                // Cards matched, user won the two cards

                // Remove cards from main room
                room.removedCardIndices.push(room.selectedCard);
                room.removedCardIndices.push(room.prevSelectedCard);

                // TODO: Emit cards are removed

                // Increase user score
                room.players[room.currentPlayer].score += 2;
                // TODO: Emit user score

                await room.save();
                if (room.cards.length === room.removedCardIndices.length) {
                  // Game is finished
                  // TODO: Emit show leader board
                }
              } else {
                console.log("this is called, player can;'t turn more cards");
                await updatePlayerForRoom(room.id);
              }
              return;
            }
          }
          socket.to(user.roomId).emit('card_flipped', card);
        } else {
          socket.emit('not_your_turn', { message: 'Not your turn' });
        }
      });

      // Set back image
      socket.on('ask_for_back_image', async function (cardIndex) {
        // TODO: Check if user can ask for picture
        const user = socket.request.user;
        const cardURL = await getCardsFromRoom(user.roomId, cardIndex);
        if (!!cardURL) {
          socket.emit(`set_back_image_${cardIndex}`, cardURL);
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
