var mongodb = require('mongodb');
var color = require('colors');
var fs = require("fs");
var os = require('os');
var mylib_util = require('./lib_util.js');
var mylib_jobs = require('./lib_jobs.js');


function get_env(){
	mylib_util.step_print('#### get_env ####');
	var env = require('../env.json');
	var node_env = process.env.NODE_ENV || 'development';
	return env[node_env];
}

function get_dbs(myjobs, cp){
	mylib_util.step_print("#### get_dbs() #####");
	var mongodb_server_server = new mongodb.Server(myjobs.myenv['mongodb_server_address'], myjobs.myenv['mongodb_server_port'], {auto_reconnect:true});
	var mongodb_server_client = new mongodb.Server(myjobs.myenv['mongodb_client_address'], myjobs.myenv['mongodb_client_port'], {auto_reconnect:true});
	var mongodb_server = new mongodb.MongoClient(mongodb_server_server);
	var mongodb_client = new mongodb.MongoClient(mongodb_server_client);
	mongodb_server.open(function (err, mongodbclient){
		if (err){
			myjobs.eventEmitter.emit('err_mongodb', 'mongodb_server', 'get_dbs', err);
			return
		}
		mongodb_server = mongodbclient;
		db_server = mongodb_server.db(myjobs.myenv['mongodb_server_db_name']);
		db_server.stats(function(err, stats){
			console.log("db_server.stats()");
			//console.log(err, stats);
			mongodb_client.open(function (err, mongodbclient){
				if (err){
					myjobs.eventEmitter.emit('err_mongodb', 'mongodb_client', 'get_dbs', err);
					return
				}
				mongodb_client = mongodbclient;
				db_client = mongodb_server.db(myjobs.myenv['mongodb_client_db_name']);
				db_client.stats(function(err, stats){
					if (err){
						myjobs.eventEmitter.emit('err_mongodb', 'mongodb_client', 'get_dbs', err);
					}
					console.log("db_client.stats()");
					//console.log(err, stats);
					cp(db_server, db_client);
				});
			});
		});
	});
}

