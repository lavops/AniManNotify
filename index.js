const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const { Mangadex } = require('mangadex-api')
const { token, prefix} = require('./config.json');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {

    Mangadex.manga.getManga(msg.content).then((manga) => {
        
        //console.log(manga);

        Mangadex.manga.getMangaChapters(msg.content).then(({ chapters, groups }) => {
            
            //console.log(chapters[5]);

            var str = "";
            var i = 0;
            for (i = 0; i < chapters.length; i++) {

                if(chapters[i].language === 'gb'){
                    str += "Last chapter is " + chapters[i].chapter + ". We will notify you when next one come's out.";
                    break;
                }
            }

            const embed = new MessageEmbed()
            .setTitle(manga.title)
            .setColor(0xff0000)
            .setDescription(str)
            .setURL('https://mangadex.org/title/' + manga.id)
            .setImage(manga.mainCover);

            msg.reply(embed);
        })

        
    });

});

client.login(token);