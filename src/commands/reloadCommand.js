module.exports = {
	name: 'reloadCommand',
	description: 'Reload a command that is currently cached in the available commands',
	category: 'development',
	usage: ['<commandName>'],
	aliases: ['rlc'],
	permLevel: 'Bot Developer',
	guildOnly: false,
	dmOnly: false,
	args: true,
	async execute(message, args) {
		const commandName = args.shift();
		try { 
			const command = message.client.commands.get(commandName) ||
							message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
			const cn = command.name;
			try {
				delete require.cache[require.resolve(`./${command.name}.js`)];
				const newCommand = require(`./${command.name}.js`);
				message.client.commands.set(newCommand.name, newCommand);
				message.reply(`Reloaded ${command.name} successfully`);
			} catch (e) {
				console.error(e.stack);
				message.channel.send(`There was an error while reloading a command \`${command.name}\`:\n\`${e.message}\``);
			}
		} catch(e) {
			return message.channel.send(`There is currently no command with name or alias \`${commandName}\` loaded`);
		}
	}
};