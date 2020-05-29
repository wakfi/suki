const path = require('path');
const MessageEmbed = require((require.resolve('discord.js')).split(path.sep).slice(0, -1).join(path.sep) + `${path.sep}structures${path.sep}MessageEmbed.js`);
const authorReply = require('../util/authorReply.js');
const {prefix,permLevels} = require('../components/config.js');

const levelCache = {};
for (let i = 0; i < permLevels.length; i++) 
{
	const thisLevel = permLevels[i];
	levelCache[thisLevel.name] = thisLevel.level;
}

const permlevel = (message) => {
	let permlvl = 0;

	const permOrder = permLevels.slice(0).sort((p, c) => p.level < c.level ? 1 : -1);

	while (permOrder.length) {
		const currentLevel = permOrder.shift();
		if (message.guild && currentLevel.guildOnly) continue;
		if (currentLevel.check(message)) {
			permlvl = currentLevel.level;
			break;
		}
	}
	return permlvl;
}

module.exports = {
	name: 'help',
	description: 'Provides information about all commands, as well as information about specific commands',
	category: 'basic',
	usage: `[commandName]\n${prefix}<command> -h`,
	aliases: ['commands','command','?'],
	permLevel: 'User',
	guildOnly: false,
	dmOnly: false,
	args: false,
	noArgs: false,
	async execute(message, args) {
		const level = permlevel(message);
		const commands = message.client.commands.sorted((p, c) => levelCache[p.permLevel] < levelCache[c.permLevel] ? -1 : 1);
		if(args.length == 0)
		{
			const embeds = [];
			embeds[0] = new MessageEmbed()
				.setTitle(`Suki Help`)
				.setAuthor(message.client.user.username, message.client.user.avatarURL)
				.setDescription(`Please contact <@193160566334947340> with additional questions`)
				.setColor(0xFF00FF)
			let previousCMDLevel = levelCache[commands.first().permLevel];
			let cmdArr = [[]];
			let count = 0;
			let cmdIndex = 0;
			commands.forEach(cmd => 
			{
				cmdArr[cmdIndex].push(cmd);
				count++;
				if(count == 25)
				{
					cmdArr.push([]);
					cmdIndex++;
					count = 0;
					embeds[cmdIndex] = new MessageEmbed()
						.setColor(0xFF00FF);
				}
			});
			
			let modified = false;
			cmdIndex = 0;
			count = 0;
			const checkCount = () => {
				if(count == 25) 
				{
					cmdIndex++;
					if(cmdIndex == embeds.length)
					{
						embeds.push(new MessageEmbed()
							.setColor(0xFF00FF)
						);
						count = 0;
					}
				}
			};
			cmdArr.forEach(subArr => {
				if(modified) 
				{
					cmdIndex--;
				}
				const embed = embeds[cmdIndex];
				subArr.forEach(cmd => {
					cmdLevel = levelCache[cmd.permLevel];
					if(level >= cmdLevel)
					{
						if(cmdLevel > previousCMDLevel)
						{
							embed.addField(`\u200b`, `**Additional commands for: ${cmd.permLevel}**`);
							previousCMDLevel = cmdLevel;
							count++;
						}
						checkCount();
						/*if(count == 25) 
						{
							cmdIndex++;
							if(cmdIndex == embeds.length)
							{
								embeds.push(new MessageEmbed()
									.setColor(0xFF00FF);
								);
								count = 0;
							}
						}*/
						let fieldBody = ``;
						if(cmd.description) fieldBody += `Description: ${cmd.description}\n`;
						fieldBody += `Usage: ${prefix}${cmd.name} ${cmd.usage?cmd.usage:''}\n`;
						if(cmd.category) fieldBody += `Category: ${cmd.category}\n`;
						if(cmd.aliases) fieldBody += `Aliases: ${cmd.aliases.join(', ')}\n`;
						if(cmd.guildOnly) fieldBody += `*This command can only be used in a server channel*\n`;
						if(cmd.dmOnly) fieldBody += `*This command can only be used in a direct message*\n`;
						embed.addField(`${prefix}${cmd.name}`,fieldBody.trim());
						count++;
						checkCount();
					}
				});
				cmdIndex++;
			});
			const embedsToSend = embeds.filter(embed => embed.fields.length > 0);
			embedsToSend[embedsToSend.length-1]
				.setFooter(`${prefix}commands, ${prefix}command, ${prefix}?`)
				.setTimestamp(new Date());
			embedsToSend.forEach(async embed => await authorReply(message,embed));
		} else {
			const commandName = args.shift();
			
		}
	}
};