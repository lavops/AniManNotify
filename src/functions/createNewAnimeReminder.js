const db = require('../../db/database-config');
const { MessageEmbed } = require('discord.js');
const Discord = require('discord.js');

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
                    str = "Succesfully added new anime reminder.\n\n";
                    str += `**Episode:** ${anime.currentEpisode}/${anime.totalEpisodes || `?`}\n\n`;

                    str += "[Vote](https://top.gg/bot/799392333677854751/vote) - [Support Channel](https://discord.com/invite/QV8q9BQXpW)";
                    const embed = new MessageEmbed()
                        .setTitle(anime.name)
                        //.setAuthor("AniMan Notify", "https://i.imgur.com/vIgALCX.jpg", "https://top.gg/bot/799392333677854751/vote")
                        //.setColor(0xff0000)
                        .setDescription(str)
                        //.addField("[Vote](https://top.gg/bot/799392333677854751/vote)")
                        .setURL('https://myanimelist.net/anime/' + anime.malID)
                        .setThumbnail(anime.image)
                        .setTimestamp();                    
                    
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