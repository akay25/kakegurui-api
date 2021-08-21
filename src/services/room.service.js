const httpStatus = require('http-status');
const { Room } = require('../models');
const { allStatuses, statuses } = require('../config/statuses');
const ApiError = require('../utils/ApiError');
const randomNameGenerate = require('../utils/randomName');
const getCardsDeck = require('../utils/cards');
const _ = require('lodash');

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
const getRoomById = async (id) => {
  return Room.findById(id);
};

/**
 * Get room by name
 * @param {string} name
 * @returns {Promise<Room>}
 */
const getRoomByName = async (name) => {
  return Room.findOne({ name });
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

  if (room.players.length < 2) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Cannot start game with only one player');
  }

  room.cards = getCardsDeck();
  room.currentPlayer = Math.floor(Math.random() * room.players.length);
  room.status = statuses[1];

  await room.save();

  const socketIO = global['_io'];
  socketIO.to(room.id).emit('game_started', { player: room.players[room.currentPlayer], totalCards: room.cards.length });

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
  getRoomByName,
  joinRoom,
  startGame,
  removeUser,
};
