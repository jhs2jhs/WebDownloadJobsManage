///////// configuration start ///////////
var my_client_job_request_count = 5
var my_job_target = 'appid_to_asin'
///////// configuration end ///////////



var myconfig = require('./CONFIG.js');
var myutil = require('./myutil.js')
var querystring = require('querystring');
var EJDB = require('ejdb');
console.log(myutil.my_client_db_file_path);
var ejdb = EJDB.open(myutil.my_client_db_file_path, EJDB.DEFAULT_OPEN_MODE);
var http = require('http');
var fs = require('fs');
myutil.folder_init(my_job_target);


//////// jobs_get
function client_jobs_get(){
	url_query = querystring.stringify({
		'client_id':myconfig.my_client_id, 
		'client_job_request_count':my_client_job_request_count,
		'job_target': my_job_target
	});
	uri = myconfig.job_server_address+'/jobs_get?'+url_query;
	var vars = {uri:uri};
	console.log('** client_jobs_get', vars.uri)
	myutil.request_get_ec2(vars, client_jobs_get_resp_callback, client_jobs_get_err_callback);
}

function client_jobs_get_resp_callback(http_statusCode, vars, resp, body){
	var jobs = JSON.parse(body);
	if (jobs.length == 0){
		console.error('client_jobs_get_resp_callback', 'jobs.length == 0')
		client_jobs_control('jobs_get_none');
	} else {
		ejdb.save(my_job_target, jobs, function(err, oid){
			if (err) {
				console.error('client_jobs_get_resp_callback', err);
				client_jobs_control('jobs_get_error');
				return
			}
			client_jobs_control('jobs_get_done');
		});
	}
}

function client_jobs_get_err_callback(http_statusCode, vars, resp, body){
	console.error('client_jobs_get_err_callback', http_statusCode);
	client_jobs_control('jobs_get_error');
}

////////// jobs_put
function client_jobs_put(){
	ejdb.find(my_job_target, {}, function(err, cursor, count) {
		if (err) {
			console.error('client_jobs_put', 'ejdb', err);
			client_jobs_control('jobs_put_error');
			return;
		}
		if (count == 0) {
			// next job
			console.error("count == 0");
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
		console.error('client_jobs_put_resp_callback', 'jobs.length == 0')
		client_jobs_control('jobs_put_error');
	} else {
		client_jobs_bulk_remove(jobs, 0);
	}
}

function client_jobs_bulk_remove(jobs, i){
	if ( i < jobs.length ) {
		ejdb.remove(my_job_target, jobs[i]._id, function(err){
			if (err) {
				console.error('client_jobs_bulk_remove', 'ejdb.remove');
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
	console.error('client_jobs_put_err_callback', http_statusCode);
	client_jobs_control('jobs_put_error');
}



////////// jobs_do ///////////////
function client_jobs_do () {
	ejdb.findOne(my_job_target, {'job_status': {$lte: myutil.job_status_figure.unread}}, function(err, obj) {
		if (err) {
			console.error("client_jobs_do", 'ejdb error');
			client_jobs_control('jobs_do_error');
			return;
		}
		if (obj == null) {
			// next job, no object founded
			console.error('client_jobs_do', "count == 0");
			client_jobs_control('jobs_do_none');
		} else {
			client_jobs_do_download(obj);
		}
	});
}

function client_jobs_do_download(job){
	var vars = {uri:job.job_url, job_file_path:job.job_file_path, job:job};
	console.log('** client_jobs_do_download', vars.uri, vars.job_file_path);
	myutil.request_get_http(vars, client_jobs_do_resp_callback, client_jobs_do_err_callback);
}

function client_jobs_do_resp_callback(http_statusCode, vars, resp, body){
	fs.writeFile(vars.job_file_path, body, function(err){
		if (err) {
			console.error("client_jobs_do_resp_callback");
			client_jobs_control('jobs_do_error');
		} else {
			client_job_do_update(vars.job, http_statusCode, myutil.job_status_figure.error_when_reading)
		}
	});
}

function client_jobs_do_err_callback(error, vars){
	if (error == 'Parse Error') {
		// this error can be ignored
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
			console.error('client_job_do_update');
			client_jobs_control('jobs_do_error');
			return
		} else {
			setTimeout(client_jobs_do, 5000);
		}
		/*
		ejdb.find(my_job_target, {_id: job._id}, function(err, cursor, count){
			console.log(err, cursor, count);
			while (cursor.next()){
				console.log(cursor.object())
			}
		})
		// next stage
		*/
	});
}


function client_jobs_control(status){
	switch (status) {
		case 'jobs_init': 
			client_jobs_get();
			break
		case 'jobs_get_none':
		case 'jobs_get_error':
		case 'jobs_get_done':
			console.log('================ jobs_do ===========================');
			client_jobs_do();
			break
		case 'jobs_do_none':
		case 'jobs_do_error':
		case 'jobs_do_done':
			console.log('================ jobs_put ===========================');
			client_jobs_put();
			break
		case 'jobs_put_none':
		case 'jobs_put_error':
		case 'jobs_put_done':
			console.log('================ jobs_get ===========================');
			client_jobs_get();
			break
		default:
			jobs_get();
			break
	}
}

function client_jobs_init(){
	client_jobs_control('jobs_init');
}

function main(){
	client_jobs_init();
}

//main()
//fold_init()
