WebDownloadJobsManage
=====================

# todo
4. needs to set up client for google play store app interface
5. needs to set up client for google review scrapping. may be ajax or post
6. needs to set up for weibo scraping. 
7. at the same needs to write code for deviance score. 


3. each client computer should have a deamen, so if new jobs coming, it should be able to check the code updating on git, get the code of client software, and then call the client process if new jobs coming. at monent, it is all manually. For example, I need to log into each computer to start the client process, and when the job done, the process will stop competely. 
4. needs to detect the error show that two many workers are competing for IP, it means a website try to block multiple comptier within a same ip address.  search for "website scraping ip restraction and blocking".
5. provide a easy to use web address. 

4. each client should be able to detect a best fitting web access interval. 
5. user management with a simple web interface: python data push into mongo. learn how to delete data from command, require username and password
5. design a protocol chart for explation
5. simplify http_get_or_post method, to keep it simply. 

7. later problem will be put as issue. 


#Introduction:

find all the baby music, put it into ipod and also burn a disk, so I can play it for mingye in the car and when wake up
buy ram

This is a complete solution to download website for scraping in a easy-to-do fashion. It involves a download jobs manager on server sides and a number of workers as client to communicate to the server to conduct the actual downloading jobs. 

## why this software solution:
1. did you need to frequently scrpae website or download online resources like website?
2. did you find a single scraping software is too slow to finish your scrape jobs?
3. did you find error wheter you run your scrape software, and you are regret not save websites for error recovery?
4. did you find write software to scrape is too much learning step for you, as you are programming background?
5. 


## what is a job:
a_job = {job_id, job_url, job_file_path, job_status, client_id}

1. job_id: a unique id for a job
2. job_url: actual web address to download from
3. job_file_path: tell where the downloaded website to saved. 
4. job_stauts: whether it is just created, be assign to a worker or done
5. client_id: it only knows which worker created the job or who it assigned to or who done the job. 

## work flow:

#### create jobs (pre):
1. create a list of jobs and save them on the job_manager, so that job_worker can fetch later to conduct in next step. 
2. job can dynamically created when executing, but not recommaneded. better to do after process results. 
3. each job has a job_id, so job can be updated based on job_id.
4. can write a python or other code to push job into job_manager. can also use a excel to create a file with all jobs and then read and push to the job_manager. see detailed example later. 

#### conduct jobs (during):
1. job_worker will connect to job_manager to get a list of job to do
2. job_work will save the download website into a file in job_work's local computer. those saved downloaded file can be revisited later. 
3. this step will automaticaly happened with this software. 
4. normally only need one job_manager, but the number of job_workers can be as mang as want to speed up and distribtue.

#### process results (post):
1. now all the website has been downloaded and saved into local computer, so can write python code or other code to execute jobs step by step. 
2. processing can be redone if any error happend, so it is extreme helpful to develop a comprehensive results. 


## components: 
##### jobs_manager (server): 
1. record a list of jobs needs to do and already done. 
2. control how jobs_worker can conduct the downloading jobs. 
3. report the progress of jobs conduction in email back to people who are wathcing on
4. provide a web interface as central place to view the jobs

#### jobs_worker (client):
1. communicate to jobs_manager over http protocol to fetch jobs to do.
2. conduct the job be assiged to self. 
3. report back the jobs results back to jobs_manager. 
4. allow jobs_manager to control on how to conduct the jobs. 

# Details:


## features:
1. have a configure file, so each job_worker do not need repeate setted after done once. 
2. can run under proxy network environment. just need to set the proxy in configure file. have a example to demonstrate how to set up in example. 
3. job_manger can control how job_work run, it means server side can configure on client by using a web interface on sever. 
4. develop example on create and push jobs to job_manager, with writing new code (for programmer) or using execl (for non-programmer). 
5. db_inser_jobs_xxx.py can be used to insert new jobs without overwrite existing jobs. 


