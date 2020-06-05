const dashflagRegex = /(?<=\s|^)-[a-zA-Z]+(?=\s|$)/gi;

function parseTruthyArgs(args,keys,flags,options) 
{
	if(typeof options === 'undefined') options = {};
	let flagRegex = options.flagRegex;
	let singlePosition = options.singlePosition;
	if(typeof flagRegex === 'undefined') flagRegex = dashflagRegex;
	if(!(flagRegex instanceof RegExp)) throw new TypeError(`flagRegex must be a Regular Expression`);
	if(keys.length != flags.length) throw new RangeError(`Must have same number of keys and flags`);
	const obj = {};
	const allMatches = [...args.join(' ').matchAll(flagRegex)];
	const found = (function(){
		if(allMatches){
			let joining = allMatches.join('');
			let splitting = joining.split('-');
			joining = splitting.join('');
			splitting = joining.split('');
			return splitting.map(splitval => splitval = '-'+splitval);
		}
		return null
	})();
	let count = 0;
	if(found)
	{
		for(let i = 0; i < keys.length; i++)
		{
			const flag = flags[i];
			const key = keys[i];
			if(found.includes(flag))
			{
				const indexKey = found.indexOf(flag);
				found.splice(indexKey,1);
				args.splice(args.indexOf(key),1);
				Object.defineProperty(obj, key, {value: true, writable: true, enumerable: true, configurable: true});
				count++;
			} else {
				Object.defineProperty(obj, key, {value: false, writable: true, enumerable: true, configurable: true});
			}
		}
	}
	Object.defineProperty(obj, 'args', {value: args, writable: true, enumerable: true, configurable: true});
	Object.defineProperty(obj, 'found', {value: found, writable: true, enumerable: true, configurable: true});
	Object.defineProperty(obj, 'count', {value: count, writable: true, enumerable: true, configurable: true});
	return obj;
}

module.exports = parseTruthyArgs;