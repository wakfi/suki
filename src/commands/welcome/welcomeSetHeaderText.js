const path = require('path');
const configPath = path.resolve('./components/config.json');
const config = require(configPath);
const welcomeMessage = require(`${process.cwd()}/features/welcomeMessage.js`);
const recordFile = require(`${process.cwd()}/util/recordFile.js`);
const selfDeleteReply = require(`${process.cwd()}/util/selfDeleteReply.js`);
const cleanReply = require(`${process.cwd()}/util/cleanReply.js`);

module.exports = {
	name: 'welcomeSetHeaderText',
	description: 'Set text of welcome message header. Does not enable or disable header',
	category: 'welcome',
	usage: ['[header text]'],
	usageNote: 'Using this command without arguments clears the saved text and removes the field from the embed; the header reamins enabled however, and setting text again later will cause it to begin displaying',
	aliases: ['welcomeSetTitle'],
	permLevel: 'Bot Admin',
	guildOnly: true,
	async execute(message, args) {
		const newHeader = args.join(' ');
		if(config.welcome.headerText == newHeader) return selfDeleteReply(message, `header text is already ${!config.welcome.headerText?'empty':'set to\n>>> '+config.welcome.headerText}`, '15s');
		config.welcome.headerText = newHeader;
		await recordFile(config, configPath).catch(e=>
		{
			console.error(e.stack);
			return selfDeleteReply(message, `looks like something went wrong; header text was not altered (Error: ${e})`, '25s');
		});
		const updateText = config.welcome.headerText ? `set header text to\n>>> ${config.welcome.headerText}` : `cleared header text`;
		cleanReply(message, updateText);
		selfDeleteReply(message, {...await welcomeMessage(message.client, message.member), duration:'1m', sendStandard:true});
	}
};