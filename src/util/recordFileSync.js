var fs = require('fs-extra');

//[helper function] save to a JSON file. returns as function to allow easy usage with schedulers
function recordFile(obj, path)
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

module.exports = recordFile;