var colors = require('colors');
var sprintf = require('util').format;
var os = require("os");
var fs = require("fs");
var mylib_http = require("./lib_http.js");
var mylib_client = require("./lib_client.js");
var mylib_jobs = require('./lib_jobs.js');
var mylib_util = require('./lib_util.js');

var myjobs = new mylib_jobs.MyJobs();
myjobs.jobs_target = 'thingiverse';
myjobs.client_id = os.hostname();
myjobs.myenv = mylib_client.get_env();


mylib_client.get_dbs(myjobs, function(db_s, db_c){
	myjobs.db_server = db_s;
	myjobs.db_client = db_c;
	main();
});

myjobs.eventEmitter.on('err_mongodb', function(which_db, function_name, err){
	mylib_util.event_print('err_mongodb', which_db, function_name, err);
});
myjobs.eventEmitter.on('jobs_step_done', function(function_name){
	mylib_util.event_print('jobs_step_done', function_name);
	switch(function_name){
		case 'jobs_settings_from_server':
			mylib_client.jobs_get_from_server(myjobs, function(){
				myjobs.eventEmitter.emit('jobs_step_done', 'jobs_get_from_server');
			});
			break;
		case 'jobs_get_from_server':
			mylib_client.jobs_do_in_client(myjobs, function(job){
				jobs_do_download(job);
			});
			break;
		case 'jobs_do':
			setTimeout(function(){
				myjobs.eventEmitter.emit('jobs_step_done', 'jobs_get_from_server');
			}, myjobs.jobs_settings.web_access_interval);
			break;
	}
});
myjobs.eventEmitter.on('jobs_finish', function(which_db, function_name){
	mylib_util.event_print("jobs_finish", which_db, function_name);
	switch(function_name){
		case 'jobs_get_from_server':
			
			break;
		case 'jobs_do_in_client':
			myjobs.eventEmitter.emit('jobs_step_done', 'jobs_settings_from_server');
			break;
	}
});

//
function main(){
	mylib_util.step_print("#### main() ####");
	mylib_client.jobs_settings_from_server(myjobs, function(){
		myjobs.eventEmitter.emit('jobs_step_done', 'jobs_settings_from_server');
	});
}



function jobs_do_download(job){
	mylib_util.step_print("#### jobs_do_download() ####");
	var job_file_path = '../../'+myjobs.myenv['data_row_path']+"/web_jobs/"+myjobs.jobs_target+"/"+job.job_id+".html";
	job.job_file_path = job_file_path;
	var vars = {uri:job.job_url, job_file_path:job.job_file_path, job:job, job_step:"jobs_do"};
	mylib_http.request_get_http(vars, jobs_do_resp_callbck, jobs_do_err_callback);
}
function jobs_do_resp_callbck(http_statusCode, vars, resp, body){
	mylib_util.step_print("#### jobs_do_resp_callback() ####");
	fs.writeFile(vars.job_file_path, body, function(err){
		if (err) {
			myjobs.eventEmitter.emit("fs_error", "writeFile", "jobs_do");
			return
		} else {
			mylib_client.jobs_do_update(myjobs, vars.job, myjobs.job_status_figure.done, function(){
				myjobs.eventEmitter.emit('jobs_step_done', 'jobs_do');
			});
		}
	})
}
function jobs_do_err_callback(error, vars){
	mylib_util.step_print("#### jobs_do_err_callback() ####");
	console.log(error);
	if (error.message == 'Parse Error') {
		console.log("this error can be ignored ====== 1");
	} else if (error.message == 'connect ECONNREFUSED') {
		console.log('this error can be ignored ======2');
	} else {
		mylib_client.jobs_do_update(myjobs, vars.job, myjobs.job_status_figure.error_when_reading, function(){
			myjobs.eventEmitter.emit('jobs_step_done', 'jobs_do');
		});
	}
}





