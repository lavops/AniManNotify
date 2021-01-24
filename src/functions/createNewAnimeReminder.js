const db = require('../../db/database-config');
const { MessageEmbed } = require('discord.js');

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
                    // There's no reminder for this anime on this channel
                    // We will make one right now

                    db.run("INSERT INTO animeReminder (malID, username, userID, channelID) VALUES (?, ?, ?, ?)", [malID, username, userID, channelID]);
                    // Succesfully added new reminder

                    // Send embed
                    str = "Succesfully added new anime reminder.\n";
                    str += "Lastest episode is " + anime.currentEpisode + ". We will notify you when next one come's out.";
                    
                    const embed = new MessageEmbed()
                        .setTitle(anime.name)
                        .setColor(0xff0000)
                        .setDescription(str)
                        .setURL('https://myanimelist.net/anime/' + anime.malID)
                        .setThumbnail(anime.image);
                    
                    msg.channel.send(embed);
                }
                else {
                    // You already have this reminder on your channel

                    // SEND EMBED
                    const embed = new MessageEmbed().setTitle('You already have this reminder on your channel.');
                    msg.channel.send(embed);
                }
            });
        }
        else {
            // That anime is not currently airing

            // Send embed
            const embed = new MessageEmbed().setTitle('That anime is not currently airing.');
            msg.channel.send(embed);
        }
    });
}

module.exports = createNewAnimeReminder