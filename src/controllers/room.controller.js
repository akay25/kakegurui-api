const { v4: uuidv4 } = require('uuid');
const httpStatus = require('http-status');
const ObjectId = require('mongoose').Types.ObjectId;
const catchAsync = require('../utils/catchAsync');
const { roomService, userService } = require('../services');

const createRoom = catchAsync(async (req, res) => {
  const newRoom = await roomService.createRoom();
  const { name, profilePic } = req.body;
  const user = {
    id: uuidv4(),
    name,
    profilePic,
    score: 0.0,
    owner: false,
  };

  const response = await roomService.joinRoom(newRoom.name, user);
  const token = await userService.createUserToken(response.room, user.id);
  res.status(httpStatus.CREATED).send({ ...response, token });
});

const getRoom = catchAsync(async (req, res) => {
  let room = null;
  if (ObjectId.isValid(req.params.roomId)) {
    room = await roomService.getRoomById(req.params.roomId);
  } else {
    room = await roomService.getRoomByName(req.params.roomId);
  }
  res.send(room);
});

const joinRoom = catchAsync(async (req, res) => {
  const { roomName, name, profilePic } = req.body;

  const user = {
    id: uuidv4(),
    name,
    profilePic,
    score: 0.0,
    owner: false,
  };

  const response = await roomService.joinRoom(roomName, user);
  const token = await userService.createUserToken(response.room, user.id);
  res.send({ ...response, token });
});

const startGame = catchAsync(async (req, res) => {
  const { roomName } = req.body;
  const room = await roomService.startGame(roomName);
  // TODO: Start socket serving from here
  res.send({ room });
});

module.exports = {
  createRoom,
  joinRoom,
  getRoom,
  startGame,
};
