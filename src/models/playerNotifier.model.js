const mongoose = require('mongoose');
const config = require('../config/config');

// Create a new mongoose model
const PlayerNotifierSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      lowercase: true,
      trim: true,
    },
  },
  { _id: false, timestamps: true }
);

PlayerNotifierSchema.index({ createdAt: 1 }, { expireAfterSeconds: config.MAX_WAIT_FOR_PLAYER });

/**
 * @typedef PlayerNotifier
 */
const PlayerNotifier = mongoose.model('PlayerNotifier', PlayerNotifierSchema);
module.exports = PlayerNotifier;
