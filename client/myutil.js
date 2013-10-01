// the configuration are done in CONFIG.js

var myconfig = require('./CONFIG.js');
var request = require('request');
var http = require('http');



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
/*
function request_get_amazon_app_store(vars, resp_callback, err_callback){
	var r_options = {
		//host: 'www.amazon.co.uk',
		//port: 80,
		//path: '/gp/mas/dl/android?p=com.opendoorstudios.ds4droid',
		url: vars.uri,
		method: 'GET',
		timeout: 10000,
		maxRedirects: 10,
		followRedirect: true, // to avoid jump to home page
		proxy: myconfig.my_http_proxy,
		qs: {},
		headers: {
			'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.76 Safari/537.36',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
			'Accept-Encoding':'gzip,deflate,sdch',
			'Accept-Language':'en-US,en;q=0.8',
			'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7,',
			'Content-Length': '1',
			'Connection': 'keep-alive',
		},
		encoding: 'utf8',
		noUserAgent: true,
	}
	var request_function = function(error, resp, body){
		if (error){
			console.error(error);
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
}*/

function request_get_amazon_app_store(vars, resp_callback, err_callback){
	var options = {
		hostname:'www.amazon.com',
		port: 80,
		path: '/gp/mas/dl/android?p=com.opendoorstudios.ds4droid',
		method: 'GET'
	};
	var req = http.request(options, function(res){
		console.log('STATUS: ' + res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
		});
	});
	req.on('error', function(e){
		console.log('problem with request: ', e.message)
	});
	req.end()
}


module.exports.request_get_ec2 = request_get_ec2;
module.exports.request_post_ec2 = request_post_ec2;
module.exports.request_get_amazon_app_store = request_get_amazon_app_store;
module.exports.jobs_c_n = 'jobs'; // collection name for jobs
module.exports.my_client_db_file_path = './client_db';
module.exports.job_status_figure = {
	'unread': 1,
	'assigned': 2,
	'done': 3,
	'error_when_reading': 4
}