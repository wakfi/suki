const cleanReply = require('./cleanReply.js');

function authorReply(message, input)
{
	return new Promise(async (resolve,reject) =>
	{
		if(typeof message === "undefined") throw new TypeError(`message is undefined`);
		if(!(message instanceof Discord.Message)) throw new TypeError(`message is not Discord Message`);
		if(typeof input === "undefined") input = "an unknown error occured";
		try {
			await message.author.send(input);
		} catch(e) {
			cleanReply(`It looks like I can't DM you. Do you have DMs disabled?`);
		}
		resolve();
	});
}

module.exports = authorReply;