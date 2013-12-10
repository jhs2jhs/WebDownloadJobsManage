var os = require('os');
var events = require('events');

function MyJobs(){
	this.jobs_target = '';
	this.jobs_settings = {};
	this.client_id = os.hostname();

	this.myenv = {};
	this.db_server;
	this.db_client;

	this.job_status_current = ''
	this.job_status_all = {
		"jobs_get": "jobs_get",
		"jobs_do": "jobs_do",
		"job_put": "jobs_put"
	};

	this.job_status_figure = {
		'unread': 1,
		'assigned': 2,
		'done': 3,
		'error_when_reading': 4
	};

	this.eventEmitter = new events.EventEmitter();
	this.wrong_http_status_i = 0;
	this.wrong_http_status_t = 10;
	this.wrong_http_wait_time = 10*1000;
}

module.exports.MyJobs = MyJobs;