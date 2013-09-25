
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

def job_insert_single(job_id, job_url, job_file_path, client_id, create_date, update_date, job_status):
	job = {
		"_id":job_id,
		"job_url":job_url,
		"job_file_path": job_file_path,
		"client_id": client_id,
		"create_date": create_date,
		"update_date": update_date,
		"job_status": job_status
	}
	j_id = collection.insert(job)
	print j_id

def job_insert_bulk(jobs):
	j_ids = collection.insert(jobs)

def job_update(job_id, job_url, job_file_path, client_id, create_date, update_date, job_status):
	job = {
		"job_url":job_url,
		"job_file_path": job_file_path,
		"client_id": client_id,
		"create_date": create_date,
		"update_date": update_date,
		"job_status": job_status
	}
	j = collection.update({'_id':client_id}, {"$set":job}, upset=True)
	print j

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
		#job_insert_single(job_id, job_url, job_file_path, client_id, create_date, update_date, job_status)
		job_update(job_id, job_url, job_file_path, client_id, create_date, update_date, job_status)

def job_insert_bulk_demo():
	conn = sqlite3.connect('./amazon_ec2.db')
	c = conn.cursor()
	c.execute('SELECT app_asin FROM app_review_download')
	r = c.fetchone()
	while r != None:
		asin = r[0]
		job_id = asin
		r = c.fetchone()

if __name__ == "__main__":
	job_insert_single_demo()
	



