const mongoose = require('mongoose');
const app = require('./app');
const PlayerNotifier = require('./models/playerNotifier.model');
const { updatePlayerForRoom } = require('./services/room.service');
const config = require('./config/config');
const logger = require('./config/logger');
const socketIO = require('./socket-io');

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(async () => {
  logger.info('Connected to MongoDB');
  try {
    // Create collection else it will throw error
    await mongoose.connection.createCollection('playernotifiers');
  } catch (e) {}
  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });

  // Create a change stream. The 'change' event gets emitted when there's a
  // change in the database
  PlayerNotifier.watch().on('change', async (data) => {
    if (data.operationType === 'delete') {
      const roomID = data.documentKey._id;
      await updatePlayerForRoom(roomID);
    }
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
