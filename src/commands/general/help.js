const path = require('path');
const MessageEmbed = require((require.resolve('discord.js')).split(path.sep).slice(0, -1).join(path.sep) + `${path.sep}structures${path.sep}MessageEmbed.js`);
const authorReply = require(`${process.cwd()}/util/authorReply.js`);
const {prefix} = require(`${process.cwd()}/components/config.json`);
const permLevels = require(`${process.cwd()}/components/permLevels.js`);

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
	category: 'general',
	usage: [`[commandName]\`\n\u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \`${prefix}<command> -h`],
	aliases: ['commands','command','?'],
	permLevel: 'User',
	async execute(message, args) {
		const level = permlevel(message);
		const commands = message.client.commands.sorted((p, c) => levelCache[p.permLevel] - levelCache[c.permLevel] || (p.name < c.name ? -1 : 1));
		if(args.length == 0)
		{
			// ?help
			const embeds = [];
			embeds[0] = new MessageEmbed()
				.setTitle(`${message.client.user.username} Help`)//, message.client.user.displayAvatarURL())
				.setDescription(`Send \`${prefix}command -h\` with any command for more information about that command`)
				.setColor(0xFF00FF);
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
						let fieldBody = ``;
						//if(cmd.aliases) fieldBody += `Alias(es): ${cmd.aliases.join(', ')}\n`;
						fieldBody += `Description: ${cmd.description}\n`;
						//fieldBody += `Usage: ${prefix}${cmd.name} ${cmd.usage?cmd.usage.join('\\n       ' + prefix + cmd.name):''}\n`;
						//if(cmd.category) fieldBody += `Category: ${cmd.category}\n`;
						//if(cmd.guildOnly) fieldBody += `*This command can only be used in a server channel*\n`;
						//if(cmd.dmOnly) fieldBody += `*This command can only be used in a direct message*\n`;
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
			// ?command -h
			const commandName = args.shift();
			if(!message.client.commands.has(commandName)) return;
			const command = message.client.commands.get(commandName);
			let fieldBody = ``;
			if(command.aliases) fieldBody += `Alias(es): ${command.aliases.join(', ')}\n`;
			fieldBody += `Description: ${command.description ? command.description : command.name.charAt(0).toUpperCase() + command.name.slice(1)}\n`;
			fieldBody += `Usage: \`${prefix}${command.name} ${command.usage ? command.usage.join('`\n\u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b `' + prefix + command.name + ' ') : ''}\`\n`;
			if(command.category) fieldBody += `Category: ${command.category}\n`;
			if(command.guildOnly) fieldBody += `*This command can only be used in a server channel*\n`;
			else if(command.dmOnly) fieldBody += `*This command can only be used in a direct message*\n`;
			const embed = new MessageEmbed()
				.setTitle(`${prefix}${command.name}`)
				.setColor(0xFF00FF)
				.addField(`${command.permLevel==='User' ? 'Available to all users' : 'Restricted to: ' + command.permLevel}`, fieldBody.trim())
				.setFooter(`\`<arg>\` denotes required arguments; \`[arg]\` denotes optional arguments`)
				.setTimestamp(new Date());
			authorReply(message, embed);
		}
	}
};