## reading points
1. we only need one server, as all jobs will be managed under a common network address. but we will run multiple job_workers, so we will have multiple clients, so we need to provide a seperate utility file and configure file for clients. 
2. because ejdb does not support self app_id, so i have to change the job_id in mongodb.
3. mongodb remeber to close db after reach the funciton, otherwise it will meet connection error. check out on server side. 
4. request module is not always very robost, https://github.com/joyent/node/issues/4863 request is not always the best in this case. So I have to use local http request. 
5. scrape on amazon website, it is better to add a / in the end of url: for example, `http://www.amazon.com/mobile-apps/b/ref=mas_dl?ie=UTF8&node=2350149011/`
6. plan to use cluster module to restart process automaticallly, however, ejdb does not support multiple process, so it has to rely on single process for each task. 
7. `console.time(label)`, `console.timeEnd(label)`: can be used to measure the timedifference. 
8. install supervisor for nodejs debugging `npm install supervisor -g`
9. common error: 'http encode, check / in the end of url'


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


## set up on amazon ec2:
1. ssh into amazon ec2: 
2. install mongodb on ubuntu: http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/
	2. mongodb store db files in `/var/lib/mongodb`
	3. 
3. start mongodb: `sudo service mongodb start`
4. set up file: `git clone https://github.com/jianhuashao/WebDownloadJobsManage.git`
5. update npm: `npm install`
6. using forever to create a child_process: `cd server; sudo sh start`, remember to use sudo while forever
7. insert data to mongodb: `python db_insert_jobs_thingiverse.py`
8. back up the mongodb `mongodump` http://docs.mongodb.org/manual/tutorial/backup-databases-with-binary-database-dumps/, remember each back up will overwrite previous backup.


#### increase disk space on ec2: 
1. http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-expand-volume.html
2. check price spending on ec2: https://portal.aws.amazon.com/gp/aws/developer/account/index.html?ie=UTF8&action=activity-summary
3. 



## Development Environment setting up:
1. to install mongodb on server: `http://docs.mongodb.org/manual/installation/` , better to install with package manager, like homebrew on Mac OSX
2. to start mongodb server: `$mongod`
2. test mongodb server connection: `$mongo`
3. have ejdb install globally: `$npm install -g ejdb`
3. have python 2.7 intalled. 
3. install pymongo for python environment: `$pip install pymongo`.
4. update code repository: `git clone https://github.com/jianhuashao/WebDownloadJobsManage.git`
4. update node local depedency: `$npm install`.
5. push jobs into server mongodb with python code or excel file.
6. start jobs_manager on server side: `$supervisor server.js` for development or `$node server.js` for production.
7. check the config.js file on client side, to make sure server address is correct. 
8. run the job_worker on client side: `$node client_appid_to_asin`.

#### urls for jobs_settings testing:
1. `http://localhost:8080/web_jobs/jobs_settings?settings_action=`
2. `http://localhost:8080/web_jobs/jobs_settings?settings_action=get&job_target=appid_to_asin&client_id=dtc&settings_key=web_access_interval`
3. python db_insert_row.py to insert db from local db into mongodb server
2. `http://localhost:8080/web_jobs/jobs_get?client_id=dtc&client_job_request_count=10&job_target=appid_to_asin` to get a list jobs. 
3. `http://localhost:8080/web_jobs/jobs_view` to view jobs progress and error_log
4. `http://localhost:8080/web_jobs/dump_action` to mongodump to back the whole database
5. `http://localhost:8080/web_jobs/mongodb_export_action?job_target=appid_to_asin` to export appid_to_asin collection into a json file
6. ``http://localhost:8080/web_jobs/mongodb_import_action?job_target=appid_to_asin` to import appid_to_asin collection into database, it will not overwrite existing documents in database, but only insert the non-exisitng one. 
7. `http://localhost:8080/web_jobs/mongodb_export_files` to view the file size and other information. 
8. 


## web scrapting storage structure
for each job_target: ==> should be collection or table to reduce the masiveness in the table. 'log' is been reserved. 

