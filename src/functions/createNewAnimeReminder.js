const db = require('../../db/database-config');

// Functions
const checkAnimeDatabase = require('./checkAnimeDatabase');
const createEmbed = require('./createEmbed');

const createNewAnimeReminder = async (msg) => {
    checkAnimeDatabase(msg.content, function(data){
        anime = data;

        if(anime.valid) {
            //console.log(msg);
            //msg.channel.send(anime.name);
            malID = anime.malID;
            channelID = msg.channel.id;
            userID = msg.author.id;
            username = msg.author.username;

            db.prepare("CREATE TABLE IF NOT EXISTS animeReminder (malID INTEGER, username TEXT, userID TEXT, channelID TEXT)").run().finalize();

            db.all("SELECT * FROM animeReminder WHERE (malID = ? AND channelID = ?)", [parseInt(malID), channelID], (error, row) => {
                
                if (error || row.length == 0) {
                    console.log("~ There's no reminder for this anime on this channel.");
                    console.log("~ We will make one right now.");

                    db.run("INSERT INTO animeReminder (malID, username, userID, channelID) VALUES (?, ?, ?, ?)", [malID, username, userID, channelID]);
                    console.log("~ Succesfully added new reminder.");

                    // SEND EMBED
                    const embed = createEmbed(anime, false, '');
                    msg.channel.send(embed);
                }
                else {
                    console.log("~ You already have this reminder on your channel.");

                    // SEND EMBED
                    const embed = createEmbed(anime, true, 'You already have this reminder on your channel.');
                    msg.channel.send(embed);
                }
            });
        }
        else {
            console.log("~ That anime is not currently airing.");

            // SEND EMBED
            const embed = createEmbed(anime, true, 'That anime is not currently airing.')
            msg.channel.send(embed);
        }
    });
}

module.exports = createNewAnimeReminder