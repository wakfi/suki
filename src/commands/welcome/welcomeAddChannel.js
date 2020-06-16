const path = require('path');
const configPath = path.resolve('./components/config.json');
const config = require(configPath);
const welcomeMessage = require(`${process.cwd()}/features/welcomeMessage.js`);
const recordFile = require(`${process.cwd()}/util/recordFile.js`);
const selfDeleteReply = require(`${process.cwd()}/util/selfDeleteReply.js`);
const cleanReply = require(`${process.cwd()}/util/cleanReply.js`);
const resolveMention = require(`${process.cwd()}/util/resolveMention.js`);
const parsePositionalArgs = require(`${process.cwd()}/util/parsePositionalArgs.js`);
const CHANNELS_PATTERN = /<#(\d{17,18})>/i;
const EMOJIS_PATTERN = /<a?:.+:(\d{17,18})>/i;

module.exports = {
	name: 'welcomeAddChannel',
	description: 'Add a channel to the list of noted channels',
	category: 'welcome',
	usage: ['<ChannelResolvable> [channel description]', '[-e <emoji>] <-c ChannelResolvable> [-d <channel description>] [-p <position>]'],
	usageNote: 'positional flags may be used in any order. Available flags are `-e` with emoji, `-c` with channel, `-d` with description; -p may be used to specifiy a position in the order. Only `-c` is required for this usage',
	permLevel: 'Bot Admin',
	guildOnly: true,
	args: true,
	wcfgAliases: ['addChannel','adc'],
	async execute(message, args) {
		const keys = ['channelResolve','description']
		const flags = ['-c','-d'];
		const findEmoji = parsePositionalArgs(args, ['emoji','position'], ['-e','-p'], {singlePosition: true});
		const channelData = parsePositionalArgs(findEmoji.args, keys, flags);
		const emoji = resolveMention(findEmoji.emoji, EMOJIS_PATTERN);
		const position = findEmoji.position && !isNaN(findEmoji.position) ? Number(findEmoji.position)-1 : config.welcome.importantChannels.length;
		const chres = resolveMention(channelData.channelResolve, CHANNELS_PATTERN);
		const description = channelData.description;
		const channel = ((arg)=>{
			const manager = message.guild.channels;
			return manager.resolve(arg);
		})(chres || channelData.args.join(' '));
		if(!channel) return selfDeleteReply(message, `you must provide a channel`, '15s');
		if(config.welcome.importantChannels.indexOf(channel.id) > -1) return selfDeleteReply(message, `<#${channel.id}> is already noted on the welcome message at position ${config.welcome.importantChannels.indexOf(channel.id)+1}`);
		config.welcome.importantChannels.splice(position,0,channel.id);
		if(emoji) config.welcome.emojis[channel.id] = emoji;
		if(description) config.welcome.descriptions[channel.id] = description;
		const emjLiteral = ((emj) => {
			let resolved;
			try{	
				const resolving = emojiResolver.resolve(emj);
				const eid = resolving.id;
				resolved = resolving;
			} catch(e) {
				resolved = emj
			}
			return resolved;
		})(emoji);
		await recordFile(config, configPath).catch(e=>
		{
			console.error(e.stack);
			return selfDeleteReply(message, `looks like something went wrong; ${channel} was not added to welcome message noted channels (Error: ${e})`, '25s');
		});
		cleanReply(message, `added ${channel} to welcome message noted channels!`);
		selfDeleteReply(message, {...await welcomeMessage(message.client, message.member), duration:'1m', sendStandard:true});
	}
};