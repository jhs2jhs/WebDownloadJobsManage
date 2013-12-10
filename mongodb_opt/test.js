var assert = require('assert');
var should = require('should');

var env = require('../env.json');
var node_env = process.env.NODE_ENV || 'development';
var myenv = env[node_env];

describe('NODE_ENV', function(){
	it("should be development", function(){
		assert.equal(node_env, "development");
	});
});

var jobs_settings = {};

var MongoClient = require('mongodb').MongoClient;
var Db = require('mongodb').Db;
var MongoServer = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;
var db = new Db(myenv['mongodb_server_db_name'], {w:1}, new MongoServer(myenv['mongodb_server_address'], myenv['mongodb_server_port']));

var exec = require('child_process').exec;

/*
1. jobs_settings
1. jobs_add
2. jobs_get
3. jobs_do
4. jobs_put and maybe jobs_add
*/

// Database clean
/*
function assert_jobs_settings(done){
	mongoclient.open(function(err, mongoclient) {
		var db = mongoclient.db(myenv['mongodb_server_db_name']);
		db.dropDatabase(function(err, result){
			assert.ok(! err);
			db.close();
			mongoclient.close()
			done();
		});
	});
}
describe("DATABASE CLEAN", function(done){
	it('should delete all other database', function(){
		assert_jobs_settings(done);
	})
});
*/

// jobs_setting insert
/*
function insert_jobs_settings(done){
	child = exec('python ../server/db_insert_jobs_settings.py', function(err, stdout, stderr) {
    	//console.log('stdout:'+stdout);
    	assert.ok(! err);
        done();
    });
}
describe("JOBS_SETTINGS", function(){
	it("should insert jobs_settings", function(){
		//insert_jobs_settings(done);
		exec('python ../server/db_insert_jobs_settings.py');
	})
})
*/



// jobs_setting get
function set_jobs_settings(docs){
	var jobs_settings = {};
	for (var i = 0; i< docs.length; i++) {
		var job_target = docs[i]['jobs_target'];
		var settings_key = docs[i]['settings_key'];
		var settings_value = docs[i]['settings_value'];
		if (jobs_settings[job_target] == undefined) {
			jobs_settings[job_target] = {};
		}
		jobs_settings[job_target][settings_key] = settings_value;
	}
	return jobs_settings;
}
function assert_jobs_settings(done){
	db.open(function(err, db){
		db.collection(myenv['mongodb_db_name_jobs_settings']).find().toArray(function(err, docs){
			assert(docs);
			global.jobs_settings = set_jobs_settings(docs);
			assert(global.jobs_settings);
			console.log(jobs_settings, "hello");
			console.log(global.jobs_settings, "world");
			done();
			db.close();
		});
	});
}
describe('JOBS_SETTINGS', function(done){
	it('should be more than one settings', function(){
		assert_jobs_settings(done)
	});
});



