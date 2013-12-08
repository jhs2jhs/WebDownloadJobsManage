
// env settings for development and production mode
var env = require("../env.json");
var node_env = process.env.NODE_ENV || 'development';
if ((['development', 'production'].indexOf(node_env)) == -1) {
	var msg = '!! process.env.NODE_ENV should from [undefined, development, production]';
	console.log(msg);
	process.exit(1);
}
var myenv = env[node_env];
console.log("## env: ", node_env); 
console.log(myenv);
console.log()

// mongodb
var MongoClient = require('mongodb').MongoClient;
var mongodb_url = 'mongodb://127.0.0.1:27017/'+myenv['mongodb_server_name']
var ObjectID = require('mongodb').ObjectID;

// express
var express = require('express');


// others
var sprintf = require('util').format;
var colors = require('colors');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var fs = require('fs');
var filesize = require('filesize');
var os = require('os');
var exec = require('child_process').exec;
console.log("## hello server, ", os.hostname(), "##");
console.log();

var collection_name_jobs_settings = 'jobs_settings';
var client_id_server = 'jobs_manager_server';

function log_dev(e){
	if (node_env == 'development') {
		console.log(e);
	}
}


// test connect
function test_connect(req, res){
	log_dev('test_connect'.red);
	res.send("WebDownloadJobManager connect succeed")
	//res.status(404).send('Not found');
}

function hello(req, res){
	log_dev('hello'.red);
	res.send('Hello World, Jobs Manager');
}

////////////////////////////////////////
function urls_list(req, res) {
	urls = {
		'Hello': 'WebDownloadJobManager server', 
		'list all useful urls':'/web_jobs/urls_list',
		'test connect': '/web_jobs/test_connect',
		'view jobs progressing and error logs': '/web_jobs/jobs_view',
		'reset all assigned but not finished jobs back to unsign': '/web_jobs/jobs_reset?client_id=server_test&job_target=XXX',
		'view settings for jobs':'/web_jobs/jobs_settings?action=view',
		'triggle a action to dump mongodb': '/web_jobs/dump_action',
		'files all dumped mongodb files': '/web_jobs/dump_files',
		'triggle a action to export data from mongodb': '/web_jobs/mongodb_export_action?jobs_target=XXXX',
		'view a list of files exported from mongodb': '/web_jobs/mongodb_export_files_view?jobs_target=XXXX',
		'triggle a action to import json data into mongodb from a server file': '/web_jobs/mongodb_import_action'
	}
	res.send(urls);
}

function db_opt(db_callback){
	MongoClient.connect(mongodb_url, function(err, db){
		if (err) {
			throw err;
			console.error(err.red.bold)
			//db_opt(db_callback)
		} else {
			db.on('error', function(err){
				console.log('== mongodb error event:', err);
			});
			db_callback(db);
		}
	});
}

function error_log_insert(job_target, client_id, job_step, function_name, err, err_argus, callback){
	error = {
		'job_target': job_target,
		'client_id': client_id,
		'job_step': job_step,
		'function_name': function_name, 
		'error_message': err.toString(),
		'error_argus': err_argus,
		'report_date': new Date()
	};
	db_opt(function(db){
		db.collection('error_log')
			.save(error, function(err){
				db.close();
				if (err) {
					throw err
				} else {
					callback();
				}
			});
	});
}

function error_log(req, res){
	console.log('error_log'.red.italic, req.query.job_target, req.body.client_id, (new Date().toGMTString()).red.italic);
	qs = req.query;
	client_id = qs.client_id;
	job_target = qs.job_target;
	job_step = qs.job_step;
	function_name = qs.function_name;
	error_message = qs.error_message;
	error_argus = qs.error_argus;
	if (client_id == undefined || job_target == undefined || job_step == undefined || function_name == undefined || error_message == undefined) {
		res.send(400, 'error log qs.query is not complete');
		return
	}
	error_log_insert(job_target, client_id, job_step, function_name, error_message, error_argus, function(){
		console.log('error_log_done');
		res.send(200, 'error_log_done');
	});
}

eventEmitter.on('mongodb_error', function(action, job_target, client_id, job_step, err){
	error_log_insert(job_target, client_id, job_step, action, err, '', function(){
		res.send(400, 'server error mongodb_error');
	})
});


var job_status_figure = {
	'unread': 1,
	'assigned': 2,
	'done': 3,
	'error_when_reading': 4
}

