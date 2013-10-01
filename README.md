WebDownloadJobsManage
=====================

Download Web for purpose

## todo
1. python data push into mongo. learn how to delete data from command, require username and password
2. nodejs sever needs to fill the rest jobs. 
3. nodejs client start to work then. 
4. how to add new jobs without stopping???

## done: 
1. python db_insert_row.py to insert db from local db into mongodb server
2. http://localhost:8080/web_jobs/jobs_get?client_id=dtc&client_job_request_count=10&job_target=appid_to_asin to get a list jobs. 
3. 

we only need one sever, with automatically add jobs, or manage the db operation. 
we need multiple client, each client is for each job, so need to have utility files. 


because ejdb does not support self app_id, so i have to change the job_id in mongodb


mongodb remeber to close db after reach the funciton, otherwise it will meet connection error. check out on server side



## Development Environment setting up:
1. to install mongodb on server: http://docs.mongodb.org/manual/installation/ , better to install with package manager, like brew
2. to start mongodb server: $mongod
2. test mongodb server connection: $mongo
3. install pymongo for python environment 



how to remove all data in a collection:
db.collection.remove()
db.collection.drop()
db.collection.insert() will create a collection if it is not exists, but it can not insert a document with same _id value. 
db.collection.save() will crate a collection if _id is not existing, otherwise, it will update a existing document in it. 
db.collection.count(<query>)


### ejdb for client local data store
the reason do not use it, is it has to require unique _id, which is conflict to maongo custom _id


### mongodb http rest set up
1. $mongodb --rest
2. access via : `http://127.0.0.1:28017/web_jobs/appid_to_asin/`. the format is `host:port/db/collection/` . make sure to add back slash in the end. 
3. can add a limit: `http://127.0.0.1:28017/databaseName/collectionName/?limit=-10` 
4. can skip: `http://127.0.0.1:28017/databaseName/collectionName/?skip=5`
5. 

##### python 
1. install: `pip install pymongo`
2. 


#### install supervisor for nodejs debugging
npm install supervisor -g

##### mongodb in node.js
http://mongodb.github.io/node-mongodb-native/api-generated/collection.html

#### db find and then update in jobs_get
	function saveAll( callback ){
  		var count = 0;
  		docs.forEach(function(doc){
      		doc.save(function(err){
          		count++;
          		if( count == docs.length ){
             		callback();
          		}
      		});
  		});
	}


## web scrapting storage structure
for each job_target: ==> should be collection or table to reduce the masiveness in the table. 'log' is been reserved. 

1. job_id
3. job_url
4. job_file_path
5. client_id
6. create_date
7. update_date
8. job_status

### jobs_get:
1. request: `client_id`, `client_job_request_count`, `job_target`
2. response: `job_target`, `client_id`, `<jobs>`
3. db operation: assign client_id to jobs, set job_status to 1


### jobs_put:
1. request: `client_id`, `<jobs>`
2. response: `[true or false]`
3. db operation: update jobs content, set job_status to 2

### jobs_view:
1. request: `job_target`
2. response: `status and count`

### jobs_reset:
1. request: `job_target`, `client_id`
2. response: `redirect to jobs_view`
3. db operation: update job_status into 0, keep log

### jobs_backup_export:
1. request: `job_target`, `client_id`
2. response: `download`,
3. db operation: keep log

### jobs_backup_import:
1. request:`job_target`, `client_id`, `<jobs>`
2. response: `[true | false]`
3. db operation: keep log






estimated finish time. 
email is send based on several people. 
can jobs be add automatically?




## mongodb style:
1. document == record or row in a table in sql
2. collection == table in sql
3. insert: 
	1. insert document: `db.[collection].insert([{type:'misc', item:'card'}])`
	2. insert with update: `db.[collection].update(<query>, <update>, <upsert>, <multi>)`
		* upsert (if set to true, creates a new document when no document matces the query criteria. the default vaue is false, which does not insert a new document when no match is found.)
		* multi (if set to true, ipdates multiple documents that meet the query criteria, if set to false, updates one document, the deault value is false)
	3. insert with save is same as insert with update
5. query: 
	1. `db.<collection>.find(<query>)`: 
	2. this method returns a cursor. to acess the documents, you need to iteratre the cursor. 
	2. an empty query document {} selects all documents in the collection.  
	3. specify conditions using query operators. `db.inventory.find( { type: { $in: [ 'food', 'snacks' ] } } )`
	4. AND: `db.inventory.find( { type: 'food', price: { $lt: 9.95 } } )`
	5. OR: `db.inventory.find( { type: 'food', $or: [ { qty: { $gt: { price: { $lt: 9.95 } } ]} )`
6. limit fields to return from a query:
	1. return the specififed fields and the _id field only: `db.inventory.find( { type: 'food' }, { item: 1, qty: 1 } )`
	2. return all but the excluded field: `db.inventory.find( { type: 'food' }, { type:0 } )`
7. remove:
	1. `db.<collection>.remove(<query>, <justOne>)`
	2. <justOne>: to limit the delection to just one document set to true or 1. the default value is false. 
8. 

### SQL TO MongoDB
SQL Terms/Concepts | MongoDB Terms/Concpets
-------------------|-----------------------
database | db
table | collection
row | document or BSON document
column | field
index | index
table joins | embedded documents and linking
primary key | primary key
specify any unique column or column combination as primary key | primary key is automatically set to the _id field. 
aggregation | aggregation pipeline

SQL Terms, Functions, and Concepts | MongoDB Aggregation Operators
-- | --
WHERE | $match
GROUP BY | $group
HAVING | $match
SELECT | $project
ORDER BY | $sort
LIMIT | $limit
SUM () | $sum
COUNT() | $sum


### MongoDB http
1. mongodb provide a simple http interface for administrators. the default port is 28017. Locally from http://localhost:28017 
2. simple REST interface
	1. query: `http://127.0.0.1:28017/databaseName/collectionName/?filter_a=1&limit=-10`
	2. 
	
### Import and Export MongoDB data
JSON does not have the following data types that exist in BSON documents: data_binary, data_date, data_timestamp, data_regex, data_oid and data_ref. As a result, using any tool that decodes BSON documents into JSON will suffer some loss of fidelity. 
If maintaining type fidelity is important, consider writing a data import and export system that does not force BSON documents into JSON form as part of the process. 
mongodb provides two utility tools for export and import: mongoexport and mongoimport. Output file can be JSON or CSV format. 
1. mongoexport 





## Server side database consideration:
1. server would performan as RESTful for jobs management. 
2. server would running in a fixed place, like Amazon EC2, so no need to worry touch about requirment for portable. 
3. sqlite3 is not good in server side. it is good to transform the database while development, but it is less easy to manage the transform. 
4. 
3. use mongodb?
4. sever side backup, automatically 

## client side databaset consideration:
1. client should use standlone, single-file, serveless database. 
2. client would always install or plugin, so it is better to move them around. 
3. client should be less depedency to allow easy installationa and migration. 
4. client database should be a embeded database.
5. ejdb? 


## Web Post processing:
write a common python framework to process the document. 


## tutotial:
how to install software and parse the document. 



## license: 
it is FREE for any purpose even commerical because is released under the Apache2 License. 

