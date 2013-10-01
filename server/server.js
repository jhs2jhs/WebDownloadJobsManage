// global setting should appear in my_config.js file

var express = require('express');
var app = express();
var sprintf = require('util').format;
var MongoClient = require('mongodb').MongoClient;
var mongodb_url = 'mongodb://127.0.0.1:27017/web_jobs'

function db_opt(db_callback){
	MongoClient.connect(mongodb_url, function(err, db){
		if (err) throw err;
		db_callback(db);
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

function jobs_get(req, res) {
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
				console.dir(docs)
				db.close();
				var jobs_ids = []
				for (var i = 0; i<docs.length; i++){
					jobs_ids.push(docs[i]._id)
				}
				// update the job_status
				db_opt(function(db1){
					db1.collection(job_target)
						.update(
							{'_id': {$in: jobs_ids}}, 
							{$set: {'job_status':job_status_figure.assigned, 'client_id':client_id}}, 
							{multi:true},
							function(err){
								if (err){
									res.send(400, 'db update error');
								} else {
									res.send(docs)
								}
							});
				});
			});
	});
}


app.use(express.bodyParser());
app.get('/hello', hello);
app.get('/web_jobs/jobs_get', jobs_get);
//app.get('/web_jobs/jobs_view', jobs_view);
//app.get('/web_jobs/jobs_reset', jobs_reset);
//app.get('/web_jobs/jobs_backup_export', jobs_export);
//app.post('/web_jobs/jobs_backup_import', jobs_import);
//app.post('/web_jobs/jobs_put', jobs_put);

app.listen(8080);