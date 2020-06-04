const dashflagRegex = /(?<=\s|^)-[a-zA-Z]+(?=\s|$)/;

function parsePositionalArgs(args,keys,flags,flagRegex) 
{
	if(typeof flagRegex === 'undefined') flagRegex = dashflagRegex;
	if(!(flagRegex instanceof RegExp)) throw new TypeError(`flagRegex must be a Regular Expression`);
	if(keys.length != flags.length) throw new RangeError(`Must same number of keys and flags`);
	const obj = {};
	for(let i = 0; i < keys.length; i++)
	{
		const flag = flags[i];
		if(args.includes(flag))
		{
			const key = keys[i];
			const indexKey = args.indexOf(flag);
			const nextFlagIndex = args.slice(indexKey+1).findIndex(arg => flagRegex.test(arg));
			const val = args.splice(indexKey+1, nextFlagIndex==-1 ? args.length : nextFlagIndex).join(' ');
			Object.defineProperty(obj, key, {value: val, writable: true, enumerable: true, configurable: true});
			args.splice(indexKey,1);
		}
	}
	return obj;
}

module.exports = parsePositionalArgs;