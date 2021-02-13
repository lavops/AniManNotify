const db = require('../../db/database-config');
const { MessageEmbed } = require('discord.js');

// Functions
const checkAnimeDatabase = require('./checkAnimeDatabase');

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
            db.prepare("CREATE TABLE IF NOT EXISTS messageNotSentError (timestamp INTEGER, username TEXT, userID INTEGER, channelID INTEGER, message TEXT)").run().finalize();

            db.all("SELECT * FROM animeReminder WHERE (malID = ? AND channelID = ?)", [parseInt(malID), channelID], (error, row) => {
                
                if (error || row.length == 0) {
                    // There's no reminder for this anime on this channel
                    // We will make one right now

                    db.run("INSERT INTO animeReminder (malID, username, userID, channelID) VALUES (?, ?, ?, ?)", [malID, username, userID, channelID]);
                    // Succesfully added new reminder

                    // Send embed
                    str = "Succesfully added new anime reminder.\n";
                    if(anime.totalEpisodes != null)
                        str += "Lastest episode is " + anime.currentEpisode + "/"+ anime.totalEpisodes +". We will notify you when next one come's out.";
                    else
                        str += "Lastest episode is " + anime.currentEpisode + "/?. We will notify you when next one come's out.";

                    const embed = new MessageEmbed()
                        .setTitle(anime.name)
                        .setColor(0xff0000)
                        .setDescription(str)
                        .setURL('https://myanimelist.net/anime/' + anime.malID)
                        .setThumbnail(anime.image);
                    
                    
                    try {
                        msg.channel.send(embed);
                    } catch (error) {
                        // ERROR while ADDING Animes from database
                        let timestamp = Date.now();
                        let message = "Error while adding Anime. Maybe some premissions fault.";
                        db.run("INSERT INTO messageNotSentError (timestamp, username, userID, channelID, message) VALUES (?, ?, ?, ?, ?)", [timestamp, username, userID, channelID, message]);
                        console.log("ERROR WHILE ADDING ANIMEs.");
                    }
                }
                else {
                    // You already have this reminder on your channel

                    // SEND EMBED
                    const embed = new MessageEmbed().setTitle('You already have this reminder on your channel.');
                    
                    try {
                        msg.channel.send(embed);
                    } catch (error) {
                        // ERROR while ADDING Animes from database
                        let timestamp = Date.now();
                        let message = "Error while adding Anime. Maybe some premissions fault.";
                        db.run("INSERT INTO messageNotSentError (timestamp, username, userID, channelID, message) VALUES (?, ?, ?, ?, ?)", [timestamp, username, userID, channelID, message]);
                        console.log("ERROR WHILE ADDING ANIMEs.");
                    }
                }
            });
        }
        else {
            // That anime is not currently airing

            // Send embed
            const embed = new MessageEmbed().setTitle('That anime is not currently airing.');
            
            try {
                msg.channel.send(embed);
            } catch (error) {
                // ERROR while ADDING Animes from database
                let timestamp = Date.now();
                let message = "Error while adding Anime. Maybe some premissions fault.";
                db.run("INSERT INTO messageNotSentError (timestamp, username, userID, channelID, message) VALUES (?, ?, ?, ?, ?)", [timestamp, username, userID, channelID, message]);
                console.log("ERROR WHILE ADDING ANIMEs.");
            }
        }
    });
}

module.exports = createNewAnimeReminder