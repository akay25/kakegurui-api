const httpStatus = require('http-status');
const { Room } = require('../models');
const { statuses } = require('../config/statuses');
const ApiError = require('../utils/ApiError');
const randomNameGenerate = require('../utils/randomName');
const socketIO = require('../socket-io')();

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

  room.status = statuses[1];

  if (room.players.length < 2) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Cannot start game with only one player');
  }

  // socketIO.to(room.name).emit('game_started', 'ranbdom data');
  // // TODO: Start game from socket
  console.log(global['_io']);
  // await room.save();

  return room;
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
