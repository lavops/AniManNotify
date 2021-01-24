const { MessageEmbed } = require('discord.js')

const createEmbed = (anime, dontMake, message) => {

    const embed = new MessageEmbed()
        .setTitle(message);
    if (!dontMake) {
        str = "Succesfully added new anime reminder.\n";
        str += "Lastest episode is " + anime.currentEpisode + ". We will notify you when next one come's out.";
        embed.setTitle(anime.name)
            .setColor(0xff0000)
            .setDescription(str)
            .setURL('https://myanimelist.net/anime/' + anime.malID)
            .setThumbnail(anime.image);
    }

    return embed;
}

module.exports = createEmbed