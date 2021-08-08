const express = require('express');
const socketIO = require('socket.io');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const socketAuthMiddleware = require('./middlewares/socketAuth');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');

const app = express();
const http = require('http');

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

// Use http server to handle socket
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Load socket middleware
io.use(socketAuthMiddleware);

const isValidSocketRequest = (socket) => {
  // TODO: CHeck for user and room and do forward
  // console.log(token);
  return true;
};

io.use((socket, next) => {
  if (isValidSocketRequest(socket)) {
    next();
  } else {
    const err = new Error('Not authorized');
    err.data = { content: 'Please join some room' };
    next(err);
  }
});

// Load socket routes
io.on('connection', function (socket) {
  // Join room event
  socket.on('join_room', function () {
    const user = socket.request.user;
    // Make the user join the given room
    socket.join(user.roomId);
    // Send broad cast event to all members
    socket.to(user.roomId).emit('room_updated', user);
    socket.emit('room_joined');
  });

  // Leave room event
  socket.on('leave_room', function () {
    const user = socket.request.user;
    // Make the user join the given room
    socket.leave(user.roomId);
    // Send broad cast event to all members
    socket.to(user.roomId).emit('room_updated', user);
    socket.emit('room_left');
  });

  // Socket disconnect
  socket.on('disconnect', function () {
    const user = socket.request.user;
    socket.to(user.roomId).emit('room_updated', user);
  });
});

module.exports = server;
