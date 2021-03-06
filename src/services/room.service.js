const httpStatus = require('http-status');
const config = require('../config/config');
const { Room, Theme } = require('../models');
const { statuses } = require('../config/statuses');
const ApiError = require('../utils/ApiError');
const randomNameGenerate = require('../utils/randomName');
const getCardsDeck = require('../utils/cards');
const _ = require('lodash');
const { playerChangeQueue } = require('../workers/queues');

/**
 * Create a user
 * @returns {Promise<User>}
 */
const createRoom = async () => {
  let roomName = randomNameGenerate();
  while (!Room.isNameTaken(roomName)) {
    roomName = randomNameGenerate();
  }

  return Room.create({ name: roomName });
};

/**
 * Get room by id
 * @param {ObjectId} id
 * @returns {Promise<Room>}
 */
const getRoomById = async (id, withCards = false) => {
  if (withCards) {
    return await Room.findById(
      id,
      'name status players cards cover deckRange currentPlayer selectedCard prevSelectedCard removedCardIndices'
    );
  }

  const room = await Room.findById(id);
  if (!room) {
    console.log('looging fdor ===> ', id);
    // throw new ApiError(httpStatus.NOT_FOUND, 'Room not found');
    return null;
  }

  // If game has already started then send some extra information as well
  if (room.status === statuses[1]) {
    room.player = room.players[room.currentPlayer];
  }
  return room;
};

/**
 * Get running room by id
 * @param {ObjectId} id
 * @returns {Promise<Room>}
 */
const getRunningRoomById = async (id) => {
  const room = await Room.findById(id);

  if (!!room && room.status === statuses[1]) {
    room.player = room.players[room.currentPlayer];
    return room;
  }
  return null;
};

/**
 * Get room by name
 * @param {string} name
 * @returns {Promise<Room>}
 */
const getRoomByName = async (name) => {
  try {
    const room = await Room.findOne({ name });
    // If game has already started then send some extra information as well
    if (room.status === statuses[1]) {
      room.player = room.players[room.currentPlayer];
    }
    return room;
  } catch (e) {
    throw e;
  }
};

/**
 * Join room by person
 * @param {String} roomName
 * @param {Object} user
 * @returns {Promise<Room>}
 */
const joinRoom = async (roomName, user) => {
  const room = await getRoomByName(roomName);
  if (!room) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Room not found');
  }

  if (room.players.length == 0) {
    user.owner = true;
  }

  room.players.push(user);
  await room.save();

  // If game has already started then send some extra information as well
  if (room.status === statuses[1]) {
    room.player = room.players[room.currentPlayer];
  }

  return { room, player: user };
};

/**
 * Join room by person
 * @param {String} roomName
 * @returns {Promise<Room>}
 */
const startGame = async (roomName) => {
  const room = await getRoomByName(roomName);
  if (!room) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Room not found');
  }

  // Don't start the game, if the player count is less than 2
  if (room.players.length < 2) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Cannot start game with only one player');
  }

  // Generate new cards deck
  // Get theme
  let theme = await Theme.findById(room.themeId);
  if (!theme) {
    theme = await Theme.findOne();
  }
  // Explicitly setting pokemon cards
  room.cards = getCardsDeck(theme.cards, room.deckRange);
  room.cover = theme.cover;
  room.removedCardIndices = [];

  // Set player's score = 0
  const players = [];
  for (const p of room.players) {
    p.score = 0;
    players.push(p);
  }
  room.players = players;
  room.markModified('players');

  // Select a random player
  room.currentPlayer = Math.floor(Math.random() * room.players.length);
  const t = new Date();
  t.setSeconds(t.getSeconds() + config.MAX_WAIT_FOR_PLAYER_IN_SECS);
  room.nextTurnTime = t;

  // On starting the game, start a cronjob
  // const queueResp = await playerChangeQueue.add({ roomId: room.id }, { delay: config.MAX_WAIT_FOR_PLAYER_IN_SECS * 1000 });
  // room.bullMQJobKey = queueResp.toKey();

  // Start the game
  room.status = statuses[1];
  await room.save();

  // Tell all connected players, that game has been started
  const socketIO = global['_io'];
  socketIO.to(room.id).emit('game_started', {
    cover: room.cover,
    player: room.players[room.currentPlayer],
    deckRange: room.deckRange,
    removedCardIndices: room.removedCardIndices,
    nextTurnTime: t,
  });

  return { message: 'OK' };
};

/**
 * Leave room by person
 * @param {String} roomName
 * * @param {String} playerId
 * @returns {Promise<Room>}
 */
const removeUser = async (roomName, playerId) => {
  const room = await getRoomByName(roomName);
  if (!room) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Room not found');
  }

  const newPlayers = room.players.filter((p) => p.id !== playerId);
  if (newPlayers.length > 0) {
    newPlayers[0].owner = true;
    room.players = newPlayers;
    room.markModified('players');
    await room.save();
    return room;
  } else {
    await room.remove();
  }
  return true;
};

module.exports = {
  createRoom,
  getRoomById,
  getRunningRoomById,
  getRoomByName,
  joinRoom,
  startGame,
  removeUser,
};
