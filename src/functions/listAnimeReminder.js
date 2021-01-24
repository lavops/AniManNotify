const db = require('../../db/database-config');
const { MessageEmbed } = require('discord.js');


const listAnimeReminder = async (msg) => {
    const channelID = msg.channel.id;
    var str = "";
    db.serialize(() => {
        db.all("SELECT AR.*, A.*  FROM animeReminder as AR LEFT JOIN anime as A ON AR.malID = A.malID WHERE AR.channelID = ?", [channelID], (error, reminders) => {
        
            if (error || !reminders) {
                return console.log('Error or no reminder found');
            }

            for(let i = 0; i < reminders.length; i++){
                str += "MAL ID: " + reminders[i].malID + " Name: " + reminders[i].name + " Episode: " + reminders[i].currentEpisode + "\n";
            }

            if(str == "")
                str += "You don't have any anime reminder on your channel.";
            
            const embed = new MessageEmbed()
                .setTitle("Anime reminders:")
                .setDescription(str);
            
            msg.channel.send(embed);
        });
    });

    // db.each("SELECT * FROM animeReminder WHERE channelID = ?", [channelID], (error, reminder) => {
    
    //     if (error || !reminder) {
    //         return console.log('Error or no reminder found');
    //     }
        
    //     db.each("SELECT * FROM anime WHERE malID = ?", [reminder.malID], (error, anime) => {
    //         if (error || !anime) {
    //             return console.log('Error or no anime found');
    //         }

    //         str += "MAL ID: " + anime.malID + " Name: " + anime.name + " Episode: " + anime.currentEpisode + "\n";
    //     });
        
    // });

    // if(str == "")
    //     str += "You don't have any anime reminder on your channel.";
    
    // const embed = new MessageEmbed()
    //     .setTitle("Anime reminders:")
    //     .setDescription(str);
    
    // msg.channel.send(embed);
}

module.exports = listAnimeReminder