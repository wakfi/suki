const selfDeleteReply = require(`${process.cwd()}/util/selfDeleteReply.js`);
const { prefix } = require(`${process.cwd()}/components/config.json`);

module.exports = {
	name: 'setAvatar',
	description: 'Change the avatar of the bot',
	category: 'customization',
	usage: ['<link to new image>','<attached image>'],
	aliases: ['setProfilePic','setProfilePicture','setPFP'],
	permLevel: 'Bot Admin',
	async execute(message, args) {
		try {
			const newAvatarURL = args.length ? args.join(' ') : message.attachments.first().url;
			await message.client.user.setAvatar(newAvatarURL);
			selfDeleteReply(message, `New avatar set!`, '6s');
		} catch(e) {
			console.error(e.stack);
			if(!args.length && !message.attachments.first())
			{
				selfDeleteReply(message, `Invalid command syntax. Try sending me \`${prefix}${this.name} -h\` for help with this command`, '15s');
			} else {
				selfDeleteReply(message, `An error occurred while trying to change my avatar: ${e}`, '15s');
			}
		}	
	}
};