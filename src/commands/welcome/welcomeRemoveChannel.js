const path = require('path');
const configPath = path.resolve('./components/config.json');
const config = require(configPath);
const welcomeMessage = require(`${process.cwd()}/features/welcomeMessage.js`);
const recordFile = require(`${process.cwd()}/util/recordFile.js`);
const selfDeleteReply = require(`${process.cwd()}/util/selfDeleteReply.js`);
const cleanReply = require(`${process.cwd()}/util/cleanReply.js`);
const resolveMention = require(`${process.cwd()}/util/resolveMention.js`);
const CHANNELS_PATTERN = /<#(\d{17,18})>/i;

module.exports = {
	name: 'welcomeRemoveChannel',
	description: 'Remove a channel from the list of noted channels',
	category: 'welcome',
	usage: ['<ChannelResolvable>'],
	permLevel: 'Bot Admin',
	guildOnly: true,
	args: true,
	wcfgAliases: ['removeChannel','rmc'],
	async execute(message, args) {
		const channelID = message.guild.channels.resolveID(resolveMention(args.join(' '), CHANNELS_PATTERN));
		if(!channelID) return selfDeleteReply(message, `you must provide a channel`, '15s');
		if(config.welcome.importantChannels.indexOf(channelID) < 0) return selfDeleteReply(message, `<#${channelID}> is not noted on the welcome message`);
		const removeFromArr = (arr,item) => {
			const index = arr.indexOf(item);
			if(index == -1) return;
			arr.splice(index,1);
		};
		const removeFromMap = (map,item) => {
			if(!map[item]) return;
			map[item] = undefined;
		};
		removeFromArr(config.welcome.importantChannels, channelID);
		removeFromMap(config.welcome.emojis, channelID);
		removeFromMap(config.welcome.descriptions, channelID);
		await recordFile(config, configPath).catch(e=>
		{
			console.error(e.stack);
			return selfDeleteReply(message, `looks like something went wrong; <#${channelID}> was not removed from welcome message noted channels (Error: ${e})`, '25s');
		});
		cleanReply(message, `removed <#${channelID}> from welcome message noted channels`);
		selfDeleteReply(message, {...await welcomeMessage(message.client, message.member), duration:'1m', sendStandard:true});
	}
};