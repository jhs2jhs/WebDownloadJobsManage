// the configuration are done in CONFIG.js

var myconfig = require('./CONFIG.js');
var request = require('request');
var http = require('http');

// http proxy (https does not need proxy setting) in Nottingham university 
// https://github.com/jianhuashao/AndroidAppsCollector/blob/master/http.py

function request_get_ec2(vars, resp_callback, err_callback){
	var r_options = {
		uri: vars.uri,
		method: 'GET',
		timeout: 20000,
		maxRedirects: 10,
		followRedirect: false, // to avoid jump to home page
		proxy: myconfig.my_http_proxy,
		qs: {},
		headers: {'Accept': 'text/html'}
	}
	var request_function = function(error, resp, body){
		if (error){
			err_callback(-1, vars, resp, body)
		} else if (resp.statusCode == 200) { // working well
			resp_callback(resp.statusCode, vars, resp, body)
		} else if (resp.statusCode == 302) { // redirect 
			err_callback(resp.statusCode, vars, resp, body)
		} else {
			err_callback(resp.statusCode, vars, resp, body)
		}
	}
	request(r_options, request_function);
}

function request_post_ec2(vars, resp_callback, err_callback){
	var r_options = {
		uri: vars.uri,
		method: 'POST',
		json: vars.post_json,
		timeout: 20000,
		maxRedirects: 10,
		followRedirect: false, // to avoid jump to home page
		proxy: myconfig.my_http_proxy,
		qs: {},
		headers: {'Accept': 'text/html'}
	}
	var request_function = function(error, resp, body){
		if (error){
			err_callback(-1, vars, resp, body)
		} else if (resp.statusCode == 200) { // working well
			resp_callback(resp.statusCode, vars, resp, body)
		} else if (resp.statusCode == 302) { // redirect 
			err_callback(resp.statusCode, vars, resp, body)
		} else {
			err_callback(resp.statusCode, vars, resp, body)
		}
	}
	request(r_options, request_function);
}



///////////////////////////////////////////////////
function request_get_http(vars, resp_callback, err_callback){
	var req = http.request(vars.uri, function(resp){
		var body = ''
		resp.setEncoding('utf8');
		resp.on('data', function (chunk) { // this event is called everytime when transform data
			body = body + chunk;
		});
		resp.on('end', function(){ // this even is called to finish the stream
			resp_callback(resp.statusCode, vars, resp, body);
		});
	});
	req.on('error', function(e){
		console.error('request_get_http : ', e.message, e)
		err_callback(e.message, vars)
	});
	req.end()
}


module.exports.request_get_ec2 = request_get_ec2;
module.exports.request_post_ec2 = request_post_ec2;
module.exports.request_get_http = request_get_http;
module.exports.jobs_c_n = 'jobs'; // collection name for jobs
module.exports.my_client_db_file_path = './client_db';
module.exports.job_status_figure = {
	'unread': 1,
	'assigned': 2,
	'done': 3,
	'error_when_reading': 4
}