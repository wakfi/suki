const path = require('path');
const MessageEmbed = require((require.resolve('discord.js')).split(path.sep).slice(0, -1).join(path.sep) + `${path.sep}structures${path.sep}MessageEmbed.js`);
const { prefix,welcome } = require(`${process.cwd()}/components/config.json`);
const welcomeMessage = require(`${process.cwd()}/features/welcomeMessage.js`);
const selfDeleteReply = require(`${process.cwd()}/util/selfDeleteReply.js`);
const cleanReply = require(`${process.cwd()}/util/cleanReply.js`);
const parsePositionalArgs = require(`${process.cwd()}/util/parsePositionalArgs.js`);
const parseTruthyArgs = require(`${process.cwd()}/util/parseTruthyArgs.js`);
const firstLetterCapital = require(`${process.cwd()}/util/firstLetterCapital.js`);
const wcfgSym = Symbol('wcfgSym');

module.exports = {
	name: 'welcomeConfig',
	description: 'Welcome message configuration assistant. Services inclide using welcome message configuration commands with shorter aliases, displaying a list of config commands, creating a preview of the welcome message on-demand, and displaying the current config raw-data',
	category: 'welcome',
	usage: ['[-p|-a]','<welcome config command> [-h]'],
	aliases: ['wcfg'],
	permLevel: 'Bot Admin',
	guildOnly: true,
	args: true,
	wcfg: wcfgSym,
	async execute(message, args) {
		const tflags = ['p','a'];
		const tkeys = ['preview', 'allcmds'];
		const truthy = parseTruthyArgs(args,tkeys,tflags);
		if(truthy.preview && truthy.allcmds) return selfDeleteReply(message, 'flags `-p` and `-a` are mutually exclusive; you may only use one');
		if(truthy.preview)
		{
			return await message.channel.send(await welcomeMessage(message.client, message.member));
		} else if(truthy.allcmds) {
			truthy.args.push(this.wcfg);
			return await message.client.commands.get('help').execute(message,truthy.args);
		}
		const pflags = [];
		const pkeys = [];
		const posit = parsePositionalArgs(truthy.args, pkeys, pflags);
		
		const parsedArgs = posit.args;
		const commandName = parsedArgs.shift();
		
		const command = message.client.commands.get(commandName) || 
						message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName) || 
													cmd.wcfgAliases && cmd.wcfgAliases.includes(commandName));
						
		if(!command) return;
			
		if(parsedArgs.join(' ') === '-h') return message.client.commands.get('help').execute(message,[command.name,this.wcfg]);
		
		if(command.guildOnly && message.channel.type !== 'text') return selfDeleteReply(message, `this command cannot be executed in DMs!`);
		
		if(command.dmOnly && message.channel.type !== 'dm') return selfDeleteReply(message, `this command can only be executed in DMs!`);
		
		if((parsedArgs.length==0 && command.args) || (parsedArgs.length > 0 && command.noArgs))
		{
			let reply = `invalid command syntax. Try sending me \`${prefix}${this.name} ${command.name} -h\` for help with this command`;
			return selfDeleteReply(message, reply, '20s');
		}
		
		const level = message.client.permlevel(message);
		if(level < message.client.levelCache[command.permLevel]) return selfDeleteReply(message, `you don't have permission to use this command`);
		
		try {
			await command.execute(message, parsedArgs);
		} catch(e) {
			console.error(e.stack);
			selfDeleteReply(message, `there was an error trying to execute that command!`, '18s');
		}
	}
};