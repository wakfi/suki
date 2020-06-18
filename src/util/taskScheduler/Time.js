const precisions = {'hour':{hours:true},'minute':{hours:true,minutes:true},'second':{hours:true,minutes:true,seconds:true},'millisecond':{hours:true,minutes:true,seconds:true,milliseconds:true}};
const pad = (number, zeros) => {
	zeros = zeros || 2;
	const padded = (Array.from({length:zeros}, ()=>'0')).join('');
	return padded.slice(-(number.length))+number;
};

class Time
{
	static AM_PATTERN = /(?:\d{,2}:?\d{,2}:?\d{,2}:?\d{,4})(?<=\d) ?([aA]\.?[mM]\.?)/g;
	static PM_PATTERN = /(?:\d{,2}:?\d{,2}:?\d{,2}:?\d{,4})(?<=\d) ?([pP]\.?[mM]\.?)/g;
	
	/**
	 * @param {string} timeString  a string representing a time. Defaults to hours
	 * Examples:
	 * '3' parses to 3am
	 * '3am', '3AM', '03 am' parse to 3am
	 * '5:28' parses to 5:28am
	 * '5:28P.M.' parses to 5:28pm
	 * etc
	 */
	static parse(timeString)
	{
		if(!(timeString instanceof String)) return NaN;
		const args = timeString.split(':');
		const values = args.filter(arg => !isNaN(arg));
		const last = args.pop();
		args.push(last);
		if(isNaN(last) && !isNaN(parseInt(last))) 
		{
			values.push(parseInt(last));
			const [ desig ] = Time.AM_PATTERN.exec(last) || Time.PM_PATTERN.exec(last);
			if(desig) values.push(desig);
			else return NaN;
		}
		const hour12 = args.length != values.length;
		if(!values.length) return NaN;
		const options = {hours: values[0], minutes: values[1], seconds: values[2], milliseconds: values[3], hour12: hour12};
		if(options.hours > 23 || options.minutes > 59 || options.seconds > 59 || options.milliseconds > 999) return NaN;
		return new Time(options);
	}
	
	/**
	 * @typedef {TimeOptions} 
	 * @property {number} [hours]
	 * @property {number} [minutes]
	 * @property {number} [seconds]
	 * @property {number} [milliseconds]
	 * @property {string} [designator] am/A.M. or pm/P.M., or omit for 24-hour clock format
	 * @property {boolean} [hour12] convenience
	 * @property {string} [precision] forced time precision on toString
	 * @property {boolean} [strictPrecision] if true, do not include leading 0s in toString (e.g. 00:30:15 would be 30:15)
	 */
	static build(time,options,hour12)
	{
		if((time instanceof Date || typeof time === 'string' || typeof time === 'number') && (!options || typeof options === 'boolean'))
		{			
			if(typeof options === 'boolean') 
			{
				hour12 = options; 
			}
			return new Time(time,hour12);
		}
		if(typeof time === 'string') time = Time.parse(time);
		if(typeof options === 'boolean') {hour12 = options; options = undefined;}
		if(time instanceof Time && typeof options === 'string') options = Time.parse(options)._options;
		if(typeof options === 'undefined') 
		{
			if(typeof time === 'object') 
			{
				options = time;
				time = undefined;
			} else {
				options = {};
			}
		}
		if(time instanceof Time)
		{
			if(!options.hours) options.hours = time.hours;
			if(!options.minutes) options.minutes = time.minutes;
			if(!options.seconds) options.seconds = time.seconds;
			if(!options.milliseconds) options.milliseconds = time.milliseconds;
			if(!options.designator) options.designator = time.designator;
			if(typeof options.hour12 === 'undefined') options.hour12 = time._hour12;
			time = undefined;
		}
		return new Time(options,hour12);
	}
	
	/**
	 * @typedef {TimeResolvable}
	 * A TimeResolvable is one of:
	 * - A TimeOptions object containing desired time values
	 * - A string value representing a time, specified in a format recognized by the Time.parse() method
	 * - A Date object, from which the time fields will be used
	 * - An integer value representing the number of milliseconds since the UNIX epoch. This will be resolved to a Date, which will be treated as as if it were passed as the parameter
	 * @see Time
	 * @see TimeOptions
	 * @see [Date]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date}
	 */
	
