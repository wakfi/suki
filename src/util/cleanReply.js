const Message = require((require.resolve('discord.js')).split('\\').slice(0, -1).join('\\') + '\\structures\\Message.js');
const delay = require('./delay.js');

function cleanReply(message, input, duration)
{
	return new Promise(async (resolve,reject) =>
	{
		if(typeof message === "undefined") throw new TypeError(`message is undefined`);
		if(!(message instanceof Message)) throw new TypeError(`message is not Discord Message`);
		if(typeof input === "undefined") input = "an unknown error occured";
		if(typeof duration === "undefined") duration = "12s";
		const errReply = await message.reply(input);
		if(duration == 0 || message.channel.type === 'dm') {resolve(); return;}
		await delay(duration);
		await errReply.delete();
		try {
			await message.delete();
		} catch(e) {
			console.error(`Error with cleanup after cleanReply:\n${e}`);
		}
		resolve();
	});
}

module.exports = cleanReply;