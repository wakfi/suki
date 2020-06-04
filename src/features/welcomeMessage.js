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
		//const channel = manager.resolve(welcome.channelTarget);
		const embed = new MessageEmbed();
		if(welcome.header && welcome.headerText) embed.setTitle(welcome.headerText);
		const descriptionText = [`${welcome.messageBody}\n`];
		if(!welcome.mention && !welcome.messageBody) descriptionText.pop();
		welcome.importantChannels.forEach(channelID => 
		{
			const channel = manager.resolve(channelID);
			const emj = welcome.emojis[channel.id] || EMBED_BLANK_SPACE_EMOJI;
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
			descriptionText.push(`${emojiResolver.resolve(emj) || emj}${channel}${welcome.descriptions[channel.id] ? ' - ' + welcome.descriptions[channel.id] : ''}`);
		});
		embed.setDescription(descriptionText.join('\n'))
			 .setColor(0xFF00FF)
			 .setFooter(member.guild.name, member.guild.iconURL())
			 .setTimestamp(new Date());
		//await channel.send(embed).catch(e => console.error);
		resolve({embed:embed,content:`${welcome.mention?member:''}`,allowedMentions:{users:[member.id]}});
	});
}

module.exports = welcomeMessage;