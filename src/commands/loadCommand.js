module.exports = {
	name: 'loadCommand',
	description: 'Load a new command that is not currently cached into the available commands',
	category: 'development',
	usage: ['<commandName>'],
	aliases: ['ldc'],
	permLevel: 'Bot Developer',
	guildOnly: false,
	dmOnly: false,
	args: true,
	async execute(message, args) {
		const commandName = args.shift();
		try {
			const command = require(`./${commandName}.js`);
			message.client.commands.set(command.name, command);
			message.reply(`Loaded \`${command.name}\` successfully`);
		} catch (e) {
			console.error(e.stack);
			message.channel.send(`There was an error while loading a command \`${commandName}\`:\n\`${e.message}\``);
		}
	}
};