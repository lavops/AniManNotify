const db = require('../../db/database-config');
const { MessageEmbed } = require('discord.js');
var moment = require('moment');

const listAnimeReminder = async (msg) => {
    const channelID = msg.channel.id;
    const userID = msg.author.id;
    const username = msg.author.username;
    var str = "";

    db.prepare("CREATE TABLE IF NOT EXISTS messageNotSentError (timestamp INTEGER, username TEXT, userID INTEGER, channelID INTEGER, message TEXT)").run().finalize();

    db.serialize(() => {
        db.all("SELECT AR.*, A.*  FROM animeReminder as AR LEFT JOIN anime as A ON AR.malID = A.malID WHERE AR.channelID = ? ORDER BY A.airingAt", [channelID], (error, reminders) => {
            const embed = new MessageEmbed();

            if (error || !reminders) {
                embed.setDescription("You don't have any anime reminder on your channel.\n\n[Vote](https://top.gg/bot/799392333677854751/vote) - [Support Channel](https://discord.com/invite/QV8q9BQXpW)");
                
                try {
                    msg.channel.send(embed); 
                } catch (error) {
                    // ERROR while LISTING Animes from database
                    let timestamp = Date.now();
                    let message = "Error while listing Animes. Maybe some premissions fault.";
                    db.run("INSERT INTO messageNotSentError (timestamp, username, userID, channelID, message) VALUES (?, ?, ?, ?, ?)", [timestamp, username, userID, channelID, message]);
                    console.log("ERROR WHILE LISTING ANIMEs.");
                }
                return console.log('Error or no reminder found');
            }
            
            let names = "";
            let episodes = "";
            let malIDs = "";
            let airingAt = "";
            for(let i = 0; i < reminders.length; i++){
                
                if(names.length + 48 < 1024){
                    malIDs += "" + reminders[i].malID + "\n";
                    episodes += "" + reminders[i].currentEpisode + ", next ep in " + moment.unix(reminders[i].airingAt).fromNow(true) + "\n";
                    airingAt += moment.unix(reminders[i].airingAt).fromNow(true) + "\n";
                    if(reminders[i].name.length > 48){
                        names += "" + reminders[i].name.slice(0, 45) + "...\n";
                    }
                    else{
                        names += "" + reminders[i].name + "\n";
                    }
                }
                else{
                    embed.setDescription("We can't fit all your animes in one message.")
                }
                
            }

            if(names == "" && episodes == "" && malIDs == ""){
                embed.setDescription("You don't have any anime reminder on your channel.")
            }
            else{
                embed.addFields(
                    {name: "MAL ID", value: malIDs, inline: true},
                    {name: "Anime", value: names, inline: true},
                    {name: "Episode", value: episodes, inline: true},
                )
            }

            // for(let i = 0; i < reminders.length; i++){
            //     str += "MAL ID: " + reminders[i].malID + " Name: " + reminders[i].name + " Episode: " + reminders[i].currentEpisode + "\n";
            // }

            // if(str == "")
            //     str += "You don't have any anime reminder on your channel.";
            
            // const embed = new MessageEmbed()
            //     .setTitle("Anime reminders:")
            //     .setDescription(str);
            
            try {
                msg.channel.send(embed);
            } catch (error) {
                // ERROR while LISTING Animes from database
                let timestamp = Date.now();
                let message = "Error while listing Animes. Maybe some premissions fault.";
                db.run("INSERT INTO messageNotSentError (timestamp, username, userID, channelID, message) VALUES (?, ?, ?, ?, ?)", [timestamp, username, userID, channelID, message]);
                console.log("ERROR WHILE LISTING ANIMEs.");
            }

            
        });
    });
}

module.exports = listAnimeReminder