////////// jobs add ///////////////
function jobs_add(req, res) {
	log_dev('jobs_put'.blue.italic, req.body.job_target, req.body.client_id, (new Date().toGMTString()).blue.italic);
	qs = req.body;
	client_id = qs.client_id;
	job_target = qs.job_target;
	jobs = qs.jobs;
	log_dev(jobs.length);
	//console.log(req.body)
	//console.log(client_id == undefined, jobs == undefined, job_target == undefined)
	if (client_id == undefined || jobs == undefined || job_target == undefined) {
		res.send(400, 'wrong json');
		return
	} else {
		// jobs is already become json, so no need to parse again
	}
	jobs_add_bulk_insert(jobs, 0, res)
}

function jobs_add_bulk_update(jobs, i, res){
	if (i < jobs.length) {
		job = JSON.parse(JSON.stringify(jobs[i])); //should I validate the job format before inserting?
		db_opt(function(db){
			var query = db.collection(job_target)
				.update(
					{'job_id': job.job_id}, 
					{$set: job},
					{multi: false},
					function (err) {
						db.close();
						if (err) {
							console.error('jobs_add_bulk_update'.red.bold, err.red.color)
							eventEmitter.emit('mongodb_error', 'update', job_target, client_id_sever, 'jobs_put', err);
							res.send(400, 'db update error')
							return
						} else {
							i = i + 1
							jobs_add_bulk_update(jobs, i, res)
						}
					});
		});
	} else {
		res.send(jobs);
	}
}


//////// jobs_get /////////////
function jobs_get(req, res) {
	console.log('jobs_get'.blue.italic, req.query.job_target, req.query.client_id, (new Date().toGMTString()).blue.italic);
	qs = req.query;
	client_id = qs.client_id;
	client_job_request_count = qs.client_job_request_count;
	job_target = qs.job_target;
	if (client_id == undefined || client_job_request_count == undefined || job_target == undefined) {
		res.send(400, 'wrong json');
		return
	} else {
		client_job_request_count = parseInt(client_job_request_count)
	}
	db_opt(function(db){
		var query = 
		db.collection(job_target)
			.find({'job_status':{$lte:job_status_figure.unread}})
			.limit(client_job_request_count)
			.toArray(function(err, docs){
				db.close();
				if (err) {
					console.error('jobs_get db'.red.bold, err.red.bold)
					eventEmitter.emit('mongodb_error', 'find', job_target, client_id_sever, 'jobs_get', err);
					res.send(400, 'db find error');
					return
				}
				var _ids = []
				for (var i = 0; i<docs.length; i++){
					_ids.push(docs[i]._id)
				}
				// update the job_status
				db_opt(function(db1){
					db1.collection(job_target)
						.update(
							{'_id': {$in: _ids}}, 
							{$set: {'job_status':job_status_figure.assigned, 'client_id':client_id}}, 
							{multi:true},
							function(err){
								db1.close()
								if (err){
									console.error('jobs_get'.red.bold, err.red.bold);
									eventEmitter.emit('mongodb_error', 'update', job_target, client_id_sever, 'jobs_get', err);
									res.send(400, 'db update error');
								} else {
									res.send(docs)
								}
							});
				});
			});
	});
}


/////////// jobs_put ////////////
function jobs_put(req, res) {
	console.log('jobs_put'.blue.italic, req.body.job_target, req.body.client_id, (new Date().toGMTString()).blue.italic);
	qs = req.body;
	client_id = qs.client_id;
	job_target = qs.job_target;
	jobs = qs.jobs;
	console.log(jobs.length);
	//console.log(req.body)
	//console.log(client_id == undefined, jobs == undefined, job_target == undefined)
	if (client_id == undefined || jobs == undefined || job_target == undefined) {
		res.send(400, 'wrong json');
		return
	} else {
		// jobs is already become json, so no need to parse again
	}
	jobs_put_bulk_update(jobs, 0, res)
}

function jobs_put_bulk_update(jobs, i, res){
	if (i < jobs.length) {
		job = JSON.parse(JSON.stringify(jobs[i]));
		_id = new ObjectID(job._id);
		delete job._id;
		//delete job._id; // _id is a string, and it have to use objectid wrapper, so simply delete in updating would make life easier. 
		//console.log(i, jobs.length, _id, jobs[i].update_date)
		db_opt(function(db){
			var query = db.collection(job_target)
				.update(
					{'_id': _id}, 
					{$set: job},
					{multi: false},
					function (err) {
						db.close();
						if (err) {
							console.error('jobs_put_bulk_update'.red.bold, err.red.color)
							eventEmitter.emit('mongodb_error', 'update', job_target, client_id_sever, 'jobs_put', err);
							res.send(400, 'db update error')
							return
						} else {
							i = i + 1
							jobs_put_bulk_update(jobs, i, res)
						}
					});
		});
	} else {
		res.send(jobs);
	}
}

