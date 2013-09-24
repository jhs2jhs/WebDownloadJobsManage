WebDownloadJobsManage
=====================

Download Web for purpose


Development Environment setting up:
1. to install mongodb on server: http://docs.mongodb.org/manual/installation/ , better to install with package manager, like brew
2. to start mongodb server: $mongod
2. test mongodb server connection: $mongo
3. 


mongodb style:
1. document == record or row in a table in sql
2. collection == table in sql
3. insert document: db.[collection].insert([{type:'misc', item:'card'}])
4. insert with update: db.[collection].update(<query>, <update>, <upsert>, <multi>), options: upsert (if set to true, creates a new document when no document matces the query criteria. the default vaue is false, which does not insert a new document when no match is found.) and multi (if set to true, ipdates multiple documents that meet the query criteria, if set to false, updates one document, the deault value is false)
4. insert with save is same as insert with update
5. query: db.<collection>.find(<query>): an empty query document {} selects all documents in the collection.  specify conditions using query operators. AND, OR, 

mongodb stores all documents in collections. a collection is a group of related documents that have a set of shared common indexes. collections are analogous to a table in relational databases. 



Server side database consideration:
1. server would performan as RESTful for jobs management. 
2. server would running in a fixed place, like Amazon EC2, so no need to worry touch about requirment for portable. 
3. sqlite3 is not good in server side. it is good to transform the database while development, but it is less easy to manage the transform. 
4. 
3. use mongodb?

client side databaset consideration:
1. client should use standlone, single-file, serveless database. 
2. client would always install or plugin, so it is better to move them around. 
3. client should be less depedency to allow easy installationa and migration. 
4. client database should be a embeded database.
5. ejdb? 


Web Post processing:
write a common python framework to process the document. 


tutotial:
how to install software and parse the document. 



license: it is FREE for any purpose even commerical because is released under the Apache2 License. 

