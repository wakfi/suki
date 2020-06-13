const path = require('path');
const Message = require((require.resolve('discord.js')).split(path.sep).slice(0, -1).join(path.sep) + `${path.sep}structures${path.sep}Message.js`);
const cleanReply = require('./cleanReply.js');

function authorReply(message, input)
{
	return new Promise(async (resolve,reject) =>
	{
		if(typeof message === "undefined") throw new TypeError(`message is undefined`);
		if(!(message instanceof Message)) throw new TypeError(`message is not Discord Message`);
		if(typeof input === "undefined") input = "an unknown error occured";
		try {
			await message.author.send(input);
		} catch(e) {
			cleanReply(message,`It looks like I can't DM you. Do you have DMs disabled?`);
			reject(false);
		}
		resolve();
	});
}

module.exports = authorReply;