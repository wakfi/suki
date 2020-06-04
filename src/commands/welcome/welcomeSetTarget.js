const path = require('path');
const configPath = path.resolve('./components/config.json');
const config = require(configPath);
const recordFile = require(`${process.cwd()}/util/recordFile.js`);
const selfDeleteReply = require(`${process.cwd()}/util/selfDeleteReply.js`);
const resolveMention = require(`${process.cwd()}/util/resolveMention.js`);
const CHANNELS_PATTERN = /<#(\d{17,18})>/i;

module.exports = {
	name: 'welcomeSetTarget',
	description: 'Set channel to send welcome messages',
	category: 'welcome',
	usage: ['<ChannelResolvable>'],
	permLevel: 'Bot Admin',
	guildOnly: true,
	args: true,
	async execute(message, args) {
		const channelID = message.guild.channels.resolveID(resolveMention(args.join(' '), CHANNELS_PATTERN));
		if(!message.guild.channels.resolve(channelID)) return selfDeleteReply(message, `you must provide a channel`, '15s');
		if(config.welcome.channelTarget == channelID) return selfDeleteReply(message, `welcome channel is already set to <#${channelID}>`, '15s');
		config.welcome.channelTarget = channelID;
		await recordFile(config, configPath).catch(e=>
		{
			console.error(e.stack);
			return selfDeleteReply(message, `looks like something went wrong; welcome channel was not set to <#${channelID}> (Error: ${e})`, '25s');
		});
		selfDeleteReply(message, `set <#${channelID}> as welcome channel`);
	}
};