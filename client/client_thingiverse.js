///////// configuration start ///////////
global.my_job_target = 'thingiverse'
global.job_settings = {
	'client_job_request_count': 5, 
	'web_access_interval': 5000, // how long wait for next web visit, set this to prevent blocking from IP. 
	'connection_try_max': 10,
};
///////// configuration end ///////////
console.log('reading configuration for %s...', global.my_job_target);

var client = require('./client_base.js');
client.main();