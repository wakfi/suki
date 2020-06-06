const path = require('path');
const configPath = path.resolve('./components/config.json');
const config = require(configPath);
const welcomeMessage = require(`${process.cwd()}/features/welcomeMessage.js`);
const recordFile = require(`${process.cwd()}/util/recordFile.js`);
const selfDeleteReply = require(`${process.cwd()}/util/selfDeleteReply.js`);
const cleanReply = require(`${process.cwd()}/util/cleanReply.js`);

module.exports = {
	name: 'welcomeSetBody',
	description: 'Set body of welcome message',
	category: 'welcome',
	usage: ['[message body]'],
	usageNote: 'Using this command without arguments clears the saved text and removes the field from the embed',
	aliases: ['welcomeSetMessage','welcomeSetMessageBody','welcomeSetDescription'],
	permLevel: 'Bot Admin',
	guildOnly: true,
	wcfgAliases: ['setBody','setMessage','setMessageBody','setDescription','smb'],
	async execute(message, args) {
		const newBody = args.join(' ');
		if(config.welcome.messageBody == newBody) return selfDeleteReply(message, `message body is already ${!config.welcome.messageBody?'empty':'set to\n>>> '+config.welcome.messageBody}`, '15s');
		config.welcome.messageBody = newBody;
		await recordFile(config, configPath).catch(e=>
		{
			console.error(e.stack);
			return selfDeleteReply(message, `looks like something went wrong; message body was not altered (Error: ${e})`, '25s');
		});
		const updateText = config.welcome.messageBody ? `set message body to\n>>> ${config.welcome.messageBody}` : `cleared message body`;
		cleanReply(message, updateText);
		selfDeleteReply(message, {...await welcomeMessage(message.client, message.member), duration:'1m', sendStandard:true});
	}
};