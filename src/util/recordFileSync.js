var fs = require('fs-extra');

//save an object to a properly formatted JSON file. Arrays are output on a single line (they aren't normally when using the spacing argument)
function recordFileSync(obj, path)
{
	var objJson = JSON.stringify(obj,function(k,v){
			if(v instanceof Array)
				return JSON.stringify(v);
			return v;
		},4).replace(/\\/g, '')
			.replace(/\"\[/g, '[')
			.replace(/\]\"/g,']')
			.replace(/\"\{/g, '{')
			.replace(/\}\"/g,'}');
	fs.outputFile(path, objJson, (err) => {
		if (err) throw err; // Error while writing file
	});
}

module.exports = recordFileSync;