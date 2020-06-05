const path = require('path');
const configPath = path.resolve('./components/config.json');
const config = require(configPath);
const welcomeMessage = require(`${process.cwd()}/features/welcomeMessage.js`);
const recordFile = require(`${process.cwd()}/util/recordFile.js`);
const selfDeleteReply = require(`${process.cwd()}/util/selfDeleteReply.js`);

module.exports = {
	name: 'welcomeToggleMention',
	description: 'Toggle automatic mention in welcome message',
	category: 'welcome',
	usage: ['[true|false]'],
	usageNote: 'Using this command without arguments toggles the current state',
	permLevel: 'Bot Admin',
	guildOnly: true,
	wcfgAliases: ['toggleMention','tgm'],
	async execute(message, args) {
		const joinArgs = args.join(' ');
		const newMentionState = 									   		!args.length ? !config.welcome.mention : 
					 (joinArgs.toLowerCase()!=='true'&&joinArgs.toLowerCase()!=='false') ? null :
														 joinArgs.toLowerCase()==='true' ? true : false;
		if(newMentionState===null) return selfDeleteReply(message, `argument must be \`true\` or \`false\``, '20s');
		config.welcome.mention = newMentionState;
		await recordFile(config, configPath).catch(e=>
		{
			console.error(e.stack);
			return selfDeleteReply(message, `looks like something went wrong; mention was not set to ${config.welcome.mention} (Error: ${e})`, '25s');
		});
		selfDeleteReply(message, `set mention to ${config.welcome.mention}`);
		selfDeleteReply(message, {...await welcomeMessage(message.client, message.member), duration:'1m', sendStandard:true});
	}
};