const { Theme } = require('../models');
const _ = require('lodash');

/**
 * Get themes
 * @returns {Promise<Theme[]>}
 */
const getThemes = async () => {
  return await Theme.find({}, { name: 1 });
};

module.exports = {
  getThemes,
};
