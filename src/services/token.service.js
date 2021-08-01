const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../config/config');
const { Token } = require('../models');

/**
 * Generate token
 * @param {ObjectId} user
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = async (user, secret = config.jwt.secret) => {
  const token = jwt.sign(user, secret);
  const tokenDoc = await Token.create({
    token,
  });
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await Token.findOne({ token });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

module.exports = {
  generateToken,
  verifyToken,
};
