const _ = require('lodash');

module.exports = function (cards, deckSize) {
  const uniqueCards = _.uniqBy(cards);
  const halfSize = parseInt(deckSize / 2);
  const halfCards = uniqueCards.slice(0, halfSize);

  while (halfCards.length !== halfSize) {
    halfCards.push(_.sample(cards));
  }

  return _.shuffle(_.concat(halfCards, halfCards));
};
