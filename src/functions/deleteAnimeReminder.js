const db = require('../../db/database-config');
const { MessageEmbed } = require('discord.js');

const deleteAnimeReminder = async (msg) => {

    const malID = msg.content;
    const channelID = msg.channel.id;
    const userID = msg.author.id;
    const username = msg.author.username;

    db.prepare("CREATE TABLE IF NOT EXISTS messageNotSentError (timestamp INTEGER, username TEXT, userID INTEGER, channelID INTEGER, message TEXT)").run().finalize();
    // Check if Anime exists in your channel
    db.all("SELECT * FROM animeReminder WHERE (malID = ? AND channelID = ?)", [parseInt(malID), channelID], (error, row) => {
        
        if (error || row.length == 0) {
            const embed = new MessageEmbed()
            .setTitle("There's no reminder for that anime on your channel.")
            .setDescription("[Vote](https://top.gg/bot/799392333677854751/vote) - [Support Channel](https://discord.com/invite/QV8q9BQXpW)");
            
            try {
                msg.channel.send(embed);
            } catch (error) {
                // ERROR while DELETING Anime from database
                let timestamp = Date.now();
                let message = "Error while deleting Anime. Maybe some premissions fault.";
                db.run("INSERT INTO messageNotSentError (timestamp, username, userID, channelID, message) VALUES (?, ?, ?, ?, ?)", [timestamp, username, userID, channelID, message]);
                console.log("ERROR WHILE DELETING ANIME.");
            }
        }
        else{
            db.run("DELETE FROM animeReminder WHERE (malID = ? AND channelID = ?)", [parseInt(malID), channelID]);
            const embed = new MessageEmbed()
            .setTitle("Succesfully deleted that reminder.")
            .setDescription("[Vote](https://top.gg/bot/799392333677854751/vote) - [Support Channel](https://discord.com/invite/QV8q9BQXpW)");

            try {
                msg.channel.send(embed);
            } catch (error) {
                // ERROR while DELETING Anime from database
                let timestamp = Date.now();
                let message = "Error while deleting Anime. Maybe some premissions fault.";
                db.run("INSERT INTO messageNotSentError (timestamp, username, userID, channelID, message) VALUES (?, ?, ?, ?, ?)", [timestamp, username, userID, channelID, message]);
                console.log("ERROR WHILE DELETING ANIME.");
            }
            
        }
    });
}

module.exports = deleteAnimeReminder