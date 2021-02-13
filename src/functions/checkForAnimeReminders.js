// Imports
const client = require('../discord-config')
const { MessageEmbed } = require('discord.js')
const db = require('../../db/database-config')

const checkForAnimeReminders = () => {

    db.prepare("CREATE TABLE IF NOT EXISTS messageNotSentError (timestamp INTEGER, username TEXT, userID INTEGER, channelID INTEGER, message TEXT)").run().finalize();

    db.serialize(() => {
        // Select all messages older than the current dateTime
        db.each("SELECT malID, name, image, totalEpisodes, currentEpisode, airingAt FROM anime WHERE DATETIME(airingAt, 'unixepoch') < DATETIME()", (error, anime) => {
            if (error || !anime) {
                return console.log('Error or no row found')
            }
            // PRINT new anime in console
            // Add new values to animes
            console.log(anime.name + " has new episode.");
            anime.currentEpisode = anime.currentEpisode + 1;
            anime.airingAt = anime.airingAt + 604800;
            
            //NOTIFY all channels about new Anime
            db.each("SELECT malID, username, userID, channelID FROM animeReminder WHERE malID = ?", [anime.malID], (error, reminder) => {
                if (error || !reminder) {
                    return console.log('Error or no row found')
                }
                //console.log(reminder);
                str = "New episode is out in Japan.\n";
                if(anime.totalEpisodes != null)
                    str += "Current episode is " + anime.currentEpisode + "/"+ anime.totalEpisodes +". We will notify you when next one come's out.";
                else
                    str += "Current episode is " + anime.currentEpisode + "/?. We will notify you when next one come's out.";

                const embed = new MessageEmbed()
                    .setTitle(anime.name)
                    .setColor(0xff0000)
                    .setDescription(str)
                    .setURL('https://myanimelist.net/anime/' + anime.malID)
                    .setImage(anime.image);
                    
                const channel = client.channels.cache.get(reminder.channelID);

                try {
                    channel.send(embed).catch(error => {
                        // ERROR -> User is not friend with a bot anymore
                        // DELETE from reminders and LOG that
                        db.run("DELETE FROM animeReminder WHERE channelID = ?", [reminder.channelID]);
                        let timestamp = Date.now();
                        let message = "Error in private message's. User and bot are not friends any more.";
                        db.run("INSERT INTO messageNotSentError (timestamp, username, userID, channelID, message) VALUES (?, ?, ?, ?, ?)", [timestamp, reminder.username, reminder.userID, reminder.channelID, message]);
                        console.log("ERROR WHILE SENDING MESSAGE.");
                    });
                } catch (error) {
                    // ERROR -> Someone kicked bot from channel
                    // DELETE from reminders and LOG that
                    db.run("DELETE FROM animeReminder WHERE channelID = ?", [reminder.channelID]);
                    let timestamp = Date.now();
                    let message = "Error in channel message's. Someone kicked bot.";
                    db.run("INSERT INTO messageNotSentError (timestamp, username, userID, channelID, message) VALUES (?, ?, ?, ?, ?)", [timestamp, reminder.username, reminder.userID, reminder.channelID, message]);
                    console.log("ERROR WHILE SENDING MESSAGE.");
                }
            });

            // UPDATE reminders
            // DELETE if Anime is finished
            if(anime.totalEpisodes == null || anime.totalEpisodes > anime.currentEpisode)
                db.run("UPDATE anime SET currentEpisode = ?, airingAt = ? WHERE malID = ?", [anime.currentEpisode, anime.airingAt, anime.malID]);
            else if(anime.totalEpisodes == anime.currentEpisode){
                db.run("DELETE FROM anime WHERE malID = ?", [anime.malID]);
                db.run("DELETE FROM animeReminder WHERE malID = ?", [anime.malID]);
            }
        })    
    })
}

module.exports = checkForAnimeReminders