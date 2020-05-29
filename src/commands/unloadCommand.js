module.exports = {
	name: 'unloadCommand',
	description: 'Remove a command from the currently available commands',
	category: 'development',
	usage: ['<commandName>'],
	aliases: ['ulc'],
	permLevel: 'Bot Developer',
	guildOnly: false,
	dmOnly: false,
	args: true,
	async execute(message, args) {
		const commandName = args.shift();
		try { 
			const command = message.client.commands.get(commandName) ||
							message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
			try {
				delete require.cache[require.resolve(`./${command.name}.js`)];
				message.client.commands.sweep(cmd => cmd.name === command.name);
				message.reply(`Successfully unloaded ${command.name}`);
			} catch (e) {
				console.error(e);
				message.channel.send(`There was an error while unloading a command \`${command.name}\`:\n\`${e.message}\``);
			}
		} catch(e) {
			message.channel.send(`There is currently no command with name or alias \`${commandName}\` loaded`);
		}
	}
};