WebDownloadJobsManage
=====================

Download Web for purpose





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

