///////// configuration start ///////////
var job_target = 'thingiverse'; // must be filled
var job_settings = { // it does not matter too much for this option
	'client_job_request_count': 5, 
	'web_access_interval': 5000, // how long wait for next web visit, set this to prevent blocking from IP. 
	'connection_try_max': 10,
};
///////// configuration end ///////////
console.log('reading configuration for %s...', client.my_job_target);

var client = require('./client_base.js');
client.set_myenv();
client.set_my_job_target(job_target);
client.set_folder();
client.set_my_job_settings(job_settings);
client.main();

