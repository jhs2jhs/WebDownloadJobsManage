var colors = require('colors');
var sprintf = require('util').format;
var os = require("os");
var fs = require("fs");
var querystring = require("querystring");
var mylib_http = require("./lib_http.js");
var mylib_client = require("./lib_client.js");
var mylib_jobs = require('./lib_jobs.js');
var mylib_util = require('./lib_util.js');

var myjobs = new mylib_jobs.MyJobs();
mylib_client.myjobs_init(myjobs, 'topsy_fortuner_tops_full', function(){main()});

myjobs.eventEmitter.on('err_mongodb', function(which_db, function_name, err){
	mylib_util.event_print('err_mongodb', which_db, function_name, err);
});
myjobs.eventEmitter.on('fs_error', function(which_db, function_name, err){
	mylib_util.event_print('fs_error', which_db, function_name, err);
});
myjobs.eventEmitter.on('jobs_step_done', function(function_name){
	mylib_util.event_print('jobs_step_done', function_name);
	switch(function_name){
		case 'jobs_settings_from_server':
			mylib_client.jobs_get_from_server(myjobs, function(){
				myjobs.eventEmitter.emit('jobs_step_done', 'jobs_get_from_server');
			});
			break;
		case 'web_access_interval_validate':
		case 'jobs_do_resp_callbck':
		case 'file_write':
		case 'jobs_do_err_callback':
		case 'jobs_get_from_server':
			mylib_client.jobs_do_in_client(myjobs, function(job){
				setTimeout(function(){
					jobs_do_download(job);
				}, myjobs.jobs_settings[myjobs.jobs_target].web_access_interval);
			});
			break;
	}
});
myjobs.eventEmitter.on('jobs_finish', function(which_db, function_name){
	mylib_util.event_print("jobs_finish", which_db, function_name);
	switch(function_name){
		case 'jobs_get_from_server':
			mylib_client.close_dbs(myjobs, function(){
				mylib_client.close_mongoclient(myjobs, function(){
					console.log('.....................finish...................');
				})
			})
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
	console.log(job.job_url);
	//job.job_url = 'http://otter.topsy.com/search.json?apikey=09C43A9B270A470B8EB8F2946A9369F3&q=from%3ACBOE&perpage=100&type=tweet&page=1&maxtime=1386866603&sort_method=date&window=a';
	var vars = {uri:job.job_url, job_file_path:job.job_file_path, job:job, job_step:"jobs_do"};
	mylib_http.request_get_http(vars, jobs_do_resp_callbck, jobs_do_err_callback);
}
function jobs_do_resp_callbck(http_statusCode, vars, resp, body){
	mylib_util.step_print("#### jobs_do_resp_callback() ####", http_statusCode);
	if (http_statusCode == 200) {
		myjobs.wrong_http_status_i = 0;
		// we will check whether return list is large than 200 or not to determine whether should stop. 
		tw = JSON.parse(body);
		tw_ls = tw.response.list;
		tw_total_left = parseInt(tw.response.total);
		console.log('response.list: ', tw_ls.length, tw_total_left)
		if (tw_total_left > 2){
			tw_ls.sort(function(a, b){
				var a1st = -1;
				var b1st = 1;
				var equal = 0;
				if (a.firstpost_date == b.firstpost_date){
					return equal;
				}
				if (a.firstpost_date > b.firstpost_date){
					return b1st;
				}
				if (a.firstpost_date < b.firstpost_date) {
					return a1st;
				}
			})
			ts = vars.job.job_id.split('=');
			company_name = ts[2];
			tw_username = ts[3];
			rank = ts[1];
			p_i = ts[0];
			p_i = parseInt(p_i);
			t = tw_ls[0].firstpost_date;
			var date = new Date(t*1000);
			var date_s = date.getDate()+'-'+date.getMonth()+'-'+date.getFullYear()
			var qs = querystring.stringify({
				'q':'from:'+tw_username,
				'type':'tweet',
				'perpage':100,
				'page':1,
				'maxtime':t,
				'sort_method':'date',
				'apikey':'09C43A9B270A470B8EB8F2946A9369F3'
			});
			var job_url = 'http://otter.topsy.com/search.json?'+qs;
			var job_id = (p_i+1)+'='+rank+'='+company_name+'='+tw_username+'='+date_s+'='+t;
			var job_file_path = '/web_jobs/'+myjobs.jobs_target+"/"+job_id+'.html';
			var job = mylib_client.make_job(myjobs, job_id, job_url, job_file_path);
			console.log(job);
			mylib_client.jobs_add_in_server(myjobs, job, function(){
				mylib_client.file_write(myjobs, vars.job, vars.job_file_path, body);
			});
		} else {
			mylib_client.file_write(myjobs, vars.job, vars.job_file_path, body);
			return
		}
	} else { // needs to increase settings automatically 
		mylib_client.jobs_do_update(myjobs, vars.job, http_statusCode, function(){
			mylib_client.web_access_interval_validate(myjobs);
		});
		return
	}
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
			myjobs.eventEmitter.emit('jobs_step_done', 'jobs_do_err_callback');
		});
	}
}