	/**
	 @param {TimeResolvable} [options] a value that can be resolved to a time, or if no parameter is given, the current time is used
	 @param {boolean} [hour12] ignored if options is a TimeOptions. Allows 12-hour or 24-hour to be specified when using non-verbose construction
	 @see Time#build
	 */
	constructor(options,hour12)
	{
		if(typeof options === 'undefined') options = new Date();
		else if(typeof options === 'number') options = new Date(options);
		else if(typeof options === 'string') {this = Time.parse(options); return;}
		if(options instanceof Date)
		{
			const d = options;
			options = {hours: d.getHours(), minutes: d.getMinutes(), seconds: d.getSeconds(), milliseconds: d.getMilliseconds(), designator: hour12?d.getHours()<12?'A.M.':'P.M':undefined}
		}
		if(!options.designator && options.hour12) options.designator = options.hours < 12 ? 'A.M.' : 'P.M';
		if(typeof options.hour12 !== 'undefined' && !options.hour12) options.designator = undefined;
		
		/**
		 * @private
		 * @property {number} _hours
		 */
		this._hours = options.hours;
		
		/**
		 * @private
		 * @property {number} _minutes
		 */
		this._minutes = options.minutes;
		
		/**
		 * @private
		 * @property {number} _seconds
		 */
		this._seconds = options.seconds;
		
		/**
		 * @private
		 * @property {number} _milliseconds
		 */
		this._milliseconds = options.milliseconds;
		
		/**
		 * @private
		 * @property {string} _designator
		 */
		this._designator = (typeof options.designator === 'undefined') ? options.designator : (options.designator === 'pm' ? 'pm' : 'am');
		
		/**
		 * @private
		 * @property {boolean} _hour12
		 */
		this._hour12 = typeof this._designator !== 'undefined';
		
		/**
		 * @private
		 * @property {string} _precision
		 */
		this._precision = precision[options.precision];
		
		/**
		 * @private
		 * @property {boolean} _strict
		 */
		this._strict = options.strictPrecision;
		
		/**
		 * @private
		 * @property {TimeOptions} options this Time was constructed using
		 */
		Object.defineProperty(this, '_options', {value: options});
		
		if(this._hour12 && this._designator === 'pm') {this._hour += 12; this._pm = true}
		
		Object.defineProperty(this, 'hours', {get(){ return this._hours }, set:this.setHours, enumerable: true, configurable: true});
		Object.defineProperty(this, 'minutes', {get(){ return this._minutes }, set:this.setMinutes, enumerable: true, configurable: true});
		Object.defineProperty(this, 'seconds', {get(){ return this._seconds }, set:this.setSeconds, enumerable: true, configurable: true});
		Object.defineProperty(this, 'milliseconds', {get(){ return this._milliseconds }, set:this.setMilliseconds, enumerable: true, configurable: true});
		Object.defineProperty(this, 'designator', {get(){ return this._designator }, set:this.setDesignator, enumerable: true, configurable: true});
		Object.defineProperty(this, 'precision', {get(){ return this._precision && (this._precision.millisecond && 'millisecond') || (this._precision.second && 'second') (this._precision.minute && 'minute') || (this._precision.hour && 'hour')}, set:this.setPrecision, enumerable: true, configurable: true});
	}
	
	getHours() { return this._hours }
	
	getMinutes() { return this._minutes }
	
	getSeconds() { return this._seconds }
	
	getMilliseconds() { return this._milliseconds }
	
	getDesignator() { return this.designator }
	
	setHours(hours) { return Time.build(this,{hours:hours}) };
	
	setMinutes(minutes) { return Time.build(this,{minutes:minutes}) };
	
	setSeconds(seconds) { return Time.build(this,{seconds:seconds}) };
	
	setMilliseconds(milliseconds) { return Time.build(this,{milliseconds:milliseconds}) };
	
	setDesignator(designator) { return Time.build(this,{designator:designator}) }
	
	setIs12Hour(is12Hour) { return Time.build(this,{hour12:is12Hour}) }
	
	is12Hour()
	{
		return this._hour12;
	}
	
	toString()
	{
		const vals = [];
		if(this._precision)
		{
			if(this._precision.hour) vals.push(pad((this._pm?this._hours-12:this._hours),2) || this._strict ? '' : pad((this._hour12?'12':'0'),2));
			if(this._precision.minute) vals.push(pad(this._minutes,2) ||(this._seconds || this._milliseconds) ? (this._strict && !this._hours ? '' : pad('0',2)) : '');
			if(this._precision.second) vals.push(pad(this._seconds,2) || (this._milliseconds ? (this._strict && !this._hours && !this.minutes ? '' : pad('0',2)) : ''));
			if(this._precision.millisecond) vals.push(pad((this._milliseconds || '0'),4));
		} else {
			vals.push(pad(((this._pm?this._hours-12:this._hours) || (this._hour12?'12':'0')),2);
			vals.push(pad(this._minutes,2) ||(this._seconds || this._milliseconds) ? (this._strict && !this._hours ? '' : pad('0',2)) : '');
			vals.push(pad(this._seconds,2) || (this._milliseconds ? pad('0',2) : ''));
			vals.push(pad(this._milliseconds,4) || '');
		}
		return vals.join(':') + (this._designator || '');
	}
	
	valueOf()
	{
		let ms = 0;
		ms += (this._hours + (((this._hour12 && (this._designator === 'pm')) ? 12 : 0)))*3600000 || 0;
		ms += this._minutes*60000 || 0;
		ms += this._seconds*1000 || 0;
		ms += this._milliseconds || 0;
		return ms;
	}
}

module.exports = Time;