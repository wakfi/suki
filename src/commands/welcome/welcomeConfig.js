const path = require('path');
const MessageEmbed = require((require.resolve('discord.js')).split(path.sep).slice(0, -1).join(path.sep) + `${path.sep}structures${path.sep}MessageEmbed.js`);
const { welcome } = require(`${process.cwd()}/components/config.json`);
const welcomeMessage = require(`${process.cwd()}/features/welcomeMessage.js`);
const selfDeleteReply = require(`${process.cwd()}/util/selfDeleteReply.js`);
const cleanReply = require(`${process.cwd()}/util/cleanReply.js`);
const parsePositionalArgs = require(`${process.cwd()}/util/parsePositionalArgs.js`);
const parseTruthyArgs = require(`${process.cwd()}/util/parseTruthyArgs.js`);
const firstLetterCapital = require(`${process.cwd()}/util/firstLetterCapital.js`);
const wcfgSym = Symbol('wcfgSym')

module.exports = {
	name: 'welcomeConfig',
	description: 'Welcome message configuration assistant. Services inclide usi welcome message configuration commands with shorter aliases, displaying a list of config commands, creating a preview of the welcome message on-demand, and displaying the current config raw-data',
	category: 'welcome',
	usage: ['[-p|-a|-l]'],
	aliases: ['wcfg'],
	permLevel: 'Bot Admin',
	guildOnly: true,
	args: true,
	wcfg: wcfgSym,
	async execute(message, args) {
		const tflags = ['-p','-a','-l'];
		const tkeys = ['preview', 'allcmds', 'list'];
		const truthy = parseTruthyArgs(args,tkeys,tflags);
		if(truthy.count > 1 && !truthy.help || truthy.count > 2) throw new SyntaxError('Flags `-p`, `-a`, and `-l` are mutually exclusive; you may only use one');
		if(truthy.preview)
		{
			return await message.channel.send(await welcomeMessage(message.client, message.member));
		} else if(truthy.allcmds) {
			truthy.args.push(this.wcfg);
			return await message.client.commands.get('help').execute(message,truthy.args);
		} else if(truthy.list) {
				return;
			const keys = JSON.parse(JSON.stringify(welcome)).keys();
			const embed = new MessageEmbed() 
				.setTitle('Current Welcome Configuration Data')
				.setThumbnail(`https://i.imgur.com/0NR5nbD.png`)
				.setColor(0xFF00FF)
				.setFooter(`Welcome Message Config`)
				.setTimestamp(new Date());
			keys.forEach(key => {
				const val = welcome[key];
				if(val instanceof 'object')
				{
					if(val instanceof Array)
					{
						let vstring = '';
						val.forEach(ch => vstring += /\d{17,18}/.test(ch) ? `<#${ch}>` : ch);
						embed.addField(key, vstring);
					} else {
						const valKeys = val.keys();
						let vstring = '';
						valKeys.forEach(vkey => vstring += (/\d{17,18}/.test(vkey) ? `<#${vkey}>` : vkey) + ' : ' + (/\d{17,18}/.test(val[vkey]) ? `<#${val[vkey]}>` : val[vkey]) + '\n');
						embed.addField(key, vstring);
					}
				} else {
					embed.addField(key, /\d{17,18}/.test(val) ? `<#${val}>` : val);
				}
			});
		}
		const pflags = [];
		const pkeys = [];
		const posit = parsePositionalArgs(truthy.args, pkeys, pflags);
		
		const parsedArgs = posit.args;
		const commandName = parsedArgs.shift();
		parsedArgs.push(this.wcfg);
		
		const command = require.main.validateCommand(commandName, message, parsedArgs);
		if(!command) return selfDeleteReply(message, `could not find welcome command ${commandName}`, '15s');
		
		try {
			command.execute(message, parsedArgs);
		} catch(e) {
			console.error(e.stack);
			selfDeleteReply(message, `There was an error trying to execute that command!`,'15s');
		}
	}
};