const path = require('path');
const MessageEmbed = require((require.resolve('discord.js')).split(path.sep).slice(0, -1).join(path.sep) + `${path.sep}structures${path.sep}MessageEmbed.js`);
const { welcome } = require(`${process.cwd()}/components/config.json`);
const EMBED_BLANK_SPACE_EMOJI = '717953717873279007';

function welcomeMessage(client,member)
{
	return new Promise(async (resolve,reject) =>
	{
		const manager = member.guild.channels;
		const emojiResolver = client.emojis;
		const embed = new MessageEmbed();
		if(welcome.header && welcome.headerText) embed.setTitle(welcome.headerText);
		const descriptionText = [`${welcome.messageBody}\n`];
		if(!welcome.mention && !welcome.messageBody) descriptionText.pop();
		welcome.importantChannels.forEach(channelResolve => 
		{
			const channelID = manager.resolveID(channelResolve);
			const emj = welcome.emojis[channelID] || EMBED_BLANK_SPACE_EMOJI;
			const emoji = ((emj) => {
				let resolved;
				try{	
					const resolving = emojiResolver.resolve(emj);
					const eid = resolving.id;
					resolved = resolving;
				} catch(e) {
					resolved = emj
				}
				return resolved;
			})(emj);
			descriptionText.push(`${emojiResolver.resolve(emj) || emj}<#${channelID}>${welcome.descriptions[channelID] ? ' - ' + welcome.descriptions[channelID] : ''}`);
		});
		embed.setDescription(descriptionText.join('\n'))
			 .setColor(0xFF00FF)
			 .setFooter(member.guild.name, member.guild.iconURL())
			 .setTimestamp(new Date());
		resolve({embed:embed,content:`${welcome.mention?member:''}`,allowedMentions:{users:[member.id]}});
	});
}

module.exports = welcomeMessage;