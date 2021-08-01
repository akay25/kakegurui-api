const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');
/**
 * Create random string composed of random color, adjective and animal
 * @returns {String}
 */
const randomName = () => {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    length: 2,
    separator: '-',
    style: 'lowerCase',
  });
};

module.exports = randomName;
