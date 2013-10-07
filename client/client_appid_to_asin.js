///////// configuration start ///////////
var my_job_target = 'appid_to_asin'
global.job_settings = {
	'client_job_request_count': 5, 
	'web_access_interval': 5000, // how long wait for next web visit, set this to prevent blocking from IP. 
};
///////// configuration end ///////////
console.log('reading configuration ...');

var myconfig = require('./CONFIG.js');
var myutil = require('./myutil.js')
var querystring = require('querystring');
var EJDB = require('ejdb');
console.log('DB file: ', myutil.my_client_db_file_path);
var ejdb = EJDB.open(myutil.my_client_db_file_path, EJDB.DEFAULT_OPEN_MODE);
var fs = require('fs');
myutil.folder_init(my_job_target);
//var domain = require('domain');
var events = require('events');
var eventEmitter = new events.EventEmitter();

/*

console.time('hello');
for (var i = 0; i<10000; i++){
	console.log(i);
}
//console.timeEnd('hello')
for (var i = 0; i<10000; i++){
	console.log(i);
}
console.timeEnd('hello');
//console.trace('hello')
*/
/*
var cluster = require('cluster');
var workers = process.env.WORKERS || require('os').cpus.length;
var workers = 2
console.log(workers);
if (cluster.isMaster) {
	console.log('== start cluster with %s workers'.yellow, workers);
	for (var i = 0; i < workers; i++) {
		var worker = cluster.fork().process;
		console.log('worker %s started.'.yellow, worker.pid);
	}
	cluster.on('disconnect', function(worker){
		console.log('== worker %s died, restart ...'.yellow, worker.process.pid);
		var worker = cluster.fork().process;
		console.log('worker %s restarted.'.yellow, worker.pid);
	});
} else {
	console.log('dd');
var d = domain.create(); // create a top-level domain for the service. 
d.add(ejdb);
d.add(myutil.http);
console.log('ddddd');
//d.add(this);
//d.add(myutil);
d.on('error', function(e){
	console.error('== domain error catched ==');
	cluster.worker.disconnect();
});
d.run(function(){
	console.log('== domain start to run =='.yellow.bold)
	fs.readFile(hello, function(){
		return cb;
	})
	//main();
	
});

}
*/

/////////////////////////
//////// event
/////////////////////////
eventEmitter.on('jobs_get_no_more_job', function(){
	// needs to see if needs to finish the jobs. 
	console.error("FINISH: jobs_get_no_more_job".blue.bold)
});
eventEmitter.on('http_connect_wrong_status', function(job_step, http_statusCode){
	console.error("ERROR: client_%s_get_resp_callback".red.bold, job_step, http_statusCode)
	switch(job_step) {
		case 'jobs_settings':
			client_jobs_get();
			break
		case 'jobs_get':
			client_jobs_do();
			break
		case 'jobs_do':
			client_jobs_put();
			break
		case 'jobs_put':
			client_jobs_settings_get();
			break
		default:
			client_jobs_settings_get();
	}
});
function http_connect_error(e, vars){
	eventEmitter.emit('http_connect_error', vars.job_step, e);
}
eventEmitter.on('http_connect_error', function(job_step, e){
	console.error("ERROR: client_%s_get_err_callback".red.bold, job_step, http_statusCode, e)
	switch(job_step) {
		case 'jobs_settings':
			client_jobs_get();
			break
		case 'jobs_get':
			client_jobs_do();
			break
		case 'jobs_do':
			client_jobs_put();
			break
		case 'jobs_put':
			client_jobs_settings_get();
			break
		default:
			client_jobs_settings_get();
	}
});
eventEmitter.on('job_step_done', function(job_step){
	console.log("DONE: %s".blue.italic, job_step)
	switch(job_step) {
		case 'jobs_settings':
			client_jobs_get();
			break
		case 'jobs_get':
			client_jobs_do();
			break
		case 'jobs_do':
			client_jobs_put();
			break
		case 'jobs_init':
		case 'jobs_put':
			client_jobs_settings_get();
			break
		default:
			client_jobs_settings_get();
	}
});
eventEmitter.on('ejdb_error', function(job_step){
	console.error("ERROR: ejdb, %s".red.bold, job_step)
	switch(job_step) {
		case 'jobs_settings':
			client_jobs_get();
			break
		case 'jobs_get':
			client_jobs_do();
			break
		case 'jobs_do':
			client_jobs_put();
			break
		case 'jobs_put':
			client_jobs_settings_get();
			break
		default:
			client_jobs_settings_get();
	}
	// needs to restart the services, 
});

