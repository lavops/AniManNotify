const express = require('express');
const client = require('./src/discord-config')
require('dotenv').config();
const app = express();
//const { token, tokenTest } = require('./config.json');

// Functions import
const createNewAnimeReminder = require('./src/functions/createNewAnimeReminder');
const deleteAnimeReminder = require('./src/functions/deleteAnimeReminder');
const listAnimeReminder = require('./src/functions/listAnimeReminder');
const checkForAnimeReminders = require('./src/functions/checkForAnimeReminders');

// Confirm successful log in
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Run checkForAnimeReminders every 10 minutes to scan DB for new episodes
setInterval(checkForAnimeReminders, 600000);

// Bot will use these commands
const commands = {
    "addAnime" : createNewAnimeReminder,
    "deleteAnime" : deleteAnimeReminder,
    "listAnime" : listAnimeReminder
};

// Parse reminder request, save to DB, DM confirmation to user
client.on('message', (msg) => {
    const args = msg.content.split(" ");

    if (args.length == 0 || args[0].charAt(0) !== '!') 
        return;

    const command = args.shift().substr(1);

    if (Object.keys(commands).includes(command)) {
        const removeCommand = "!" + command + " ";
        msg.content = msg.content.replace(removeCommand, "");
        commands[command](msg);
    }
});

// Log bot using into discord using your token
client.login(process.env.TOKEN_TEST).then(() => {
    console.log('Succesfully logged in using token!');
});

app.get('/',function(req, res){
    res.send('AniMan Notfy Discord Bot');
})

app.listen(process.env.PORT, () => {
    console.log(`App listening at ${process.env.PORT} PORT`);
})