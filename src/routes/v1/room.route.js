const express = require('express');
const roomController = require('../../controllers/room.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/:roomId', roomController.getRoom);
router.post('/create', roomController.createRoom);
router.post('/join', roomController.joinRoom);
router.route('/leave').post(auth('room'), roomController.leaveGame);
router.route('/start-game').post(auth('startGame'), roomController.startGame);

module.exports = router;
