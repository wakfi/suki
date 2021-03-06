function main(){
const Discord = require('discord.js');
const fs = require('fs-extra');
const USERS_PATTERN = /<@!?\d{17,18}>/i

const { prefix, clientOptions, activity, clientStatus, welcome} = require('./components/config.json');
const { token } = require('./components/token.json');
const permLevels = require('./components/permLevels.js');

const addTimestampLogs = require('./util/addTimestampLogs.js');
const selfDeleteReply = require('./util/selfDeleteReply.js');
const cleanReply = require('./util/cleanReply.js');
const authorReply = require('./util/authorReply.js');
const loadAllCommands = require('./util/loadAllCommands.js');

const welcomeMessage = require('./features/welcomeMessage.js');

const client = new Discord.Client(clientOptions);
client.commands = new Discord.Collection();
loadAllCommands(client, `${process.cwd()}/commands`);
client.commands.delete(null);

client.levelCache = {};
for (let i = 0; i < permLevels.length; i++) 
{
	const thisLevel = permLevels[i];
	client.levelCache[thisLevel.name] = thisLevel.level;
}

client.permlevel = (message) => {
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
};

client.once('ready', async () => 
{
	client.user.setPresence({activity:activity, status: clientStatus.status});
	addTimestampLogs();
	console.log(`${client.user.username} has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds`);
});

client.on('guildMemberAdd', async (member) => 
{
	const channel = member.guild.channels.resolve(welcome.channelTarget);
	await channel.send(await welcomeMessage(client,member));
});

//this event triggers when a message is sent in a channel the bot has access to
client.on("message", async message => 
{
	if(!message.content.startsWith(prefix) && !message.mentions.has(client.user)) return;
	
	if(message.author.bot) return; 
	
	const args = message.content.slice(prefix.length).split(/ +/g);
	if(USERS_PATTERN.test(message.content) && message.content.startsWith(`${message.client.user}`))
	{
		args.shift(); //clear mention
		if(args.length == 0) return cleanReply(message, `type \`${prefix}help\` to see a list commands`, `20s`);
	}
	const commandName = args.shift();
	
	const command = client.commands.get(commandName) || 
					client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
					
	if(!command) return;
		
	if(args.join(' ') === '-h') return client.commands.get('help').execute(message,[command.name]);
	
	if(command.guildOnly && message.channel.type !== 'text') return selfDeleteReply(message, `this command cannot be executed in DMs!`);
	
	if(command.dmOnly && message.channel.type !== 'dm') return selfDeleteReply(message, `this command can only be executed in DMs!`);
	
	if((args.length==0 && command.args) || (args.length > 0 && command.noArgs))
	{
		let reply = `invalid command syntax. Try sending me \`${prefix}${command.name} -h\` for help with this command`;
		return selfDeleteReply(message, reply, `20s`);
	}
	
	const level = client.permlevel(message);
	if(level < client.levelCache[command.permLevel]) return selfDeleteReply(message, `you don't have permission to use this command`);
	
	try {
		await command.execute(message, args);
	} catch(e) {
		console.error(e.stack);
		selfDeleteReply(message, `there was an error trying to execute that command!`);
	}
});

client.login(token);
}

main();