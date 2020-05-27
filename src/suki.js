function main(){
const Discord = require('discord.js');
const fs = require('fs-extra');

const { prefix, token, clientOptions, activity, clientStatus } = require('./components/config.json');
const addTimestampLogs = require('./util/addTimestampLogs.js');

const client = new Discord.Client(clientOptions);
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once("ready", async () => {
	client.user.setActivity(activity);
	client.user.setStatus(clientStatus);
	addTimestampLogs();
	console.log(`Suki has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds`);
});

//this event triggers when a message is sent in a channel the bot has access to
client.on("message", async message => {
	if(!message.content.startsWith(prefix)) return;
	if(message.author.bot) return; 

	const args = message.content.slice(prefix.length).split(/ +/g);
	const commandName = args.shift();
	
	if(!client.commands.has(commandName)) return;
	
	const command = client.commands.get(commandName);
	
	try {
		command.execute(message, args);
	} catch(e) {
		console.error(e);
		message.reply('there was an error trying to execute that command!');
	}
});


client.login(token);
}

main();