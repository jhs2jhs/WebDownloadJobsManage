var assert = require("assert");
var should = require('should');

var util_client = require('../client/myutil.js');

var node_env = process.env.NODE_ENV || 'development';
var env = require("../env.json");
var myenv = env[node_env];
var server_base = require('../server/server_base.js');

// mongodb
//var MongoClient = require('mongodb').MongoClient;
//var mongodb_url = 'mongodb://127.0.0.1:27017/'+myenv['mongodb_server_name']
//var ObjectID = require('mongodb').ObjectID;

//

describe('SERVER initialise ...', function(){

	it("process.env.NODE_ENV should equal to development or null", function(){
		node_env.should.eql('development');
	});
	
	it('test server connect: 200', function(done){
		var url = 'http://localhost:8080/web_jobs/test_connect';
		var vars = {uri:url};
		util_client.request_get_http(vars, resp_callback, err_callback);
		function resp_callback(http_statusCode, vars, resp, body){
			http_statusCode.should.eql(200);
			body.should.include('connect succeed');
			done();
		}
		function err_callback(http_statusCode, vars, resp, body){
			console.log('err_callback', http_statusCode, vars, body);
			done();
		}
	});
});


//
describe('SERVER MONGODB jobs add', function(){

	var jobs = []
	job_target = 'thingiverse';
	client_id = 'mocha_test';
	for (i=0; i<10; i++) {
		job_id = 't_'+i;
		job_url = 'http://www.thingiverse.com/thing:'+i;
		job_file_path = '../../'+myenv['data_row_path']+'/web_jobs/'+job_target+'/'+job_id+'.html';
		create_date = new Date().toGMTString();
		update_date = new Date().toGMTString();
		job_status = 1
		http_status = -1
		job = server_base.make_job(job_id, job_url, job_file_path, client_id, create_date, update_date, job_status, http_status);
		jobs.push(job);
		it('job_id should be '+job_id, function(){
			job.should.include({'job_id':job_id});
		});
	}

	var post_body = {
		'client_id':client_id, 
		'job_target': job_target,
		'jobs': jobs
	};
	post_body = JSON.stringify(post_body);
	uri = 'http://localhost:8080/web_jobs'+'/jobs_put';
	var vars = {uri:uri, post_body: post_body};

	describe('hello', function(){


	it("add jobs to thingiverse", function(done){
		util_client.request_post_http(vars, resp_callback, err_callback);
		function resp_callback(http_statusCode, vars, resp, body){	
			http_statusCode.should.eql(200);
			JSON.parse(body).should.with.lengthOf(10);
			//body.should.include('connect succeed'); // needs to check if it is request entity too large
			done();
		}
		function err_callback(http_statusCode, vars, resp, body){
			console.log('err_callback', http_statusCode, vars, body);
			done();
		}
	});
});
	
});
