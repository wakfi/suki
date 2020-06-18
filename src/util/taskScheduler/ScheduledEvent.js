const Time = require('./Time.js');
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

class ScheduledEvent
{ 
	/** @lends ScheduledEvent.prototype */
	
	/**
	 * @typedef {Object} ScheduledEventBuilderTimeDescription
	 * @property {number} [year]
	 * @property {number|string} [month]
	 * @property {number} [date]
	 * @property {number} [hours]
	 * @property {number} [minutes]
	 * @property {number} [seconds]
	 * @property {number} [milliseconds]
	 */
	
	/**
	 * @typedef {Object} ScheduledEventBuilderOptions
	 * @property {string} [name]
	 * @property {boolean} [recurring]
	 * @property {string} [precision]
	 * @property {Date} [endAt]
	 * @property {totalOccurances} [number]
	 * @property {at} [ScheduledEventBuilderTimeDescription]
	 * @property {end} [ScheduledEventBuilderTimeDescription]
	 */
	
	/**
	 * @constructs
	 * @param {Date|Time|ScheduledEvent|String} [arg]
	 * @param {ScheduledEventBuilderOptions|Date|Time} [options]
	 */
	static build(arg,options)
	{
		if(arg instanceof String)
		{
			let d;
			if(options instanceof Date || options instanceof Time)
			{
				d = options;
				options = {};
			} else if(options.date || options.time) {
				d = options.date || options.time;
			} else if(!options.at) {
				throw new SyntaxError('you must provide sufficient arguments to specifcy the name and timing of the task');
			}
			options.name = arg;
			arg = d;
		}
		if(!(arg instanceof Date || arg instanceof Time || arg instanceof ScheduledEvent))
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
		const date = (arg instanceof Date || arg instanceof Time)  ? arg                   :
		    (options instanceof Date || options instanceof Time)   ? options               :
		    (arg instanceof ScheduledEvent)                        ? arg.getScheduleDate() :
		                                                        options.date || new Date() ;
		if(arg instanceof ScheduledEvent)
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
		
		return new ScheduledEvent(options.name, date, options);
	}
	
	constructor(name,date,options)
	{
		/** @private */ this._name = name;
		if(date instanceof Date)
		{
			/** @private */ this._date = date;//Object.defineProperty(this, '_date', {value: date, writable:false, enumerable:false, configurable:false});
		} else if(date instanceof Time) {
			/** @private */ this._time = date;//Object.defineProperty(this, '_time', {value: date, writable:false, enumerable:false, configurable:false});
		} else {
			return NaN;
		}
		/** @private */ Object.defineProperty(this, '_schedule', {get(){ return this._date || this._time }, enumerable:true, configurable:true});
		/*
		 Only the time components of the date matter for recurring
		 tasks. For non-recurring tasks, the entire date matters.
		 If _time is given for a non-recurring occurance, it will be 
		 redefined as the next Date to occur with the given Time.
		 If _date is given for a recurring occurance, it will be 
		 redefined as a Time using the time values of the given Date
		 */
		this.recurring = options.recurring || false;
		this.precision = options.precision.toLowerCase() || 'seconds';
		this.endAt = options.endAt || null;
		this.totalOccurances = options.totalOccurances || 0;
		
		/** @private */ this._hours = false;
		/** @private */ this._minutes = false;
		/** @private */ this._seconds = false;
		/** @private */ this._milliseconds = false;
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
		
		this.enabled = false;
		Object.defineProperty(this, 'enabled', {get(){ return this._enabled }, enumerable:true, configurable:true});		
		if(this.recurring)
		{
			if(this._date)
			{
				this._time = new Time(this._date);
				this._date = undefined;
			}
			this._enabled = true;
		} else {
			if(this._time)
			{
				const d = new Date();
				const t = this._time;
				if(t.hours) d.setHours(t.hours);
				if(t.minutes) d.setMinutes(t.minutes);
				if(t.seconds) d.setSeconds(t.seconds);
				if(t.milliseconds) t.setMilliseconds(t.milliseconds);
				if(d < new Date())
				{
					const oneDayInMilliseconds = 86400000;
					d.setTime(d + oneDayInMilliseconds);
				}
				this._date = d;
				this._time = undefined;
			}
			const initTime = new Date();
			this._enabled = this._schedule > initTime;
		}
	}
	
	enable()
	{
		this._enabled = true;
	}

	disable()
	{
		this._enabled = false;
	}
	
	getName()
	{
		return this._name;
	}
	
	getSchedule()
	{
		return this._schedule;
	}
	
	/**
	 * @override
	 * @return {string} string version of when this event is scheduled
	 */
	toString()
	{
		if(this.recurring)
		{
			const tstring = `${this._hours?this._schedule.hours+':':''}${this._minutes?this._schedule.minutes+':':''}${this._seconds?this._schedule.seconds+':':''}${this._milliseconds?this._schedule.milliseconds+':':''}`;
			return tstring.slice(0,tstring.length-1);
		} else {
			return this._schedule.toLocaleString(`${this._schedule.toLocaleString('en-US',{year:'numeric',month:'numeric',day:'numeric'})} ${this._schedule.toLocaleTimeString({hour: this._hours?'2-digit':undefined, minute: this._minutes?'2-digit':undefined, second: this._seconds?'2-digit':undefined},{hour12:false})}${this._milliseconds?':'+this._schedule.toLocaleTimeString({millisecond:'4-digit'}):''}`);
		}
	}
	
	/**
	 * @override
	 * @return {string} time remaining until this event occurs, in milliseconds
	 */
	valueOf()
	{
		return this._schedule - Date.now();
	}
}

module.exports = ScheduledEvent;