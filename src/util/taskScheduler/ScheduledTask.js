const parseMonthFromString = (month) => {
	if(typeof month !== 'string') return month;
	const m = month.toLowerCase();
	switch(m) 
	{
		case 'jan': 
		case 'january': 
			return 1;
		case 'feb': 
		case 'february': 
			return 2;
		case 'mar': 
		case 'march': 
			return 3;
		case 'apr': 
		case 'april': 
			return 4;
		case 'may': 
			return 5;
		case 'jun': 
		case 'june': 
			return 6;
		case 'jul': 
		case 'july': 
			return 7;
		case 'aug': 
		case 'august': 
			return 8;
		case 'sep': 
		case 'sept': 
		case 'september': 
			return 9;
		case 'oct': 
		case 'october':
			return 10;
		case 'nov': 
		case 'november':
			return 11;
		case 'dec': 
		case 'december': 
			return 12;
		default: 
			throw new SyntaxError(`invalid month: "${month}"`);
	}
};

class ScheduledTask
{ 
	static build(arg,options)
	{
		if(arg instanceof String)
		{
			let d;
			if(options instanceof Date)
			{
				d = options;
				options = {};
			} else if(options.date) {
				d = options.date;
			} else if(!options.at) {
				throw new SyntaxError('you must provide sufficient arguments to specifcy the name and timing of the task');
			}
			options.name = arg;
			arg = d;
		}
		if(!(arg instanceof Date || arg instanceof ScheduledTask))
		{
			if(typeof arg === 'object')
			{
				options = arg;
			}
			arg = undefined;
		}
		if(typeof options === 'undefined')
		{
			if(typeof arg === 'undefined') throw new SyntaxError('you must provide arguments to specifcy the name and timing of the task');
			options = {};
		}
		const date = (arg instanceof Date) ? arg                   :
		    (arg instanceof ScheduledTask) ? arg.getScheduleDate() :
		    (options instanceof Date)      ? options               :
		                                options.date || new Date() ;
		if(arg instanceof ScheduledTask)
		{
			if(!options.name) options.name = arg.getName();
			if(!options.recurring) options.recurring = arg.recurring;
			if(!options.precision) options.precision = arg.precision;
			if(!options.endAt) options.endAt = arg.endAt;
			if(!options.totalOccurances) options.totalOccurances = arg.totalOccurances;
		}
		
		if(!options.name) throw new SyntaxError('you must provide arguments that specifcy the name of the task');
		
		if(options.at)
		{	
			if(options.at.year) date.setFullYear(options.at.year);
			if(options.at.month) date.setMonth(parseMonthFromString(options.at.month)-1);
			if(options.at.date) date.setDate(options.at.date);
			if(options.at.hours) date.setHours(options.at.hours-1);
			if(options.at.minutes) date.setMinutes(options.at.minutes-1);
			if(options.at.seconds) date.setSeconds(options.at.seconds-1);
			if(options.at.milliseconds) date.setMilliseconds(options.at.milliseconds-1);
		}
		if(options.end)
		{
			const endDate = options.endAt || new Date();
			if(options.end.year) endDate.setFullYear(options.end.year);
			if(options.end.month) endDate.setMonth(parseMonthFromString(options.end.month)-1);
			if(options.end.date) endDate.setDate(options.end.date);
			if(options.end.hours) endDate.setHours(options.end.hours-1);
			if(options.end.minutes) endDate.setMinutes(options.end.minutes-1);
			if(options.end.seconds) endDate.setSeconds(options.end.seconds-1);
			if(options.end.milliseconds) endDate.setMilliseconds(options.end.milliseconds-1);
			options.endAt = endDate;
		}
		
		return new ScheduledTask(options.name, date, options);
	}
	
	constructor(name,date,options)
	{
		Object.defineProperty(this, '_name', {value: name, writable:false, enumerable:true, configurable:false});
		Object.defineProperty(this, '_schedule', {value: date, writable:false, enumerable:true, configurable:false});
		/*
		 Only the time components of the date matter for recurring
		 tasks. For non-recurring tasks, the entire date matters
		 */
		Object.defineProperty(this, 'recurring', {value: options.recurring || false, writable:false, enumerable:true, configurable:false});
		Object.defineProperty(this, 'precision', {value: options.precision.toLowerCase() || 'seconds', writable:false, enumerable:true, configurable:false});
		Object.defineProperty(this, 'endAt', {value: options.endAt || null, writable:false, enumerable:true, configurable:false});
		Object.defineProperty(this, 'totalOccurances', {value: options.totalOccurances || 0, writable:false, enumerable:true, configurable:false});
		
		this._hours = false;
		this._minutes = false;
		this._seconds = false;
		this._milliseconds = false;
		switch(this.precision)
		{
			case 'milliseconds':
				this._milliseconds = true;
			case 'seconds':
				this._seconds = true;
			case 'minutes':
				this._minutes = true;
			case 'hours':
				this._hours = true;
				break;
			default:
				throw new SyntaxError(`unknown time precision: ${this.precision}`);
		}
		Object.defineProperty(this, '_hours', {writable:false, enumerable:true, configurable:false});
		Object.defineProperty(this, '_minutes', {writable:false, enumerable:true, configurable:false});
		Object.defineProperty(this, '_seconds', {writable:false, enumerable:true, configurable:false});
		Object.defineProperty(this, '_milliseconds', {writable:false, enumerable:true, configurable:false});
		
		Object.defineProperty(this, 'enabled', {value: false, writable:true, enumerable:true, configurable:false});		
		if(this.recurring)
		{
			this.enabled = true;
		} else {
			const initTime = new Date();
			this.enabled = this._schedule > initTime;
		}
	}
	
	enable()
	{
		this.enabled = true;
	}

	disable()
	{
		this.enabled = false;
	}
	
	getName()
	{
		return this._name();
	}
	
	getSchedule()
	{
		if(this.recurring)
		{
			const tstring = `${this._hours?this._schedule.hours+':':''}${this._minutes?this._schedule.minutes+':':''}${this._seconds?this._schedule.seconds+':':''}${this._milliseconds?this._schedule.milliseconds+':':''}`;
			return tstring.slice(0,tstring.length-1);
		} else {
			return this._schedule.toLocaleString(`${this._schedule.toLocaleString('en-US',{year:'numeric',month:'numeric',day:'numeric'})} ${this._schedule.toLocaleTimeString({hour: this._hours?'2-digit':undefined, minute: this._minutes?'2-digit':undefined, second: this._seconds?'2-digit':undefined},{hour12:false})}${this._milliseconds?':'+this._schedule.toLocaleTimeString({millisecond:'4-digit'}):''}`);
		}
	}
	
	getScheduleDate()
	{
		return this._schedule;
	}
	
	toString()
	{
		return this.getSchedule();
	}
	
	valueOf()
	{
		return this._schedule - Date.now();
	}
}