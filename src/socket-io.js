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

      socket.on('ask_for_card_flip', async function (card) {
        const user = socket.request.user;
        const room = await getRoomById(user.roomId, true);

        // Check if current user can flip the card or not
        if (room.players[room.currentPlayer].id === user.id) {
          if (card.direction === 'up') {
            const cardImageURL = card.id >= 0 && card.id < room.deckRange ? room.cards[card.id] : null;
            if (room.prevSelectedCard === -1 || room.prevSelectedCard === card.id) {
              room.prevSelectedCard = card.id;
              await room.save();
              // Emit opened card to all users
              io.to(user.roomId).emit('flip_card', {
                ...card,
                image: cardImageURL,
              });
              return;
            } else if (
              room.prevSelectedCard !== -1 &&
              room.prevSelectedCard !== card.id &&
              (room.selectedCard === -1 || room.selectedCard === card.id)
            ) {
              // No flipping of any kind in here
              room.selectedCard = card.id;
              await room.save();
              // Emit to only the user
              socket.emit('flip_card', {
                ...card,
                image: cardImageURL,
              });

              if (room.cards[room.selectedCard] === room.cards[room.prevSelectedCard]) {
                console.log('Cards matched, user won');
                // Cards matched, user won the two cards

                // Remove cards from main room
                // room.removedCardIndices.push(room.selectedCard);
                // room.removedCardIndices.push(room.prevSelectedCard);

                // await room.save();
                // TODO: Emit cards are removed

                // Increase user score
                // room.players[room.currentPlayer].score += 2;
                // TODO: Emit user score
                if (room.cards.length === room.removedCardIndices.length) {
                  // Game is finished
                  // TODO: Emit show leader board
                  console.log('Game finished');
                }
                return;
              } else {
                // Wait for a 3 sec and reset
                console.log('I will wait for 3 sec and reset your chances');
                return;
              }
            } else if (
              room.prevSelectedCard !== -1 &&
              room.prevSelectedCard !== card.id &&
              room.selectedCard !== -1 &&
              room.selectedCard !== card.id
            ) {
              socket.emit('wrong_card', { card1: room.prevSelectedCard, card2: room.selectedCard });
            }
          } else if (card.direction === 'down') {
            if (room.prevSelectedCard === -1 || room.prevSelectedCard === card.id) {
              // Emit closing of first card to everyone
              io.to(user.roomId).emit('flip_card', card);
            } else {
              // Emit closing of second card to one person only
              // Emit to only the user
              socket.emit('flip_card', card);
            }
          }
        } else {
          socket.to(user.roomId).emit('invalid_player_request', `${user.name} is requesting forbidden access to my vault`);
        }
      });

      socket.on('ask_for_flipped_cards', async function () {
        const user = socket.request.user;
        const room = await getRoomById(user.roomId, true);

        if (room.prevSelectedCard !== -1) {
          const image =
            room.prevSelectedCard >= 0 && room.prevSelectedCard < room.deckRange ? room.cards[room.prevSelectedCard] : null;
          socket.emit('flip_card', {
            id: room.prevSelectedCard,
            image,
            direction: 'up',
          });
        }
        // Check if current user can flip the card or not
        if (room.players[room.currentPlayer].id === user.id) {
          if (room.selectedCard !== -1) {
            const image =
              room.selectedCard >= 0 && room.selectedCard < room.deckRange ? room.cards[room.selectedCard] : null;
            socket.emit('flip_card', {
              id: room.selectedCard,
              image,
              direction: 'up',
            });
          }
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
