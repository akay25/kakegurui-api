const { v4: uuidv4 } = require('uuid');
const httpStatus = require('http-status');
const ObjectId = require('mongoose').Types.ObjectId;
const catchAsync = require('../utils/catchAsync');
const { themeService } = require('../services');

const getThemes = catchAsync(async (req, res) => {
  const themes = await themeService.getThemes();
  res.send(themes);
});

module.exports = {
  getThemes,
};
