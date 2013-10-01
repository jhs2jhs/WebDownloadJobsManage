// the configuration are done in CONFIG.js

var myconfig = require('./CONFIG.js');
var request = require('request');



function request_ec2(vars, resp_callback, err_callback){
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

module.exports.request_ec2 = request_ec2;