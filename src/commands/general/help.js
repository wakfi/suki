const path = require('path');
const MessageEmbed = require((require.resolve('discord.js')).split(path.sep).slice(0, -1).join(path.sep) + `${path.sep}structures${path.sep}MessageEmbed.js`);
const authorReply = require(`${process.cwd()}/util/authorReply.js`);
const {prefix} = require(`${process.cwd()}/components/config.json`);
const permLevels = require(`${process.cwd()}/components/permLevels.js`);
const EMBED_MAX_FIELDS = 25;

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
	usage: [`[-a|commandName]\`\n\u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \`${prefix}<command> -h`],
	aliases: ['commands','command','?'],
	permLevel: 'User',
	async execute(message, args) {
		const level = permlevel(message);
		const includeAll = (() =>
		{
			if(args.length == 0) return false;
			if(args[0] === '-a'){args.shift(); return true;}
			return false;
		})();
		const commands = message.client.commands.filter(cmd => includeAll || !cmd.unlisted).sorted((p, c) => levelCache[p.permLevel] - levelCache[c.permLevel] || (p.name < c.name ? -1 : 1));
		if(args.length == 0)
		{
			// ?help
			const embeds = [];
			embeds[0] = new MessageEmbed()
				.setThumbnail(`https://i.imgur.com/0NR5nbD.png`)
				.setTitle(`${message.client.user.username} Help`)//, message.client.user.displayAvatarURL())
				.setDescription(`Send \`${prefix}command -h\` with any command for more information about that command`)
				.setColor(0xFF00FF);
			let previousCMDLevel = levelCache[commands.first().permLevel];
			let cmdArr = [[]];
			let numberOfFields = 0;
			let cmdIndex = 0;
			commands.forEach(cmd => 
			{
				cmdArr[cmdIndex].push(cmd);
				numberOfFields++;
				if(numberOfFields == EMBED_MAX_FIELDS)
				{
					cmdArr.push([]);
					cmdIndex++;
					numberOfFields = 0;
					embeds[cmdIndex] = new MessageEmbed()
						.setColor(0xFF00FF);
				}
			});
			
			let modified = false;
			let extraFields = 0;
			cmdIndex = 0;
			numberOfFields = 0;
			const checkCount = () => {
				if(numberOfFields == EMBED_MAX_FIELDS) 
				{
					cmdIndex++;
					if(cmdIndex == embeds.length)
					{
						embeds.push(new MessageEmbed()
							.setThumbnail(`https://i.imgur.com/0NR5nbD.png`)
							.setColor(0xFF00FF)
						);
					}
					if(extraFields)
					{
						extraFields = false;
					}
					numberOfFields = 0;
				}
			};
			cmdArr.forEach(subArr => {
				subArr.forEach(cmd => {
					const embed = embeds[cmdIndex];
					cmdLevel = levelCache[cmd.permLevel];
					if(level >= cmdLevel)
					{
						if(cmdLevel > previousCMDLevel)
						{
							embed.addField(`\u200b`, `**Additional commands for: ${cmd.permLevel}**`);
							previousCMDLevel = cmdLevel;
							extraFields = true;
							numberOfFields++;
						}
						checkCount();
						let fieldBody = ``;
						fieldBody += `Description: ${cmd.description?cmd.description:'No Description'}\n`;
						embed.addField(`${prefix}${cmd.name}`,fieldBody.trim());
						numberOfFields++;
						checkCount();
					}
				});
			});
			const embedsToSend = embeds.filter(embed => embed.fields.length > 0);
			embedsToSend[embedsToSend.length-1]
				.setFooter(`${prefix}help, ${prefix}commands, ${prefix}command, ${prefix}?`)
				.setTimestamp(new Date());
			embedsToSend.forEach(async embed => await authorReply(message,embed));
		} else {
			// ?command -h, ?help <command>
			const commandName = args.shift();
			if(!message.client.commands.has(commandName) &&
			   !message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))) return;
			const command = message.client.commands.get(commandName)  ||
							message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
			if(level < levelCache[command.permLevel]) return;
			let fieldBody = ``;
			if(command.unlisted) fieldBody += `*Unlisted*\n`;
			if(command.aliases) fieldBody += `Alias(es): ${command.aliases.join(', ')}\n`;
			fieldBody += `Description: ${command.description ? command.description : command.name.charAt(0).toUpperCase() + command.name.slice(1)}\n`;
			fieldBody += `Usage: \`${prefix}${command.name}${command.usage ? ' ' + command.usage.join('`\n\u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b `' + prefix + command.name + ' ') : ''}\`\n`;
			if(command.usageNote) fieldBody += `${command.usageNote}\n`;
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