//////////////
function jobs_settings(req, res){
	console.log('jobs_settings'.blue.italic, req.query.settings_action, (new Date().toGMTString()).blue.italic)
	qs = req.query;
	settings_action = qs.settings_action;
	if (settings_action == undefined) {
		console.error("jobs_settings".red.bold, 'settings_action == undefined');
		res.send(400, 'settings_action == undefined')
		return 
	}
	settings_action = settings_action.toLowerCase().trim();
	if (settings_action == 'view') {
		db_opt(function(db){
			db.collection(collection_name_jobs_settings)
				.find({})
				.toArray(function(err, docs){
					db.close();
					if (err) {
						console.error('jobs_settings view'.red.bold)
						eventEmitter.emit('mongodb_error', 'find', job_target, client_id_sever, 'jobs_settings', err);
						res.send(400, 'jobs_settings view db error')
						return
					} else {
						for (var i=0; i<docs.length; i++){
							docs[i]['setting_url'] = '/web_jobs/jobs_settings?settings_action=setting&client_id=server&job_target='+docs[i]['job_target']+'&settings_key='+docs[i]['settings_key']+'&settings_value=';
						}
						res.send(docs);
					}
				});
		});
	} else if (settings_action == 'get') {
		job_target = qs.job_target;
		client_id = qs.client_id;
		settings_key = qs.settings_key;
		if (job_target == undefined || client_id == undefined || settings_key == undefined) {
			console.error("jobs_settings get".red.bold, 'job_target == undefined || client_id == undefined || settings_key == undefined');
			res.send(400, 'settings_action get: job_target == undefined || client_id == undefined || settings_key == undefined')
			return 
		}
		db_opt(function(db){
			db.collection(collection_name_jobs_settings)
				.findOne({'settings_key':settings_key}, function(err, item){
					if (err){
						console.error("jobs_settings get".red.bold, 'findone error');
						eventEmitter.emit('mongodb_error', 'findOne', job_target, client_id_sever, 'jobs_settings', err);
						res.send(400, 'findone error')
						return 
					} else {
						res.send(item)
					}
				});
		});
	} else if (settings_action == 'setting') {
		job_target = qs.job_target;
		client_id = qs.client_id;
		settings_key = qs.settings_key;
		settings_value = qs.settings_value;
		if (job_target == undefined || client_id == undefined || settings_key == undefined || settings_value == undefined) {
			console.error("jobs_settings setttings".red.bold, 'job_target == undefined || client_id == undefined || settings_key == undefined || settings_value == undefined');
			res.send(400, 'settings_action settings: job_target == undefined || client_id == undefined || settings_key == undefined || settings_value == undefined')
			return 
		}
		db_opt(function(db){
			db.collection(collection_name_jobs_settings)
				.update(
					{'job_target': job_target, 'settings_key': settings_key},
					// plan to set up client, however, it would difficult to split between clients. 
					{$set: {'job_target': job_target, 'settings_value': settings_value, 'settings_key': settings_key, 'update_date': new Date().toGMTString()}},
					{upsert: true},
					function (err) {
						db.close();
						if (err) {
							console.error('jobs_settings'.red.bold, err.red.bold);
							eventEmitter.emit('mongodb_error', 'update', job_target, client_id_sever, 'jobs_settings', err);
							res.send(400, 'settings_action db update error');
							return
						} else {
							res.redirect('/web_jobs/jobs_settings?settings_action=view')
						}
					});
		});
	} else {
		console.error("jobs_settings".red.bold, 'settings_action == ', settings_action);
		res.send(400, 'settings_action == '+settings_action)
		return 
	}
}


