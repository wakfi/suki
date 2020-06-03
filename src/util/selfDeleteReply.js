const path = require('path');
const Message = require((require.resolve('discord.js')).split(path.sep).slice(0, -1).join(path.sep) + `${path.sep}structures${path.sep}Message.js`);
const delay = require('./delay.js');

function selfDeleteReply(message, input, duration)
{
	return new Promise(async (resolve,reject) =>
	{
		if(!(message instanceof Message)) throw new TypeError(`message is not Discord Message`);
		if(typeof input === "undefined") input = "an unknown error occured";
		if(typeof duration === "undefined") duration = "15s";
		const errReply = await message.reply(input);
		if(duration == 0) resolve();
		await delay(duration);
		await errReply.delete();
		resolve();
	});
}

module.exports = selfDeleteReply;