// configuration for all client, it should keep seperate from remote repository

//module.exports.job_server_address = 'http://127.0.0.1:8080/web_jobs';
module.exports.job_server_address = 'http://ec2-54-220-209-62.eu-west-1.compute.amazonaws.com:8080/web_jobs';
module.exports.job_server_port = '8080';
module.exports.my_client_id = 'jian-mac';
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
	'smtp_server_pass': 'NEED TO SET',
	'from_email': 'Jianhua Shao <dustin.shaojianhua@gmail.com>',
	'to_email': 'Jianhua Shao <dustin.shaojianhua@gmail.com>' //"bar@blurdybloop.com, baz@blurdybloop.com", // list of receivers
};