//////////////
function jobs_view(req, res){
	qs = req.query;
	db_opt(function(db){
		db.collections(function(err, collections){
			db.close(); 
			if (err){
				console.error('jobs_view'.red.bold);
				eventEmitter.emit('mongodb_error', 'collections', "job_collections", client_id_server, 'jobs_view', err);
				return
			}
			var collection_names = [];
			for (var i = 1; i< collections.length; i++){
				collection = collections[i];
				collection_names.push(collection.collectionName);
			}
			var progress = {'job_status':{}, 'error_log':{}, 'client_id':{}}
			var collection_names_copy = collection_names.slice(0);
			jobs_view_job_status(collection_names, collection_names_copy, res, progress);
		});
	})
}
function jobs_view_job_status(collection_names, collection_names_copy, res, progress){
	console.log('job_status', collection_names_copy.length);
	if (collection_names_copy.length == 0){
		// come to error log
		// how many clients jobs do. save as this but id filed is different 
		var collection_names_copy = collection_names;
		jobs_view_client_id(collection_names, collection_names_copy, res, progress)
		return
	}
	var collection_name = collection_names_copy.pop();
	console.log(collection_name);
	if (collection_name == 'jobs_settings' || collection_name == 'error_log') {
		jobs_view_job_status(collection_names, collection_names_copy, res, progress);
		return
	}
	db_opt(function(db){
		db.collection(collection_name)
			.aggregate([
					{$group: {_id:'$job_status', count:{$sum:1}}}
				],
				function(err, docs){
					db.close();
					if (err){
						console.error('jobs_view_job_status'.red.bold, err);
						eventEmitter.emit('mongodb_error', 'aggregate', 'jobs_collection', client_id_server, 'jobs_view_job_status', err);
						return
					}
					console.log(docs);
					progress['job_status'][collection_name] = docs;
					jobs_view_job_status(collection_names, collection_names_copy, res, progress);
					return
				}
			);
		}
	);
}
function jobs_view_client_id(collection_names, collection_names_copy, res, progress){
	console.log('client_id', collection_names_copy.length);
	if (collection_names_copy.length == 0){
		jobs_view_error_log(collection_names, res, progress);
		return
	}
	var collection_name = collection_names_copy.pop();
	console.log(collection_name);
	if (collection_name == 'jobs_settings') {
		jobs_view_client_id(collection_names, collection_names_copy, res, progress);
		return
	}
	db_opt(function(db){
		db.collection(collection_name)
			.aggregate([
					{$group: {_id:'$client_id', count:{$sum:1}}}
				],
				function(err, docs){
					db.close();
					if (err){
						console.error('jobs_view_client_id'.red.bold, err);
						eventEmitter.emit('mongodb_error', 'aggregate', 'jobs_collection', client_id_server, 'jobs_view_client_id', err);
						return
					}
					console.log(docs);
					progress['client_id'][collection_name] = docs;
					jobs_view_client_id(collection_names, collection_names_copy, res, progress);
					return
				}
			);
		}
	);
}
function jobs_view_error_log(collection_names, res, progress){
	console.log('client_id', collection_names.length);
	db_opt(function(db){
		db.collection('error_log')
			.find()
			.sort({'report_date':-1}) 
			.limit(10)
			.toArray(function(err, docs){
				db.close();
				if (err) {
					console.error('jobs_view_error_log'.red.bold, err);
					eventEmitter.emit('mongodb_error', 'find', "jobs_collection", client_id_server, 'jobs_view_error_log', err);
					return
				}
				progress['error_log'] = docs;
				res.send(progress);
			});
	});
}


function jobs_reset(req, res){
	console.log('jobs_reset'.blue.italic, req.query.job_target, req.query.client_id, (new Date().toGMTString()).blue.italic);
	qs = req.query;
	client_id = qs.client_id;
	job_target = qs.job_target;
	if (client_id == undefined || job_target == undefined){
		res.send(400, 'jobs_reset wrong argument');
		return
	}
	db_opt(function(db){
		db.collection(job_target)
			.update(
				{'job_status':job_status_figure.assigned},
				{$set: {'job_status':job_status_figure.unread}}, 
				{multi:true},
				function(err){
					db.close()
					if (err){
						console.error('jobs_reset'.red.bold, err);
						eventEmitter.emit('mongodb_error', 'update', job_target, client_id_server, 'jobs_reset', err);
						res.send(400, 'mongodb error in jobs_reset');
					} else {
						res.redirect('/web_jobs/jobs_view');
					}
				});

	});
}


function jobs_mongodb_dump_files (req, res){
	var results = {};
	file_names = fs.readdirSync(__dirname+'/dump/web_jobs/');
	for (var i in file_names) {
		file_name = file_names[i];
		var file_stat = fs.statSync(__dirname+'/dump/web_jobs/'+file_name);
		//console.log(file_stat);
		results[file_name] = {};
		results[file_name]['filesize'] = filesize(file_stat.size);
		results[file_name]['create_time'] = file_stat.atime;
		results[file_name]['modify_time'] = file_stat.mtime;
		results[file_name]['link'] = '/web_jobs/dump/'+file_name;  // how to get the full url, please

	}
	//console.log(app.settings);
	//console.log(process.env);
	console.log(os.hostname());
	res.send(results);
}

