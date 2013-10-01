///////// configuration start ///////////
var my_client_job_request_count = 5
var my_job_target = 'appid_to_asin'
///////// configuration end ///////////



var myconfig = require('./CONFIG.js');
var myutil = require('./myutil.js')
var querystring = require('querystring');
var EJDB = require('ejdb')
console.log(myutil.my_client_db_file_path);
var ejdb = EJDB.open(myutil.my_client_db_file_path, EJDB.DEFAULT_OPEN_MODE)

//////// jobs_get
function client_jobs_get(){
	url_query = querystring.stringify({
		'client_id':myconfig.my_client_id, 
		'client_job_request_count':my_client_job_request_count,
		'job_target': my_job_target
	});
	uri = myconfig.job_server_address+'/jobs_get?'+url_query;
	var vars = {uri:uri};
	console.log(vars)
	myutil.request_get_ec2(vars, client_jobs_get_resp_callback, client_jobs_get_err_callback);
}

function client_jobs_get_resp_callback(http_statusCode, vars, resp, body){
	var jobs = JSON.parse(body);
	if (jobs.length == 0){
		console.log()
	} else {
		console.log(jobs.length);
		ejdb.save(my_job_target, jobs, function(err, oid){
			console.log(err, oid)
			if (err) {
				console.error(err);
				return
			}
			// next stage
		});
	}
}

function client_jobs_get_err_callback(http_statusCode, vars, resp, body){
	console.log(http_statusCode, vars, resp, body)
}

////////// jobs_put
function client_jobs_put(){
	ejdb.find(my_job_target, {}, function(err, cursor, count) {
		if (err) {
			console.error(err);
			return;
		}
		if (count == 0) {
			// next job
			console.error("count == 0");
			return;
		}
		jobs = []
		console.log("Found "+ count);
		while (cursor.next()) {
			//console.log(cursor.object())
			jobs.push(cursor.object())
		}
		cursor.close();
		//console.log(jobs);
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
	//console.log(vars)
	myutil.request_post_ec2(vars, client_jobs_put_resp_callback, client_jobs_put_err_callback);
}

function client_jobs_put_resp_callback(http_statusCode, vars, resp, body){
	console.log(http_statusCode, typeof(body))
	//var jobs = JSON.parse(body);
	jobs = body
	if (jobs.length == 0){
		console.log()
	} else {
		console.log(jobs.length);
		client_jobs_bulk_remove(jobs, 0)
	}
}

function client_jobs_bulk_remove(jobs, i){
	//console.log(jobs)
	if ( i < jobs.length ) {
		ejdb.remove(my_job_target, jobs[i]._id, function(err){
			console.log(err)
			if (err) {
				console.error(err);
			} else {
				i = i + 1
				client_jobs_bulk_remove(jobs, i);
			}
		});
	} else {
		console.log('done');
		console.log('***** ', jobs);
	}
}

function client_jobs_put_err_callback(http_statusCode, vars, resp, body){
	//console.log(http_statusCode, vars, resp, body)
	console.log(http_statusCode)
}



////////// jobs_do ///////////////
function client_jobs_do () {
	ejdb.findOne(my_job_target, {'job_status': {$lte: myutil.job_status_figure.unread}}, function(err, obj) {
		//console.log(err, obj);
		if (err) {
			console.error(err);
			return;
		}
		if (obj == null) {
			// next job, no object founded
			console.error("count == 0");
			return;
		} else {
			job = obj
			client_jobs_do_download(job)
		}
	});
}

function client_jobs_do_download(job){
	var vars = {uri: job.job_url, job_file_path: job.job_file_path, job: job};
	console.log(vars.uri);
	myutil.request_get_amazon_app_store(vars, client_jobs_do_resp_callback, client_jobs_do_err_callback);
}

function client_jobs_do_resp_callback(http_statusCode, vars, resp, body){
	console.log(http_statusCode, typeof(body))
	//var jobs = JSON.parse(body);
}

function client_jobs_do_err_callback(http_statusCode, vars, resp, body){
	console.log(http_statusCode, resp, body)
	//console.log(http_statusCode, resp)
}



function main(){
	//client_jobs_get();
	client_jobs_do();
	//client_jobs_put();
}

main()
