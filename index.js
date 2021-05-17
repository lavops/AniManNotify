const express = require('express');
const client = require('./src/discord-config')
require('dotenv').config();
const app = express();
const db = require('./db/database-config');
const AutoPoster = require('topgg-autoposter')
// const ap = AutoPoster(process.env.TOPGG_TOKEN, client)
// const { token, tokenTest } = require('./config.json');

// Functions import
const createNewAnimeReminder = require('./src/functions/createNewAnimeReminder');
const deleteAnimeReminder = require('./src/functions/deleteAnimeReminder');
const listAnimeReminder = require('./src/functions/listAnimeReminder');
const checkForAnimeReminders = require('./src/functions/checkForAnimeReminders');

// Confirm successful log in
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.user.setPresence({
        status: 'online',
        activity: {
            name: "Anime",
            type: "WATCHING",
        }
    });
});

// ap.on('posted', () => {
//     console.log(`Logged in as ${client.user.tag}!`);
//     console.log('Posted stats to Top.gg!')

//     client.user.setPresence({
//         status: 'online',
//         activity: {
//             name: "Anime",
//             type: "WATCHING",
//         }
//     });
// })

// Run checkForAnimeReminders every 5 minutes to scan DB for new episodes
setInterval(checkForAnimeReminders, 300000);

// Bot will use these commands
const commands = [
    {
        name: "addAnime",
        run: createNewAnimeReminder,
        permissions: ["EMBED_LINKS"]
    },
    {
        name: "deleteAnime",
        run: deleteAnimeReminder,
        permissions: ["EMBED_LINKS"]
    },
    {
        name: "listAnime",
        run: listAnimeReminder,
        permissions: ["EMBED_LINKS"]
    }
];

const prefix = '!';

// Parse reminder request, save to DB, DM confirmation to user
client.on('message', (msg) => {
    // Disallow commands requested by bots
    if (msg.bot) return;

    // If the bot has no permission to send messages in this channel, don't even attempt to send a message
    if (!msg.channel.type == "dm") {
        const botInGuild = msg.guild.me;
        if (!msg.channel.permissionsFor(botInGuild).has('SEND_MESSAGES')) return;
    }

    const args = msg.content.split(" ");
    if (args.length == 0 || args[0].charAt(0) !== prefix) return;

    const commandName = args.shift().substr(prefix.length);

    // Search from the command name (in case sensitive)
    const commandInfo = commands.find(item => item.name.toLowerCase() == commandName.toLowerCase());
    if (commandInfo) {
        if (commandInfo.permissions && commandInfo.permissions.length > 0 && !msg.channel.type == "dm") {
            /* If it doesn't have the permission in the channel, return a small message with feedback
            Note: If you intend to use permissions like 'BAN_MEMBERS' rework this, to work with guild permissions too */
            const botInGuild = msg.guild.me;

            if (!msg.channel.permissionsFor(botInGuild).has(commandInfo.permissions)) {
                return msg.channel.send(`I am missing needed permissions:\n\`${commandInfo.permissions.join("\`, ")}\``)
            }
        }

        const removeCommand = `${prefix}${commandName} `;
        msg.content = msg.content.replace(removeCommand, "");

        // Run the command and pass the message information along
        commandInfo.run(msg).catch(error => console.error(`An error occurred while running a command: ${error}`));
    }
});

// Log bot using into discord using your token
client.login(process.env.TOKEN).then(() => {
    console.log('Succesfully logged in using token!');
});

app.get('/', function (req, res) {
    res.send('AniMan Notfy Discord Bot');
})

app.get('/anime', function (req, res) {
    db.serialize(() => {
        db.all("SELECT * FROM anime", (error, shows) => {
            if (error || shows.length == 0) {
                res.send(null);
            }
            var result = JSON.stringify(shows);
            res.send(result);
        });
    });
})

app.listen(process.env.PORT, () => {
    console.log(`App listening at ${process.env.PORT} PORT`);
})