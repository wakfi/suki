
/*

 parse time inputs with flexible syntax. accepts any mix of years, weeks, days, hours, minutes, seconds, milliseconds.
 does not accept months because how many days is a month anyways? why do you need that?
 
 1h15m30s200ms
 1h
 15m
 30s
 200ms
 1h30s
 15m30s
 
*/
function parseTime(timeToParse)
{
	let timeValue = timeToParse;
	if(isNaN(timeToParse))
	{
		const timeString = timeToParse;
		if(/[^ymwdhms](?<=m)s?/.test(timeString))
		{
			timeValue = timeToParse;
		} else {
			let match = null;
			const yearReg = /(\d+)y/gi;
			const weekReg = /(\d+)w/gi;
			const dayReg = /(\d+)d/gi;
			const hourReg = /(\d+)h/gi;
			const minReg = /(\d+)m(?!s)/gi;
			const secReg = /(\d+)s/gi;
			const msReg = /(\d+)ms/gi;
			let years = 0;
			let weeks = 0;
			let days = 0;
			let hours = 0;
			let minutes = 0;
			let seconds = 0;
			let milliseconds = 0;
			match = yearReg.exec(timeString);
			if(match !== null)
			{
				years = +match[1];
			}
			match = null;
			match = weekReg.exec(timeString);
			if(match !== null)
			{
				weeks = +match[1];
			}
			match = null;
			match = dayReg.exec(timeString);
			if(match !== null)
			{
				days = +match[1];
			}
			match = null;
			match = hourReg.exec(timeString);
			if(match !== null)
			{
				hours = +match[1];
			}
			match = null;
			match = minReg.exec(timeString);
			if(match !== null)
			{
				minutes = +match[1];
			}
			match = null;
			match = secReg.exec(timeString);
			if(match !== null)
			{
				seconds = +match[1];
			}
			match = null;
			match = msReg.exec(timeString);
			if(match !== null)
			{
				milliseconds = +match[1];
			}
			days += 365*years;
			days += 7*weeks;
			hours += 24*days;
			minutes += hours*60;
			seconds += minutes*60;
			milliseconds += seconds*1000;
			timeValue = milliseconds;
		}
	}
	return timeValue;
}

module.exports = parseTime;