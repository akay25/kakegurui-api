const config = require('../config/config');
const QUEUES = require('./queues');
const { getRunningRoomById } = require('../services/room.service');

// WOrker code, will execute with the node server code1
QUEUES.playerChangeQueue.process(async function (job, done) {
  const { data } = job;
  const socketIO = global['_io'];
  const room = await getRunningRoomById(data.roomId);

  if (!!room) {
    socketIO.to(room.id).emit('flip_all_cards_down');
    room.selectedCard = -1;
    room.prevSelectedCard = -1;
    room.currentPlayer++;
    if (room.currentPlayer >= room.players.length) {
      room.currentPlayer = 0;
    }
    const t = new Date();
    t.setSeconds(t.getSeconds() + config.MAX_WAIT_FOR_PLAYER_IN_SECS);
    room.nextTurnTime = t;

    await room.save();

    socketIO.to(room.id).emit('player_changed', { player: room.players[room.currentPlayer], nextTurnTime: t });
    // Re-add thee job if it's running
    await QUEUES.playerChangeQueue.add(job.data, { delay: config.MAX_WAIT_FOR_PLAYER_IN_SECS * 1000 });
  }

  // call done when finished
  done();
});
