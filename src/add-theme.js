const mongoose = require('mongoose');
const config = require('./config/config');
const logger = require('./config/logger');
const Theme = require('./models/theme.model');

const TOTAL_CARDS = 500;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(async () => {
    logger.info('Connected to MongoDB');

    // Write to db
    const cards = [];
    for (let i = 1; i <= TOTAL_CARDS; i++) {
        const url = `https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${String(i).padStart(3, '0')}.png`;
        cards.push(url);
    }

    const t = Theme();
    t.name = 'Pokemon';
    t.cover =
        'https://kakegurui.cometapp.moe/img/pokeball.jpg';
    t.cards = cards;
    await t.save();
});
