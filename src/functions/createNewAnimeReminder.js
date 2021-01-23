const checkAnimeDatabase = require('./checkAnimeDatabase');
const fetch = require('node-fetch');
const currentlyAiringAnime = require('currently-airing-anime');
global.fetch = fetch;


const createNewAnimeReminder = (msg) => {
    checkAnimeDatabase(msg.content);
}

module.exports = createNewAnimeReminder