function myjobs_init(myjobs, jobs_target, cp){
	myjobs.jobs_target = jobs_target;
	myjobs.client_id = os.hostname();
	myjobs.myenv = get_env();

	mylib_util.folder_init(myjobs.myenv['data_row_path'], myjobs.jobs_target);

	get_dbs(myjobs, function(db_s, db_c){
		myjobs.db_server = db_s;
		myjobs.db_client = db_c;
		cp();
	});
	console.log(myjobs);
}

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
function set_jobs_settings(myjobs, docs){
	mylib_util.step_print("#### set_jobs_settings() ####");
	//var jobs_settings = {};
	console.log("before settings", myjobs.jobs_settings);
	for (var i = 0; i< docs.length; i++) {
		var job_target = docs[i]['job_target'];
		var settings_key = docs[i]['settings_key'];
		var settings_value = docs[i]['settings_value'];
		if (myjobs.jobs_settings[job_target] == undefined) {
			myjobs.jobs_settings[job_target] = {};
		}
		myjobs.jobs_settings[job_target][settings_key] = settings_value;
	}
	console.log("after settings", myjobs.jobs_settings);
}
function jobs_settings_from_server(myjobs, cp){
	mylib_util.step_print("#### jobs_settings_from_server() ####");
	myjobs.db_server.collection(myjobs.myenv['mongodb_db_name_jobs_settings']).find().toArray(function(err, docs){
		if (err){
			myjobs.eventEmitter.emit('err_mongodb', 'mongodb_server', 'jobs_settings_from_server', err);
			return
		}
		set_jobs_settings(myjobs, docs);
		cp();
	});
}
function web_access_interval_get(myjobs, cp){
	mylib_util.step_print("#### web_access_interval_get() ####");
	myjobs.db_server.collection(myjobs.myenv['mongodb_db_name_jobs_settings']).find({'job_target':myjobs.jobs_target, 'settings_key':'web_access_interval'}).limit(1).toArray(function(err, docs){
		if (err){
			myjobs.eventEmitter.emit('err_mongodb', 'mongodb_server', 'web_access_interval_get', err);
			return
		}
		cp(parseInt(docs[0].settings_value));
	});
}
function web_access_interval_update(myjobs, cp){
	mylib_util.step_print("#### web_access_interval_update() ####");
	console.log(myjobs.jobs_settings[myjobs.jobs_target].web_access_interval);
	myjobs.db_server.collection(myjobs.myenv['mongodb_db_name_jobs_settings']).update(
		{'job_target':myjobs.jobs_target, 'settings_key':'web_access_interval'},
		{$set:{'settings_value':myjobs.jobs_settings[myjobs.jobs_target].web_access_interval+'', 'update_date': new Date()}},
		{w:1, multi:false},
		function(err, result){
			if (err) {
				myjobs.eventEmitter.emit('err_mongodb', 'mongodb_server', 'web_access_interval_update', err);
				return
			}
			cp();
		}
	);
}
function web_access_interval_validate(myjobs){
	mylib_util.step_print("#### web_access_interval_validate() ####");
	myjobs.wrong_http_status_i += 1;
	console.log(myjobs.wrong_http_status_i);
	if (myjobs.wrong_http_status_i > myjobs.wrong_http_status_t) {
		web_access_interval_get(myjobs, function(web_access_interval){
			console.log(myjobs.jobs_settings[myjobs.jobs_target]);
			console.log(myjobs.jobs_settings[myjobs.jobs_target].web_access_interval, web_access_interval, myjobs.wrong_http_wait_time);
			setTimeout(
				function(){
					if (myjobs.wrong_http_status_i > myjobs.wrong_http_status_t + 3){
						myjobs.wrong_http_wait_time += 5*1000;
					}
					console.log('hello', myjobs.jobs_settings[myjobs.jobs_target].web_access_interval, web_access_interval);
					if (myjobs.jobs_settings[myjobs.jobs_target].web_access_interval < web_access_interval){
						myjobs.jobs_settings[myjobs.jobs_target].web_access_interval = web_access_interval;
						myjobs.eventEmitter.emit('jobs_step_done', 'web_access_interval_validate');
					} else {
						console.log('world', myjobs.jobs_settings[myjobs.jobs_target].web_access_interval, web_access_interval);
						console.log(typeof myjobs.jobs_settings[myjobs.jobs_target].web_access_interval);
						myjobs.jobs_settings[myjobs.jobs_target].web_access_interval = myjobs.jobs_settings[myjobs.jobs_target].web_access_interval + 100;
						console.log('cool', myjobs.jobs_settings[myjobs.jobs_target].web_access_interval, web_access_interval);
						web_access_interval_update(myjobs, function(){
							myjobs.eventEmitter.emit('jobs_step_done', 'web_access_interval_validate');
						});
					}
					console.log(myjobs.jobs_settings[myjobs.jobs_target].web_access_interval, web_access_interval, myjobs.wrong_http_wait_time);
				}, 
				myjobs.wrong_http_wait_time
			);
		});
	} else {
		myjobs.eventEmitter.emit('jobs_step_done', 'web_access_interval_validate');
	}
}

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
function jobs_get_into_client(myjobs, job, cp){
	mylib_util.step_print("#### jobs_get_into_client() ####");
	myjobs.db_client.collection(myjobs.jobs_target).save(job, {w:1}, function(err, result){
		if (err){
			myjobs.eventEmitter.emit('err_mongodb', "mongodb_client", "jobs_get_into_client", err);
			return;
		}
		cp();
	});
}
function jobs_get_from_server(myjobs, cp){
	mylib_util.step_print("#### jobs_get_from_server() ####");
	myjobs.db_server.collection(myjobs.jobs_target).find({'job_status':myjobs.job_status_figure.unread}).limit(1).toArray(function(err, docs){
		if (err){
			myjobs.eventEmitter.emit('err_mongodb', 'mongodb_server', "jobs_get_from_server", err);
			return;
		}
		console.log(docs);
		if (docs.length <= 0) {
			myjobs.eventEmitter.emit("jobs_finish", 'mongodb_server', "jobs_get_from_server");
			return;
		}
		var job = docs[0];
		job.job_status = myjobs.job_status_figure.assigned;
		job.client_id = myjobs.client_id;
		job.update_date = new Date();
		myjobs.db_server.collection(myjobs.jobs_target).save(job, {w:1}, function(err, result){
			if (err) {
				myjobs.eventEmitter.emit("err_mongodb", "mongodb_server", "jobs_get_from_server", err);
				return;
			}
			jobs_get_into_client(myjobs, job, cp);
		});
	});
}


