const parseTime = require('./parseTime.js');

/*

 create a timed delay promise
 
 */
function delay(timeToDelay)
{
	const timeInMilliseconds = parseTime(timeToDelay);
	return new Promise(async (resolve,reject)=>
	{
		if(isNaN(timeInMilliseconds)) reject(false);
		setTimeout(async function(){
			resolve(true);
		}, timeInMilliseconds);
	});
}

module.exports = delay;