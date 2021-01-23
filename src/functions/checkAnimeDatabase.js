const db = require('../../db/database-config');
const fetch = require('node-fetch');
const currentlyAiringAnime = require('currently-airing-anime');
global.fetch = fetch;

const checkAnimeDatabase = (malID) => {
    db.serialize(() => {
        db.prepare("CREATE TABLE IF NOT EXISTS anime (malID INTEGER, name TEXT, image TEXT, totalEpisodes INTEGER, currentEpisode INTEGER, airingAt INTEGER)").run().finalize();

        db.run("SELECT malID FROM anime WHERE malID = ?", [malID], (error, row) => {
            if (error || !row) {
                console.log("~ There's no that anime at moment in our database.");
                console.log("~ We will check if that anime is airing now.");

                currentlyAiringAnime({
                    malIdIn: [malID]
                }).then(({shows, next}) => {
                    
                    animeName = shows[1].title.english;
                    image = shows[1].coverImage.large;
                    totalEpisodes = shows[1].episodes;
                    currentEpisode = shows[1].nextAiringEpisode.episode;
                    airingAt = shows[1].nextAiringEpisode.airingAt;

                    db.run("INSERT INTO anime (malID, name, image, totalEpisodes, currentEpisode, airingAt) VALUES (?, ?, ?, ?, ?, ?)", [malID, animeName, image, totalEpisodes, currentEpisode, airingAt]);
                    console.log("~ Succesfully added new anime in our database.");
                    return true;

                }).catch(error => {
                    console.log("~ That anime is not currently airing.");
                    return false;
                })
            }
            else {
                console.log("~ That anime exists in our database.");
                return true;
            }
        });
    });
}

module.exports = checkAnimeDatabase