const fs = require('fs');
const assert = require('assert').strict;

function loadAllCommands(client, dirPath)
{
	const commandFiles = fs.readdirSync(`${dirPath}`).filter(file => file.endsWith('.js'));
	const subDirs = fs.readdirSync(`${dirPath}`, {withFileTypes:true}).filter(subdir => subdir.isDirectory());
	for(const file of commandFiles) {
		const command = require(`${dirPath}/${file}`);
		assert(!client.commands.has(command.name));
		client.commands.set(command.name, command);
	}
	for(const subdir of subDirs) {
		loadAllCommands(client, `${dirPath}/${subdir.name}`);
	}
}

module.exports = loadAllCommands;