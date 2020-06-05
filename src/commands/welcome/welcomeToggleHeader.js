const path = require('path');
const configPath = path.resolve('./components/config.json');
const config = require(configPath);
const welcomeMessage = require(`${process.cwd()}/features/welcomeMessage.js`);
const recordFile = require(`${process.cwd()}/util/recordFile.js`);
const selfDeleteReply = require(`${process.cwd()}/util/selfDeleteReply.js`);

module.exports = {
	name: 'welcomeToggleHeader',
	description: 'Toggle header on welcome message',
	category: 'welcome',
	usage: ['[true|false]'],
	usageNote: 'Using this command without arguments toggles the current state',
	permLevel: 'Bot Admin',
	guildOnly: true,
	unlisted: true,
	wcfgAliases: ['toggleHeader','tgh'],
	async execute(message, args) {
		const joinArgs = args.join(' ');
		const newHeaderState = 									   			!args.length ? !config.welcome.header : 
					 (joinArgs.toLowerCase()!=='true'&&joinArgs.toLowerCase()!=='false') ? null :
														 joinArgs.toLowerCase()==='true' ? true : false;
		if(newHeaderState===null) return selfDeleteReply(message, `argument must be \`true\` or \`false\``, '20s');
		config.welcome.header = newHeaderState;
		await recordFile(config, configPath).catch(e=>
		{
			console.error(e.stack);
			return selfDeleteReply(message, `looks like something went wrong; header state was not modified (Error: ${e})`, '25s');
		});
		selfDeleteReply(message, `set header to \`${config.welcome.header}\``);
		selfDeleteReply(message, {...await welcomeMessage(message.client, message.member), duration:'1m', sendStandard:true});
	}
};