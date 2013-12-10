var request = require('request');
var http = require('http');
var colors = require('colors');
var urlparse = require('url');


///////////////////////////////////////////////////
function request_get_http(vars, resp_callback, err_callback){
	var req_options = null;
	/*
	if (myconfig.proxy_settings.proxy_using == true){
		req_options = {
			'hostname': myconfig.proxy_settings.proxy_hostname,
			'port':myconfig.proxy_settings.proxy_port,
			'path': vars.uri,
			'method': 'GET'
		}
	} else {*/
		url = urlparse.parse(vars.uri);
		req_options = {
			'hostname': url.hostname,
			'port':url.port,
			'path': url.path,
			'method': 'GET',
		}
	//}
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
	req.end();
}

module.exports.request_get_http = request_get_http;