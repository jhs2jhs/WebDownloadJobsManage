// the configuration are done in CONFIG.js

var myconfig = require('./CONFIG.js');
var request = require('request');
var http = require('http');
var mkdirp = require('mkdirp');
var colors = require('colors');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var urlparse = require('url');


///////////////////////////////////////////////////
module.exports.request_post_http = request_post_http;
module.exports.request_get_http = request_get_http;
module.exports.folder_init = folder_init;
module.exports.jobs_c_n = 'jobs'; // collection name for jobs
module.exports.my_client_db_file_path = './client_db';
module.exports.job_status_figure = {
	'unread': 1,
	'assigned': 2,
	'done': 3,
	'error_when_reading': 4
};
module.exports.jobs_settings_keys = {
	'web_access_interval': 'web_access_interval',
};
module.exports.jobs_settings_actions = {
	'setting': 'setting',
	'get': 'get',
	'view': 'view'
};
module.exports.http = http;
///////////////////////////////////////////////////


// http proxy (https does not need proxy setting) in Nottingham university 
// https://github.com/jianhuashao/AndroidAppsCollector/blob/master/http.py
// http://www.velocityreviews.com/forums/t325113-httplib-and-proxy.html

function request_post_http(vars, resp_callback, err_callback){
	var req_options = null;
	if (myconfig.proxy_settings.proxy_using == true){
		req_options = {
			'hostname': myconfig.proxy_settings.proxy_hostname,
			'port':myconfig.proxy_settings.proxy_port,
			'path': vars.uri,
			'method': 'POST',
			headers: {
        		"Content-Type": "application/json",
        		"Content-Length": vars.post_body.length // Often this part is optional
    		}
		}
	} else {
		url = urlparse.parse(vars.uri);
		req_options = {
			'hostname': url.hostname,
			'port':url.port,
			'path': url.path,
			'method': 'POST',
			headers: {
        		"Content-Type": "application/json",
        		"Content-Length": vars.post_body.length // Often this part is optional
    		}
		}
	}
	var req = http.request(req_options, function(resp){
		var body = ''
		resp.setEncoding('utf8');
		resp.on('data', function (chunk) { // this event is called everytime when transform data
			body = body + chunk;
		});
		resp.on('end', function(){ // this even is called to finish the stream
			resp_callback(resp.statusCode, vars, resp, body);
		});
		resp.on('error', function(err){
			console.log('resp.on.error'.red, err);
		})
	});
	req.on('error', function(e){
		console.error('request_get_http: '.red.bold, e.message, e);
		err_callback(e, vars)
	});
	//console.log('e1');
	req.write(vars.post_body, 'utf8')
	//console.log('e2');
	req.end()
}



///////////////////////////////////////////////////
function request_get_http(vars, resp_callback, err_callback){
	var req_options = null;
	if (myconfig.proxy_settings.proxy_using == true){
		req_options = {
			'hostname': myconfig.proxy_settings.proxy_hostname,
			'port':myconfig.proxy_settings.proxy_port,
			'path': vars.uri,
			'method': 'GET'
		}
	} else {
		url = urlparse.parse(vars.uri);
		req_options = {
			'hostname': url.hostname,
			'port':url.port,
			'path': url.path,
			'method': 'GET',
		}
	}
	//console.log(req_options);
	var req = http.request(req_options, function(resp){
		var body = ''
		//resp.setEncoding('utf8');
		resp.on('data', function (chunk) { // this event is called everytime when transform data
			body = body + chunk;
		});
		resp.on('end', function(){ // this even is called to finish the stream
			resp_callback(resp.statusCode, vars, resp, body);
		});
	});
	req.on('error', function(e){
		console.error('request_get_http: '.red.bold, e.message, e);
		err_callback(e, vars)
	});
	req.end()
}

///////////////////////////////////////////////////
function folder_init(data_row_path, my_job_target){
	folder_path = '../../'+data_row_path+'/web_jobs/'+my_job_target;
	mkdirp(folder_path, function(err){
		console.error(err)
	})
}


function log(){

}
function error(str){
	console.log('')
}
