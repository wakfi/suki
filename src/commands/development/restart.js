module.exports = {
	name: 'restart',
	description: 'Normal restart. The process manager (pm2) will restart it automatically',
	category: 'development',
	permLevel: 'Moderator',
	noArgs: true,
	async execute(message, args) {
		process.exit(0);
	}
};