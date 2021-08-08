const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const verifyCallback = (req, resolve, reject) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please join a room'));
  }
  req.user = user;
  resolve();
};

const socketAuthMiddleware = ({ request }, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(request, resolve, reject))(request, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = socketAuthMiddleware;
