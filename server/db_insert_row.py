###### configuration start  ########
job_target = 'appid_to_asin'
client_id = 'server_test'
###### configuration finish ########

###### custom function start, need to modify according to real case
def job_upsert_bulk():
	conn = sqlite3.connect('./amazon_ec2.db')
	c = conn.cursor()
	c.execute('SELECT app_id FROM appid_to_asin_download') ## for testing
	r = c.fetchone()
	i = 0
	t = 0
	while r != None:
		app_id = r[0]
		job_id = app_id
		job_url = 'http://www.amazon.com/gp/mas/dl/android?p='+app_id
		job_file_path = '../../data_row/web_jobs/appdi_to_asin/%s.html'%(app_id)
		client_id = 'db_insert_row.py'
		create_date = str(datetime.now())
		update_date = str(datetime.now())
		job_status = 1
		http_status = -1
		job_upsert(job_id, job_url, job_file_path, client_id, create_date, update_date, job_status, http_status)
		i = i + 1
		if i > t + 1000:
			print t,
			t = t + 1000
		r = c.fetchone()
	print i
###### custom function end, need to modify according to real case


from pymongo import MongoClient
from datetime import datetime
import sqlite3

mongodb_url = 'mongodb://127.0.0.1:27017/'
client = MongoClient(mongodb_url)
db = client['web_jobs']
print "** DB Collections: ", db.collection_names()

collection = db[job_target]
print collection

## insert: only be used for fresh insert, as existing _id would cause duplicate insert and then error
## save: same as _update method, but would create collection if it is not exist
## consider with ejdb does not support custom _id, so I have to use upsert 
def job_upsert(job_id, job_url, job_file_path, client_id, create_date, update_date, job_status, http_status):
	job = {
		"job_id": job_id,
		"job_url":job_url,
		"job_file_path": job_file_path,
		"client_id": client_id,
		"create_date": create_date,
		"update_date": update_date,
		"job_status": job_status,
		"http_status": http_status
	}
	j = db.appid_to_asin.update({'job_id': job_id}, {'$set':job}, upsert=True, multi=True)


if __name__ == "__main__":
	print "start"
	job_upsert_bulk()
	print 'done'
	



