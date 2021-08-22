const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { statuses } = require('../config/statuses');

const roomSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: statuses,
      default: statuses[0],
    },
    players: {
      type: [Object],
      default: [],
    },
    cards: {
      type: [Object],
      default: [],
      select: false,
    },
    deckRange: {
      type: Number,
      default: 0,
    },
    currentPlayer: {
      type: Number,
      default: -1,
    },
    selectedCard: {
      type: Number,
      default: -1,
    },
    prevSelectedCard: {
      type: Number,
      default: -1,
    },
    removedCardIndices: {
      type: [Number],
      default: [],
    },
    nextTurnTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
roomSchema.plugin(toJSON);

/**
 * Check if email is taken
 * @param {string} name - The user's email
 * @returns {Promise<boolean>}
 */
roomSchema.statics.isNameTaken = async function (name) {
  const user = await this.findOne({ name });
  return !!user;
};

/**
 * @typedef Room
 */
const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
