const httpStatus = require('http-status');
const { roomService } = require('.');
const { User } = require('../models');
const { generateToken, saveToken } = require('../services/token.service');
const ApiError = require('../utils/ApiError');

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = (room, userId) => {
  for (const player of room.players) {
    if (player.id === userId) {
      player.roomId = room.id;
      return player;
    }
  }
  throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
};

/**
 * Get user by id
 * @param {ObjectId} id
 * * @param {ObjectId} roomId
 * @returns {Promise<User>}
 */
const getUserByIdandRoomId = async (roomId, userId) => {
  const room = await roomService.getRoomById(roomId);
  return getUserById(room, userId);
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const createUserToken = async (room, userId) => {
  const player = getUserById(room, userId);
  const tokenDoc = await generateToken(player);
  return tokenDoc.token;
};

module.exports = {
  getUserById,
  createUserToken,
  getUserByIdandRoomId,
};
