/* DERIVED FROM BaseManager.js FROM DISCORD.JS LIBRARY, LICENSED UNDER APACHE 2.0

    Copyright 2015 - 2020 Amish Shah

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.


   MODIFIED FOR DATABASE CONNECTION TO SUIT THIS PROJECT AND RELICENSED UNDER MIT

    MIT License

	Copyright (c) 2020 Walker Gray

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.

*/


const Collection = require('@discordjs/collection');
const Sequelize = require('sequelize');

/**
 * @abstract
 */
class Manager
{
	constructor(client,iterable,holds,cacheType=Collection,...cacheArgs,dbname='database')
	{
		/** @readonly */ this.client = client;
		/** @readonly */ this.holds = holds;
		this.cacheType = cacheType;
		this.cache = new cacheType(...cacheArgs);
		/** @private @readonly */ this._db = new Sequelize(dbname,'user','password', {
			host: 'localhost',
			dialect: 'sqlite',
			logging: false,
			storage: `${dbname}.sqlite`
		});
		if(iterable) for(const it of iterable) this.add(i);
	}
	
	_addHandler(value, cache=true, { id, extras = [] })
	{
		const exists = this.cache.get(id || value.id);
		if(exists)
		{
			this._removeHandler(exists.id,cache);
			return this._addHandler(exists.id,cache);
		}
		const entry = value instanceof this.holds ? value : new this.holds(value, ...extras);
		if(cache) this.cache.set(id || entry.id, entry);
		return entry;
	}
	
	_removeHandler(value, fromCache=true, id)
	{
		const exists = this.cache.get(id || value.id);
		if(!exists) return null;
		if(fromCache) this.cache.delete(id || exists.id);
		return exists;
	}
	
	resolve(idOrInstance)
	{
		if(idOrInstance instanceof this.holds) return idOrInstance;
		if(typeof idOrInstance === 'string') return this.cache.get(idOrInstance) || null;
		return null;
	}
	
	resolveID(idOrInstance)
	{
		if(idOrInstance instanceof this.holds) return idOrInstance.id;
		if(typeof idOrInstance === 'string') return idOrInstance;
		return null;
	}
	
	valueOf()
	{
		return this.cache;
	}
}

module.exports = Manager;