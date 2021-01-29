const db = require('../../db/database-config');
const { MessageEmbed } = require('discord.js');
var moment = require('moment');

const listAnimeReminder = async (msg) => {
    const channelID = msg.channel.id;
    var str = "";
    db.serialize(() => {
        db.all("SELECT AR.*, A.*  FROM animeReminder as AR LEFT JOIN anime as A ON AR.malID = A.malID WHERE AR.channelID = ? ORDER BY A.airingAt", [channelID], (error, reminders) => {
        
            if (error || !reminders) {
                return console.log('Error or no reminder found');
            }

            const embed = new MessageEmbed();
            let names = "";
            let episodes = "";
            let malIDs = "";
            let airingAt = ""
            for(let i = 0; i < reminders.length; i++){
                malIDs += "" + reminders[i].malID + "\n";
                episodes += "" + reminders[i].currentEpisode + "    next in " + moment.unix(reminders[i].airingAt).fromNow(true) + "\n";
                if(reminders[i].name.length > 50){
                    names += "" + reminders[i].name.slice(0, 47) + "...\n";
                }
                else{
                    names += "" + reminders[i].name + "\n";
                }
                airingAt += moment.unix(reminders[i].airingAt).fromNow(true) + "\n";
            }

            if(names == "" && episodes == "" && malID == ""){
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
            
            msg.channel.send(embed);
        });
    });
}

module.exports = listAnimeReminder