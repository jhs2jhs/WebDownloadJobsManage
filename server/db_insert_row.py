
from pymongo import MongoClient
from datetime import datetime
import sqlite3


mongodb_url = 'mongodb://127.0.0.1:27017/'
client = MongoClient(mongodb_url)
db = client['web_jobs']
print "** DB Collections: ", db.collection_names()

job_target = 'appid_to_asin'
client_id = 'server_test'
collection = db[job_target]
print collection

## only be used for fresh insert, as existing _id would cause duplicate insert and then error
def job_insert_single(job_id, job_url, job_file_path, client_id, create_date, update_date, job_status, http_status):
	job = {
		"_id":job_id, ## prevent replicated valued add in
		"job_url":job_url,
		"job_file_path": job_file_path,
		"client_id": client_id,
		"create_date": create_date,
		"update_date": update_date,
		"job_status": job_status,
		"http_status": http_status
	}
	j_id = collection.insert(job)
	print j_id

def job_insert_bulk(jobs):
	j_ids = collection.insert(jobs)

## it will not create collection if it is not exist
def job_update(job_id, job_url, job_file_path, client_id, create_date, update_date, job_status, http_status):
	job = {
		"job_url":job_url,
		"job_file_path": job_file_path,
		"client_id": client_id,
		"create_date": create_date,
		"update_date": update_date,
		"job_status": job_status,
		"http_status": http_status

	}
	j = collection.update({'_id':client_id}, {"$set":job}, upset=True)
	print j

## same as _update method, but would create collection if it is not exist
def job_save(job_id, job_url, job_file_path, client_id, create_date, update_date, job_status, http_status):
	job = {
		"_id":job_id, ## prevent replicated valued add in
		"job_url":job_url,
		"job_file_path": job_file_path,
		"client_id": client_id,
		"create_date": create_date,
		"update_date": update_date,
		"job_status": job_status, 
		"http_status": http_status
	}
	j = collection.save(job)
	#print j

def job_insert_single_demo():
	client_id = 'server_test'
	for i in range(1, 5):
		job_id = i
		job_url = 'http://'+str(i)
		job_file_path = '../data_row/'+str(i)
		client_id = client_id
		create_date = str(datetime.now())
		update_date = str(datetime.now())
		job_status = 1
		http_status = -1
		job_update(job_id, job_url, job_file_path, client_id, create_date, update_date, job_status, http_status)

def job_insert_bulk_demo():
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
		job_save(job_id, job_url, job_file_path, client_id, create_date, update_date, job_status, http_status)
		#print app_id
		i = i + 1
		if i > t + 10000:
			print t,
			t = t + 10000
		r = c.fetchone()
	print i

if __name__ == "__main__":
	#job_insert_single_demo()
	job_insert_bulk_demo()
	print 'done'
	



