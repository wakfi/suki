const parseTime = require('./parseTime.js');

//create a promise that resolves after the specified amount of time
function delay(timeToDelay)
{
	return new Promise(async (resolve,reject)=>
	{
		const timeInMilliseconds = parseTime(timeToDelay);
		setTimeout(async function(){
			resolve();
		}, timeInMilliseconds);
	});
}

module.exports = delay;