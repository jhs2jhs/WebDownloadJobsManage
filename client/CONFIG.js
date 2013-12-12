// configuration for all client, it should keep seperate from remote repository

//module.exports.job_server_address = 'http://127.0.0.1:8080/web_jobs';
var os = require('os');
module.exports.my_client_id = os.hostname();
module.exports.my_http_proxy = '';

// proxy configuration
module.exports.proxy_settings = {
	'proxy_using': false,
	'proxy_hostname': '128.243.46.53',
	'proxy_port': '3128'
};

// mail configuration
module.exports.mail_opts = {
	'smtp_server_user': 'dustin.shaojianhua@gmail.com',
	'smtp_server_pass': 'NottJian1986', // this needs to be reset for each use case; 
	'from_email': 'Jianhua Shao <dustin.shaojianhua@gmail.com>', // to email adress should be add in use case
	'to_email': 'Jianhua Shao <dustin.shaojianhua@gmail.com>' //"bar@blurdybloop.com, baz@blurdybloop.com", // list of receivers
};

