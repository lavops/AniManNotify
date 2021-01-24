// Imports
const db = require('../../db/database-config');
const fetch = require('node-fetch');
const currentlyAiringAnime = require('currently-airing-anime');
global.fetch = fetch;

const checkAnimeDatabase = async (malID, callback) => {
    db.serialize(() => {
        db.prepare("CREATE TABLE IF NOT EXISTS anime (malID INTEGER, name TEXT, image TEXT, totalEpisodes INTEGER, currentEpisode INTEGER, airingAt INTEGER)").run().finalize();

        db.all("SELECT * FROM anime WHERE malID = ?", [parseInt(malID)], (error, row) => {
            // If there's no malID in our database
            // Check if anime is airing and then add it to database
            if (error || row.length == 0) {
                // There's no that anime at moment in our database
                // We will check if that anime is airing now

                // Possible configuration options
                // currentlyAiringAnime({
                //     season: 'SUMMER', // 'WINTER', 'SPRING', 'SUMMER', 'FALL'
                //     seasonYear: 2017,
                //     malIdIn: [34914, 34902, 34881], // Include only these MyAnimeList Ids
                //     aniIdIn: [98292, 98291, 98251], // Include only these AniList ids
                //     sort: ['START_DATE'], // An array of sort options (see below for all sort options)
                //     includeSchedule: true // Include an array of the airing schedule
                // })
                currentlyAiringAnime({
                    malIdIn: [malID]
                }).then(({shows, next}) => {
                    try{
                        // Some times currently-airing-anime api 
                        // returns 2 objets if returns 2 first one is a junk
                        if(shows.length > 1){
                            console.log(shows[1].title.english);
                            animeName = shows[1].title.english;
                            image = shows[1].coverImage.large;
                            totalEpisodes = shows[1].episodes;
                            currentEpisode = shows[1].nextAiringEpisode.episode;
                            airingAt = shows[1].nextAiringEpisode.airingAt;
                        }
                        else{
                            animeName = shows[0].title.english;
                            image = shows[0].coverImage.large;
                            totalEpisodes = shows[0].episodes;
                            currentEpisode = shows[0].nextAiringEpisode.episode;
                            airingAt = shows[0].nextAiringEpisode.airingAt;
                        }
                        
                        // Insert new anime in database
                        db.run("INSERT INTO anime (malID, name, image, totalEpisodes, currentEpisode, airingAt) VALUES (?, ?, ?, ?, ?, ?)", [malID, animeName, image, totalEpisodes, currentEpisode, airingAt]);
                        
                        // Succesfully added new anime in our database
                        var anime = {
                            valid : true,
                            malID : malID,
                            name : animeName,
                            image : image,
                            totalEpisodes : totalEpisodes,
                            currentEpisode : currentEpisode,
                            airingAt : airingAt
                        };

                        callback(anime);
                    }
                    catch {
                        // That anime is not currently airing
                        var anime = {
                            valid : false,
                            malID : null,
                            name : null,
                            image : null,
                            totalEpisodes : null,
                            currentEpisode : null,
                            airingAt : null
                        };

                        callback(anime);
                    }
                }).catch((error) => {
                    // That anime is not currently airing
                    var anime = {
                        valid : false,
                        malID : null,
                        name : null,
                        image : null,
                        totalEpisodes : null,
                        currentEpisode : null,
                        airingAt : null
                    };

                    callback(anime);
                });
            }
            else {
                // That anime exists in our database
                var anime = {
                    valid : true,
                    malID : row[0].malID,
                    name : row[0].name,
                    image : row[0].image,
                    totalEpisodes : row[0].totalEpisodes,
                    currentEpisode : row[0].currentEpisode,
                    airingAt : row[0].airingAt
                };

                callback(anime);
            }
        });
    });
}

module.exports = checkAnimeDatabase