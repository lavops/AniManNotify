// Imports
const client = require('../discord-config')
const { MessageEmbed } = require('discord.js')
const db = require('../../db/database-config')

const checkForAnimeReminders = () => {
    console.log("Checking for reminder!");  
    db.serialize(() => {
        // Select all messages older than the current dateTime
        db.each("SELECT malID, name, image, totalEpisodes, currentEpisode, airingAt FROM anime WHERE DATETIME(airingAt, 'unixepoch') < DATETIME()", (error, anime) => {
            if (error || !anime) {
                return console.log('Error or no row found')
            }
            console.log(anime);
            anime.currentEpisode = anime.currentEpisode + 1;
            anime.airingAt = anime.airingAt + 604800;
            
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
                channel.send(embed);
            });

            if(anime.totalEpisodes == null || anime.totalEpisodes > anime.currentEpisode)
                db.run("UPDATE anime SET currentEpisode = ?, airingAt = ? WHERE malID = ?", [anime.currentEpisode, anime.airingAt, anime.MALID]);
            else if(anime.totalEpisodes == anime.currentEpisode){
                db.run("DELETE FROM anime WHERE malID = ?", [anime.malID]);
                db.run("DELETE FROM animeReminder WHERE malID = ?", [anime.malID]);
            }
        })    
    })
}

module.exports = checkForAnimeReminders