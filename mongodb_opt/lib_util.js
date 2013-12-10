var colors = require('colors');
var util = require('util');

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


module.exports.step_print = step_print;
module.exports.event_print = event_print;