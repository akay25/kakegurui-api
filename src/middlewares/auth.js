const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please join a room'));
  }
  req.user = user;

  if (requiredRights.length) {
    if (requiredRights.includes('startGame') && !user.owner) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Not allowed to start game'));
    } else if (requiredRights.includes('room') && !user.roomId) {
      // TODO: Check for existence of the room
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Not allowed to start game'));
    }
  }

  resolve();
};

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

module.exports = auth;
