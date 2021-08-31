const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { statuses } = require('../config/statuses');

const themeSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  cover: {
    type: String,
    required: true,
  },
  cards: {
    type: [Object],
    default: [],
  },
});

// add plugin that converts mongoose to json
themeSchema.plugin(toJSON);

/**
 * @typedef Theme
 */
const Theme = mongoose.model('Theme', themeSchema);

module.exports = Theme;