1. job_id
3. job_url
4. job_file_path
5. client_id
6. create_date
7. update_date
8. job_status

#### jobs_get:
1. request: `client_id`, `client_job_request_count`, `job_target`
2. response: `job_target`, `client_id`, `<jobs>`
3. db operation: assign client_id to jobs, set job_status to 1


#### jobs_put:
1. request: `client_id`, `<jobs>`
2. response: `[true or false]`
3. db operation: update jobs content, set job_status to 2

#### jobs_view:
1. request: `job_target`
2. response: `status and count`

#### jobs_reset:
1. request: `job_target`, `client_id`
2. response: `redirect to jobs_view`
3. db operation: update job_status into 0, keep log

#### jobs_backup_export:
1. request: `job_target`, `client_id`
2. response: `download`,
3. db operation: keep log

#### jobs_backup_import:
1. request:`job_target`, `client_id`, `<jobs>`
2. response: `[true | false]`
3. db operation: keep log




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


#### common mongodb command:  
	how to remove all data in a collection:
	db.collection.remove()
	db.collection.drop()
	db.collection.insert() will create a collection if it is not exists, but it can not insert a document with same _id value. 
	db.collection.save() will crate a collection if _id is not existing, otherwise, it will update a existing document in it. 
	db.collection.count(<query>)

#### mongodb http rest set up
1. $mongodb --rest
2. access via : `http://127.0.0.1:28017/web_jobs/appid_to_asin/`. the format is `host:port/db/collection/` . make sure to add back slash in the end. 
3. can add a limit: `http://127.0.0.1:28017/databaseName/collectionName/?limit=-10` 
4. can skip: `http://127.0.0.1:28017/databaseName/collectionName/?skip=5`


#### SQL TO MongoDB
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

#### MongoDB http
1. mongodb provide a simple http interface for administrators. the default port is 28017. Locally from http://localhost:28017 
2. simple REST interface
	1. query: `http://127.0.0.1:28017/databaseName/collectionName/?filter_a=1&limit=-10`
	2. 
	
#### Import and Export MongoDB data
JSON does not have the following data types that exist in BSON documents: data_binary, data_date, data_timestamp, data_regex, data_oid and data_ref. As a result, using any tool that decodes BSON documents into JSON will suffer some loss of fidelity. 
If maintaining type fidelity is important, consider writing a data import and export system that does not force BSON documents into JSON form as part of the process. 
mongodb provides two utility tools for export and import: mongoexport and mongoimport. Output file can be JSON or CSV format. 
1. mongoexport: output all files out.
2. mongoimport: it will will not overwrite existing record unless you specify '--upsert' argument. it will only insert on-existing records. http://stackoverflow.com/questions/10018580/how-to-import-only-non-existing-documents


#### Server side database consideration:
1. server would performan as RESTful for jobs management. 
2. server would running in a fixed place, like Amazon EC2, so no need to worry touch about requirment for portable. 
3. sqlite3 is not good in server side. it is good to transform the database while development, but it is less easy to manage the transform. 
4. 
3. use mongodb?
4. sever side backup, automatically 

#### client side databaset consideration:
1. client should use standlone, single-file, serveless database. 
2. client would always install or plugin, so it is better to move them around. 
3. client should be less depedency to allow easy installationa and migration. 
4. client database should be a embeded database.
5. ejdb? 

#### unique key in mongodb, so insert will ignore if exist
1. `db.collection.getIndexes()`: http://docs.mongodb.org/manual/reference/method/db.collection.dropIndex/#db.collection.dropIndex
2. `db.appid_to_asin.ensureIndex({job_id:1}, {unique:true, dropDups:true})`: http://docs.mongodb.org/manual/reference/method/db.collection.dropIndex/#db.collection.dropIndex
3. `db.appid_to_asin.dropIndex('job_id_1')`: drop index



## Web Post processing:
write a common python framework to process the document. 


## tutotial:
how to install software and parse the document. 



## license: 
it is FREE for any purpose even commerical because is released under the Apache2 License. 