function jobs_mongodb_dump_action (req, res) {
	var child = exec('mongodump',
		function (error, stdout, stderr) {
			if (error) {
				console.log('exec error: ' + error);
				res.send(400, error);
			} else {
				res.send("<pre>"+stdout+"</pre>");
			}
		});
}
function jobs_mongodb_export(req, res){
	qs = req.query;
	job_target = qs.job_target;
	if (job_target == undefined) {
		res.send(400, 'job_target == undefined');
		return
	}
	console.log('mongoexport --db web_jobs --collection '+job_target+' --out mongodb_export/'+job_target+'.json');
	var child = exec('mongoexport --db web_jobs --collection '+job_target+' --out mongodb_export/'+job_target+'.json',
		function (error, stdout, stderr) {
			if (error) {
				console.log('exec error: ' + error);
				res.send(400, error);
			} else {
				res.send("<pre>"+stdout+"</pre>");
			}
		});
}
function jobs_mongodb_import(req, res){
	qs = req.query;
	job_target = qs.job_target;
	if (job_target == undefined) {
		res.send(400, 'job_target == undefined');
		return
	}
	console.log('mongoimport --db web_jobs --collection '+job_target+' --out mongodb_export/'+job_target+'.json');
	var child = exec('mongoimport --db web_jobs --collection '+job_target+' --out mongodb_export/'+job_target+'.json',
		function (error, stdout, stderr) {
			if (error) {
				console.log('exec error: ' + error);
				res.send(400, error);
			} else {
				res.send("<pre>"+stdout+"</pre>");
			}
		});
}
function jobs_mongodb_export_files (req, res){
	var results = {};
	file_names = fs.readdirSync(__dirname+'/mongodb_export/');
	for (var i in file_names) {
		file_name = file_names[i];
		var file_stat = fs.statSync(__dirname+'/mongodb_export/'+file_name);
		//console.log(file_stat);
		results[file_name] = {};
		results[file_name]['filesize'] = filesize(file_stat.size);
		results[file_name]['create_time'] = file_stat.atime;
		results[file_name]['modify_time'] = file_stat.mtime;
		results[file_name]['link'] = '/web_jobs/mongodb_export_files/'+file_name;  // how to get the full url, please

	}
	console.log(os.hostname());
	res.send(results);
}



// express app routing
function app_route(app){
	app.get('/', urls_list);
	app.get('/hello', hello);
	app.get('/web_jobs/test_connect', test_connect);
	app.get('/web_jobs/jobs_add', jobs_add);
	app.get('/web_jobs/jobs_get', jobs_get);
	app.get('/web_jobs/jobs_view', jobs_view);
	app.get('/web_jobs/jobs_reset', jobs_reset);
	//app.get('/web_jobs/jobs_backup_export', jobs_export);
	//app.post('/web_jobs/jobs_backup_import', jobs_import);
	app.post('/web_jobs/jobs_put', jobs_put);
	app.get('/web_jobs/jobs_settings', jobs_settings);
	app.get('/web_jobs/error_log', error_log);
	app.use('/web_jobs/urls_list', urls_list);

	// have to use both directory and static, as directory does not allow to view single files. 
	app.use('/web_jobs/dump', express.directory(__dirname + '/dump/web_jobs/', icons=true));
	app.use('/web_jobs/dump', express.static(__dirname + '/dump/web_jobs/'));
	app.get('/web_jobs/dump_files', jobs_mongodb_dump_files);
	app.get('/web_jobs/dump_action', jobs_mongodb_dump_action);
	app.get('/web_jobs/mongodb_export_action', jobs_mongodb_export);
	app.use('/web_jobs/mongodb_export_files', express.static(__dirname + '/mongodb_export/'));
	app.use('/web_jobs/mongodb_export_files', express.directory(__dirname + '/mongodb_export/', icons=true));
	app.get('/web_jobs/mongodb_export_files_view', jobs_mongodb_export_files);
	app.get('/web_jobs/mongodb_import_action', jobs_mongodb_import);
}

function main(){
	var app = express();
	app.use(express.bodyParser());
	app.listen(8080);
	app_route(app);
	console.log("## WebDownloadJobManager server start at "+new Date().toGMTString()+" ##")
}

if (require.main == module) {
	main();
}

module.exports.main = main;






