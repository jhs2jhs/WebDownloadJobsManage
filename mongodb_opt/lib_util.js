var colors = require('colors');
var util = require('util');
var mkdirp = require('mkdirp');

function step_print(){
	process.stdout.write((new Date()).toGMTString().red+' ');
	for(var i = 0; i<arguments.length; i++){
		process.stdout.write(arguments[i].toString().red+' ');
	}
	console.log();
}

function event_print(){
	process.stdout.write((new Date()).toGMTString().blue+' ');
	for(var i = 0; i<arguments.length; i++){
		process.stdout.write(arguments[i].toString().blue+' ');
	}
	console.log();
}

function folder_init(data_row_path, my_job_target){
	folder_path = '../../'+data_row_path+'/web_jobs/'+my_job_target;
	mkdirp(folder_path, function(err){
		console.error(err)
	})
}

module.exports.step_print = step_print;
module.exports.event_print = event_print;
module.exports.folder_init = folder_init;