// configuration for all client, it should keep seperate from remote repository

module.exports.job_server_address = 'http://127.0.0.1:8080/web_jobs';
module.exports.job_server_port = '8080';
module.exports.my_client_id = 'jian-mac';
module.exports.my_http_proxy = '';

// proxy configuration
module.exports.proxy_settings = {
	'proxy_using': false,
	'proxy_hostname': '128.243.46.53',
	'proxy_port': '3128'
}