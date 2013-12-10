var env = require('../env.json');
var node_env = process.env.NODE_ENV || 'development';
var myenv = env[node_env];

var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var Db = require('mongodb').Db;
var MongoServer = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;

var my_jobs_target = 'thingiverse';
var my_jobs_settings = {jobs_target:{}};

/*
1. jobs_settings
2. jobs_get
3. jobs_do
4. jobs_put and maybe jobs_add
*/

/*
var mongoclient = new MongoClient(new MongoServer(myenv['mongodb_server_address'], myenv['mongodb_server_port']));
mongoclient.open(function(err, mongoclient) {
	var db = mongoclient.db(myenv['mongodb_server_db_name']);
	db.collection(myenv['mongodb_db_name_jobs_settings']).find().toArray(function(err, docs){
		console.log(docs);
		db.close();
	});
});
*/

var mongoserver = new mongodb.Server(myenv['mongodb_server_address'], myenv['mongodb_server_port'], {auto_reconnect:true});
var db = new mongodb.Db(myenv['mongodb_server_db_name'], mongoserver, {w:1});
db.open(function(){});

db.collection(myenv['mongodb_db_name_jobs_settings']).find().toArray(function(err, docs){
			console.log(docs);
			db.close()
		});
//db.collection(my_jobs_target).find().limit(10).toArray(function(err, docs){
//			console.log(docs);
//		});


/*
// jobs_settings
function set_jobs_settings(docs){
	//var jobs_settings = {};
	console.log(my_jobs_settings);
	for (var i = 0; i< docs.length; i++) {
		var job_target = docs[i]['job_target'];
		var settings_key = docs[i]['settings_key'];
		var settings_value = docs[i]['settings_value'];
		if (my_jobs_settings[job_target] == undefined) {
			my_jobs_settings[job_target] = {};
		}
		my_jobs_settings[job_target][settings_key] = settings_value;
	}
	console.log(my_jobs_settings);
	return my_jobs_settings;
}
function jobs_settings(){
	db.open(function(err, db){
		db.collection(myenv['mongodb_db_name_jobs_settings']).find().toArray(function(err, docs){
			set_jobs_settings(docs);
			db.close();
		});
	});
}

// jobs_get
function jobs_get(){
	db.open(function(err, db){
		db.collection(my_jobs_target).find().limit(my_jobs_settings[my_jobs_target]['client_job_request_count']).toArray(function(err, docs){
			console.log(docs);
			db.close();
		});
	});
}
*/

//jobs_settings();
//jobs_get();








