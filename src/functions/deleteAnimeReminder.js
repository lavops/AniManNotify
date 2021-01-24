const db = require('../../db/database-config');
const { MessageEmbed } = require('discord.js');

const deleteAnimeReminder = async (msg) => {

    const malID = msg.content;
    const channelID = msg.channel.id;

    db.all("SELECT * FROM animeReminder WHERE (malID = ? AND channelID = ?)", [parseInt(malID), channelID], (error, row) => {
        
        if (error || row.length == 0) {
            const embed = new MessageEmbed().setTitle("There's no reminder for that anime on your channel.");
            msg.channel.send(embed);
        }
        else{
            db.run("DELETE FROM animeReminder WHERE (malID = ? AND channelID = ?)", [parseInt(malID), channelID]);
            const embed = new MessageEmbed().setTitle("Succesfully deleted that reminder.");
            msg.channel.send(embed);
        }
    });
}

module.exports = deleteAnimeReminder