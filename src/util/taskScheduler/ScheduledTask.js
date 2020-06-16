class ScheduledTask
{
	static build(arg,options)
	{
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
			if(typeof arg === 'undefined') throw new SyntaxError('you must provide arguments to specifcy the timing of the task');
			options = {};
		}
		const date = (arg instanceof Date) ? arg 			  	   :
			(arg instanceof ScheduledTask) ? arg.getScheduleDate() :
											 new Date()		   	   ;
		if(arg instanceof ScheduledTask)
		{
			if(!options.name) options.name = arg.getName();
			if(!options.recurring) options.recurring = arg.recurring;
			if(!options.precision) options.precision = arg.precision;
			if(!options.endAt) options.endAt = arg.endAt;
			if(!options.totalOccurances) options.totalOccurances = arg.totalOccurances;
		}
		if(options.year) date.setFullYear(options.year);
		if(options.month) date.setMonth(options.month);
		if(options.date) date.setDate(options.date);
		if(options.hours) date.setHours(options.hours);
		if(options.minutes) date.setMinutes(options.minutes);
		if(options.seconds) date.setSeconds(options.seconds);
		if(options.milliseconds) date.setMilliseconds(options.milliseconds);
		
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
		const initTime = new Date();
		if(this.recurring)
		{
			this.enabled = true;
		} else {
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
			return `${this._hours?this._schedule.hours+':':''}${this._minutes?this._schedule.minutes+':':''}${this._seconds?this._schedule.seconds+':':''}${this._milliseconds?this._schedule.milliseconds:''}`; //this._schedule.toTimeString() with a format specification will probably be easier
		} else {
			return this._schedule.toString();
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
}