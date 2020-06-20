const Manager = require(`${process.cwd()}/util/Manager.js`);
const ScheduledEvent = require(`./ScheduledEvent.js`);

class ScheduledEventManager extends Manager
{
	/// @private @readonly
	
	constructor(client,iterable,dbname)
	{
		super(client,iterable,ScheduledEvent,undefined,null,dbname);
		
		/// @readonly
		this.events = this._db.define('events', {
			id: { 
				type: Sequelize.UUID,
				primaryKey: true
			},
			name: type: Sequelize.STRING,
			user: Sequelize.INTEGER,
			schedule: Sequelize.INTEGER,
			recurring: Sequelize.BOOLEAN,
			precision: Sequelize.STRING,
			endAt: Sequelize.INTEGER,
			totalOccurances: Sequelize.INTEGER,
			enabled: Sequelize.BOOLEAN
		});
		this.events.sync();
	}
	
	add(value, cache=true, { id, extras = [] }, callback, error)
	{
		return new Promise(async (resolve,reject) =>
		{
			if(callback) resolve = callback;
			if(error) reject = error;
			const entry = super._addHandler(value,cache,{ id, extras });
			const dbEntry = await this._dbFetch(value,id) ||
			await this.events.create({
				name: entry.getName(),
				user: entry.author.id,
				schedule: entry.getSchedule(),
				recurring: entry.recurring,
				precision: entry.precision,
				endAt: entry.endAt,
				totalOccurances: entry.totalOccurances,
				enabled: entry.enabled
			});
			resolve(dbEntry);
		});
	}
	
	remove(value, fromCache=true, id, callback, error)
	{
		return new Promise(async (resolve,reject) =>
		{
			if(callback) resolve = callback;
			if(error) reject = error;
			const entry = super._removeHandler(value,false,id) || await this.fetch(value,fromCache,id);
			if(!entry) resolve(null);
			if(entry instanceof Array) resolve(entry);
			super._removeHandler(value,fromCache,id);
			const rowCount = await this.events.destroy({ where: { name: entry.name, user: entry.author.id } });
			resolve(entry);
		});
	}
	
	fetch(value, cache=true, id, fromDB=true, callback, error)
	{
		return new Promise(async (resolve, reject) =>
		{
			if(callback) resolve = callback;
			if(error) reject = error;
			if(!fromDB && this.cache.get(id || value.id)) resolve(this.cache.get(id || value.id));
			const list = this._reconstructListFromHolds(await this.events.findAll({ where: { name: entry.name, user: entry.author.id } }));
			if(list.length == 0) resolve(null);
			if(list.length > 1) resolve(list);
			const [ entry ] = list;
			if(cache) this.cache.set(entry.id || id, entry);
			resolve(entry);
		});
	}
	
	/// @private
	_dbFetch(value,id)
	{
		return new Promise(async (resolve, reject) =>
		{
			const list = this._reconstructListFromHolds(await this.events.findAll({ where: { name: entry.name, user: entry.author.id } }));
			if(list.length == 0) resolve(null);
			if(list.length > 1) resolve(list);
			const [ entry ] = list;
			resolve(entry);
		});
	}
	
	/// @private
	_reconstructListFromHolds(list)
	{
		const reconst = list.map(options => {
			options._semsig = true;
			const sev = ScheduledEvent.build(options);
			if(!options.enabled) sev.disable();
			return sev;
		});
		return reconst;
	}
}