///////////////////////
///////// jobs_settings
///////////////////////
function client_jobs_settings_get(){
	console.log('================ jobs_setting_get ==========================='.blue.italic);
	url_query = querystring.stringify({
		'settings_action':myutil.jobs_settings_actions.view
	});
	uri = myconfig.job_server_address+'/jobs_settings?'+url_query;
	var vars = {uri:uri, job_step:'jobs_settings'};
	console.log('** client_jobs_settings_get', vars.uri);
	myutil.request_get_http(vars, client_jobs_settings_get_resp_callback, http_connect_error);
}
function client_jobs_settings_get_resp_callback(http_statusCode, vars, resp, body){
	if (http_statusCode != 200) {
		EventEmitter.emit('http_connect_wrong_status', vars.job_step, http_statusCode);
		return
	}
	var jobs_settings = JSON.parse(body);
	for (var i = 0; i < jobs_settings.length; i++ ){
		var jobs_setting = jobs_settings[i];
		if (jobs_setting.job_target == my_job_target) {
			global.job_settings[jobs_setting['settings_key']] = parseInt(jobs_setting['settings_value']);
		}
	}
	console.log(global.job_settings)
	eventEmitter.emit('job_step_done', vars.job_step);
}

///////////////////////
//////// jobs_get
///////////////////////
function client_jobs_get(){
	console.log('================ jobs_get ==========================='.blue.italic);
	url_query = querystring.stringify({
		'client_id':myconfig.my_client_id, 
		'client_job_request_count':global.job_settings.client_job_request_count,
		'job_target': my_job_target
	});
	uri = myconfig.job_server_address+'/jobs_get?'+url_query;
	var vars = {uri:uri, job_step:'jobs_get'};
	console.log('** client_jobs_get', vars.uri)
	myutil.request_get_http(vars, client_jobs_get_resp_callback, http_connect_error);
}

function client_jobs_get_resp_callback(http_statusCode, vars, resp, body){
	if (http_statusCode != 200) {
		EventEmitter.emit('http_connect_wrong_status', vars.job_step, http_statusCode);
		return
	}
	var jobs = JSON.parse(body);
	if (jobs.length == 0){
		eventEmitter.emit('jobs_get_no_more_job');
		return
	} else {
		ejdb.save(my_job_target, jobs, function(err, oid){
			if (err) {
				eventEmitter.emit('ejdb_error', vars.job_step);
				return
			}
			eventEmitter.emit('job_step_done', vars.job_step);
		});
	}
}

///////////////////////
////////// jobs_put
///////////////////////
function client_jobs_put(){
	console.log('================ jobs_put ==========================='.blue.italic);
	ejdb.find(my_job_target, {}, function(err, cursor, count) {
		if (err) {
			console.error('client_jobs_put'.red.bold, 'ejdb', err);
			client_jobs_control('jobs_put_error');
			return;
		}
		if (count == 0) {
			// next job
			console.error('jobs_put'.red.bold, "count == 0");
			client_jobs_control('jobs_put_none');
			return;
		}
		jobs = []
		console.log("** client_jobs_put Found "+ count);
		while (cursor.next()) {
			jobs.push(cursor.object())
		}
		cursor.close();
		client_jobs_put_request(jobs);
	});
}

