const selfDeleteReply = require('./selfDeleteReply.js');

function cleanReply(message, input, duration)
{
	return new Promise(async (resolve,reject) =>
	{
		await selfDeleteReply(message,input,duration);
		try {
			if(message.channel.type !== 'dm') await message.delete();
		} catch(e) {
			console.error(`Error with cleanup after cleanReply:\n${e}`);
		}
		resolve();
	});
}

module.exports = cleanReply;