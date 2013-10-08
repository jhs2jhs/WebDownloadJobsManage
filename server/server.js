// global setting should appear in my_config.js file

var express = require('express');
var app = express();
var sprintf = require('util').format;
var MongoClient = require('mongodb').MongoClient;
var mongodb_url = 'mongodb://127.0.0.1:27017/web_jobs'
var ObjectID = require('mongodb').ObjectID;
var colors = require('colors');
var collection_name_jobs_settings = 'jobs_settings'

function db_opt(db_callback){
	MongoClient.connect(mongodb_url, function(err, db){
		if (err) {
			throw err;
			console.error(err.red.bold)
			//db_opt(db_callback)
		} else {
			db_callback(db);
		}
	});
}

function hello(req, res){
	res.send('Hello World, Jobs Manager');
}

var job_status_figure = {
	'unread': 1,
	'assigned': 2,
	'done': 3,
	'error_when_reading': 4
}

//////// jobs_get /////////////
function jobs_get(req, res) {
	console.log('jobs_get'.blue.italic, req.query.job_target, req.query.client_id);
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
				if (err) {
					console.error('jobs_get db'.red.bold, err.red.bold)
					return
				}
				db.close();
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
	console.log('jobs_put'.blue.italic, req.query.job_target, req.query.client_id)
	qs = req.body;
	client_id = qs.client_id;
	job_target = qs.job_target;
	jobs = qs.jobs;
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
		//console.log(i, jobs.length, jobs[i]._id)
		db_opt(function(db){
			var query = db.collection(job_target)
				.update(
					{'_id': jobs[i]._id}, 
					{$set: job},
					{multi: false},
					function (err) {
						db.close();
						if (err) {
							console.error('jobs_put_bulk_update'.red.bold, err.red.color)
							res.send(400, 'db update error')
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
					if (err) {
						console.error('jobs_settings view'.red.bold)
						res.send(400, 'jobs_settings view db error')
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
							res.send(400, 'settings_action db update error');
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


app.use(express.bodyParser());
app.get('/hello', hello);
app.get('/web_jobs/jobs_get', jobs_get);
//app.get('/web_jobs/jobs_view', jobs_view);
//app.get('/web_jobs/jobs_reset', jobs_reset);
//app.get('/web_jobs/jobs_backup_export', jobs_export);
//app.post('/web_jobs/jobs_backup_import', jobs_import);
app.post('/web_jobs/jobs_put', jobs_put);
app.get('/web_jobs/jobs_settings', jobs_settings);

app.listen(8080);