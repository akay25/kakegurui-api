const config = require('../config/config');
const Queue = require('bull');

const playerChangeQueue = new Queue('Player switch queue', { redis: config.redis });

module.exports = {
  playerChangeQueue,
};
