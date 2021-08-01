const httpStatus = require('http-status');
const { Room } = require('../models');
const { statuses } = require('../config/statuses');
const ApiError = require('../utils/ApiError');
const randomNameGenerate = require('../utils/randomName');

/**
 * Create a user
 * @returns {Promise<User>}
 */
const createRoom = async () => {
  let roomName = randomNameGenerate();
  while (!Room.isNameTaken(roomName)) {
    roomName = randomNameGenerate();
  }
  // TODO: Create socket room as well
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
  // TODO: Add user to the socket room
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
  // TODO: Start game from socket
  await room.save();
  return room;
};

module.exports = {
  createRoom,
  getRoomById,
  getRoomByName,
  joinRoom,
  startGame,
};
