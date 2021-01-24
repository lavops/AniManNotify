const checkAnimeDatabase = require('./checkAnimeDatabase');

const createNewAnimeReminder = async (msg) => {
    data = await checkAnimeDatabase(msg.content);
}

module.exports = createNewAnimeReminder