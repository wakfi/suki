const dashflagRegex = /(?<=\s|^)-[a-zA-Z]+(?=\s|$)/;

function parsePositionalArgs(args,keys,flags,options) 
{
	if(typeof options === 'undefined') options = {};
	let flagRegex = options.flagRegex;
	let singlePosition = options.singlePosition;
	if(typeof flagRegex === 'undefined') flagRegex = dashflagRegex;
	if(!(flagRegex instanceof RegExp)) throw new TypeError(`flagRegex must be a Regular Expression`);
	if(keys.length != flags.length) throw new RangeError(`must have same number of keys and flags`);
	const obj = {};
	for(let i = 0; i < keys.length; i++)
	{
		const flag = flags[i];
		if(args.includes(flag))
		{
			const key = keys[i];
			const indexKey = args.indexOf(flag);
			const nextFlagIndex = singlePosition ? 1 : args.slice(indexKey+1).findIndex(arg => flagRegex.test(arg));
			const val = args.splice(indexKey+1, nextFlagIndex==-1 ? args.length : nextFlagIndex).join(' ');
			Object.defineProperty(obj, key, {value: val, writable: true, enumerable: true, configurable: true});
			args.splice(indexKey,1);
		}
	}
	Object.defineProperty(obj, 'args', {value: args, writable: true, enumerable: true, configurable: true});
	return obj;
}

module.exports = parsePositionalArgs;