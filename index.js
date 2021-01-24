const client = require('./src/discord-config')
const { token } = require('./config.json');

// Functions import
const createNewAnimeReminder = require('./src/functions/createNewAnimeReminder');

//Confirm successful log in
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (msg) => {
    command = msg.content.split(" ");
    if(command[0] === "!addAnime"){
        msg.content = msg.content.replace("!addAnime ", "");
        console.log(msg.content);
        createNewAnimeReminder(msg);
    }
});

//Log bot using into discord using your token
client.login(token).then(() => {
    console.log('Succesfully logged in using token!');
});