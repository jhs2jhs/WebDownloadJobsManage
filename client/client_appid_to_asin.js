// configuration
//
var my_client_job_request_count = 10
var my_job_target = 'appid_to_asin'
var my_client_db_file_path = './client_db_file_path'

var myconfig = require('./CONFIG.js');
var myutil = require('./myutil.js')
var querystring = require('querystring');
var fs = require('fs')
var Db = require('tingodb')().Db;
var db = new Db(my_client_db_file_path, {});
var collection = db.collection(my_job_target);

//
function client_jobs_request(){
	url_query = querystring.stringify({
		'client_id':myconfig.my_client_id, 
		'client_job_request_count':my_client_job_request_count,
		'job_target': my_job_target
	});
	uri = myconfig.job_server_address+'jobs_get?'+url_query;
	var vars = {uri:uri};
	console.log(vars)
	myutil.request_ec2(vars, client_jobs_request_resp_callback, client_jobs_request_err_callback);
}

function client_jobs_request_resp_callback(http_statusCode, vars, resp, body){
	var jobs = JSON.parse(body);
	//jobs = [{},{}]
	if (jobs.length == 0){
		console.log()
	} else {
		/*
		console.dir(jobs[0])
		console.log(jobs[0]._id)
		console.log(typeof(jobs[0]._id))
		db.save(my_job_target, {'_id':new ObjectID('abcdefgh').toString(), 'app_id':jobs[0]._id}, function(err, oid){
			console.log(err)
			console.log(oid)
		})*/
		//console.log(jobs)
		//console.log(jobs.length);
		collection.insert(jobs, {w:1}, function(err, result){
			console.log(err);
			console.log(result);
			collection.findOne({}, function(err, item){
				console.log(item)
			});
		});
		
	}
}

function client_jobs_request_err_callback(http_statusCode, vars, resp, body){
	console.log(http_statusCode, vars, resp, body)
}

function main(){
	client_jobs_request();
}

main()