function client_jobs_put_request(jobs) {
	post_json = {
		'client_id':myconfig.my_client_id, 
		'job_target': my_job_target,
		'jobs': jobs
	};
	uri = myconfig.job_server_address+'/jobs_put';
	var vars = {uri:uri, post_json: post_json};
	console.log('** client_jobs_put_request', vars.uri, jobs.length)
	myutil.request_post_ec2(vars, client_jobs_put_resp_callback, client_jobs_put_err_callback);
}

function client_jobs_put_resp_callback(http_statusCode, vars, resp, body){
	jobs = body
	if (jobs.length == 0){
		console.error('client_jobs_put_resp_callback'.red.bold, 'jobs.length == 0')
		client_jobs_control('jobs_put_error');
	} else {
		client_jobs_bulk_remove(jobs, 0);
	}
}

function client_jobs_bulk_remove(jobs, i){
	if ( i < jobs.length ) {
		ejdb.remove(my_job_target, jobs[i]._id, function(err){
			if (err) {
				console.error('client_jobs_bulk_remove'.red.bold, 'ejdb.remove');
				client_jobs_control('jobs_put_error');
			} else {
				i = i + 1
				client_jobs_bulk_remove(jobs, i);
			}
		});
	} else {
		client_jobs_control('jobs_put_done');
	}
}

function client_jobs_put_err_callback(http_statusCode, vars, resp, body){
	console.error('client_jobs_put_err_callback'.red.bold, http_statusCode);
	client_jobs_control('jobs_put_error');
}


///////////////////////
////////// jobs_do 
///////////////////////
function client_jobs_do(){
	console.log('================ jobs_do ==========================='.blue.italic);
	client_jobs_do_single();
}
function client_jobs_do_single () {
	ejdb.findOne(my_job_target, {'job_status': {$lte: myutil.job_status_figure.unread}}, function(err, obj) {
		if (err) {
			eventEmitter.emit('ejdb_error', 'jobs_do');
			return;
		}
		if (obj == null) {
			// next job, no object founded
			console.error('== client_jobs_do_single'.yello.bold, "count == 0");
			eventEmitter.emit('job_step_done', 'jobs_do');
		} else {
			client_jobs_do_download(obj);
		}
	});
}

function client_jobs_do_download(job){
	var vars = {uri:job.job_url, job_file_path:job.job_file_path, job:job, job_step:'jobs_do'};
	console.log('** client_jobs_do_download', vars.uri, vars.job_file_path);
	myutil.request_get_http(vars, client_jobs_do_resp_callback, client_jobs_do_err_callback);
}

function client_jobs_do_resp_callback(http_statusCode, vars, resp, body){
	fs.writeFile(vars.job_file_path, body, function(err){
		if (err) {
			eventEmitter.emit('ejdb_error', vars.job_step);
			return
		} else {
			client_job_do_update(vars.job, http_statusCode, myutil.job_status_figure.error_when_reading)
		}
	});
}

function client_jobs_do_err_callback(error, vars){
	if (error.message == 'Parse Error') {
		// this error can be ignored
		console.log('this error can be ignored======');
	} else {
		// err would already set -1 for http_status in db
		client_job_do_update(vars.job, -1, myutil.job_status_figure.error_when_reading);
	}
}

function client_job_do_update(job, http_statusCode, job_status){
	job.http_status = http_statusCode;
	job.update_date = new Date().toGMTString();
	job.job_status = job_status;
	job.client_id = myconfig.my_client_id;
	ejdb.save(my_job_target, job, function(err, oid){
		if (err) {
			eventEmitter.emit('ejdb_error', vars.job_step);
			return
		} else {
			setTimeout(client_jobs_do_single, global.job_settings.web_access_interval);
			return
		}
	});
}


function client_jobs_init(){
	eventEmitter.emit('job_step_done', 'jobs_init');
}

function main(){
	client_jobs_init();
}

main();

