function main(){
const Discord = require('discord.js');
const fs = require('fs-extra');

const { prefix, token, clientOptions, activity, clientStatus, permLevels } = require('./components/config.js');

const addTimestampLogs = require('./util/addTimestampLogs.js');
const cleanReply = require('./util/cleanReply.js');
const authorReply = require('./util/authorReply.js');

const client = new Discord.Client(clientOptions);
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const levelCache = {};
for (let i = 0; i < permLevels.length; i++) 
{
	const thisLevel = permLevels[i];
	levelCache[thisLevel.name] = thisLevel.level;
}

const permlevel = (message) => {
	let permlvl = 0;

	const permOrder = permLevels.slice(0).sort((p, c) => p.level < c.level ? 1 : -1);

	while (permOrder.length) {
		const currentLevel = permOrder.shift();
		if (message.guild && currentLevel.guildOnly) continue;
		if (currentLevel.check(message)) {
			permlvl = currentLevel.level;
			break;
		}
	}
	return permlvl;
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
	
	const command = client.commands.get(commandName) || 
					client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
					
	if(!command) return;
					
	if(args.join(' ') === '-h') return client.commands.get('help').execute(message,[commandName]);
	
	if(command.guildOnly && message.channel.type !== 'text') return message.channel.send(`This command cannot be executed in DMs!`);
	
	if(command.dmOnly && message.channel.type !== 'dm') return cleanReply(message, `This command can only be executed in DMs!`);
	
	if(((args.length==0) && command.args) || (args.length > 0 && command.noArgs))
	{
		let reply = `Invalid command syntax. Try sending me \`${prefix}${command.name} -h\` for help with this command`;
		return cleanReply(message, reply, '20s');
	}
	
	const level = permlevel(message);
	if(level < levelCache[command.permLevel]) return cleanReply(message, `You don't have permission to use this command`);
	
	try {
		command.execute(message, args);
	} catch(e) {
		console.error(e);
		cleanReply(message, `There was an error trying to execute that command!`);
	}
});


client.login(token);
}

main();