/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
function jobs_do_in_client(myjobs, cp){
	mylib_util.step_print('#### jobs_do_in_client() ####'.red);
	myjobs.db_client.collection(myjobs.jobs_target).find({'job_status':myjobs.job_status_figure.assigned}).limit(1).toArray(function(err, docs){
		if (err) {
			myjobs.eventEmitter.emit("err_mongodb", "mongodb_client", "jobs_do_in_client");
			return;
		}
		if (docs.length <= 0) {
			myjobs.eventEmitter.emit("jobs_finish", 'mongodb_client', "jobs_do_in_client");
			return;
		}
		var job = docs[0];
		console.log(job._id, job.job_id);
		cp(job);
	});
}
function jobs_do_update_in_client(myjobs, job, job_status, cp){
	mylib_util.step_print("#### jobs_do_update_in_client() ####".red, job._id, job.job_id);
	myjobs.db_client.collection(myjobs.jobs_target).update(
		{'_id':job._id},
		{$set: {"job_status": job_status, "client_id": myjobs.client_id, "update_date": new Date()}},
		{w:1, multi:false}, 
		function(err, result){
			if (err) {
				myjobs.eventEmitter.emit("err_mongodb", "mongodb_client", "jobs_do_update_in_client");
				return;
			}
			console.log(err, result);
			cp();
		}
	);
}
function jobs_do_update_in_server(myjobs, job, job_status, cp){
	mylib_util.step_print("#### jobs_do_update_in_server() ####".red, job._id, job.job_id);
	var _id = job._id;
	myjobs.db_server.collection(myjobs.jobs_target).update(
		{'_id':job._id},
		{$set: {"job_status": job_status, "client_id": myjobs.client_id, "update_date": new Date()}},
		{w:1, multi:false}, 
		function(err, result){
			if (err) {
				myjobs.eventEmitter.emit("err_mongodb", "mongodb_server", "jobs_do_update_in_server");
				return;
			}
			console.log(err, result);
			cp();
		}
	);
}
function jobs_do_remove_in_client(myjobs, job, cp){
	mylib_util.step_print("#### jobs_do_remove_in_client() ####".red, job._id, job.job_id);
	myjobs.db_client.collection(myjobs.jobs_target).remove(
		{"_id":job._id},
		{w:1},
		function(err, numberOfRemovedDocs){
			if (err) {
				myjobs.eventEmitter.emit("err_mongodb", "mongodb_client", "jobs_do_remove_in_client");
			}
			console.log(numberOfRemovedDocs);
			cp();
		}
	);
}
function jobs_do_update(myjobs, job, job_status, cp){
	mylib_util.step_print("#### jobs_do_update() #####".red);
	jobs_do_update_in_client(myjobs, job, job_status, function(){
		jobs_do_update_in_server(myjobs, job, job_status, function(){
			jobs_do_remove_in_client(myjobs, job, function(){
				cp();
			});
		});
	});
}
function file_write(myjobs, job, job_file_path, body){
	fs.writeFile(job_file_path, body, function(err){
		if (err) {
			myjobs.eventEmitter.emit("fs_error", "writeFile", "file_write");
			return
		} else {
			jobs_do_update(myjobs, job, myjobs.job_status_figure.done, function(){
				myjobs.eventEmitter.emit('jobs_step_done', 'file_write');
			});
		}
	})
}




/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
function make_job(myjobs, job_id, job_url, job_file_path){
	var job = {}
	job.job_id = job_id;
	job.job_url = job_url;
	job.job_file_path = job_file_path;
	job.client_id = myjobs.client_id;
	job.job_status = mylib_jobs.job_status_figure.unread;
	job.http_status = -1;
	job.create_date = new Date();
	job.update_date = new Date();
	return job;
}
function jobs_add_in_server(myjobs, job, cp){
	mylib_util.step_print("#### jobs_get_into_client() ####");
	myjobs.db_server.collection(myjobs.jobs_target).save(job, {w:1}, function(err, result){
		if (err){
			myjobs.eventEmitter.emit('err_mongodb', "mongodb_server", "jobs_add_in_server", err);
			return;
		}
		cp();
	});

}


module.exports.get_env = get_env;
module.exports.get_dbs = get_dbs;
module.exports.myjobs_init = myjobs_init;
module.exports.jobs_settings_from_server = jobs_settings_from_server;
module.exports.jobs_get_from_server = jobs_get_from_server;
module.exports.jobs_do_in_client = jobs_do_in_client;
module.exports.jobs_do_update_in_client = jobs_do_update_in_client;
module.exports.jobs_do_update_in_server = jobs_do_update_in_server;
module.exports.jobs_do_remove_in_client = jobs_do_remove_in_client;
module.exports.jobs_do_update = jobs_do_update;
module.exports.file_write = file_write;
module.exports.web_access_interval_get = web_access_interval_get;
module.exports.web_access_interval_update = web_access_interval_update;
module.exports.web_access_interval_validate = web_access_interval_validate;
module.exports.jobs_add_in_server = jobs_add_in_server;
module.exports.make_job = make_job;


