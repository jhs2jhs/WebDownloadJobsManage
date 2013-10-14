###### configuration start  ########
job_target = 'appid_to_asin'
client_id = 'server_test'
###### configuration finish ########
import sqlite3
import db_insert_jobs_base as myinsert
from datetime import datetime

bulk_insert = True

def make_job(r):
	app_id = r[0]
	job_id = app_id
	job_url = 'http://www.amazon.com/gp/mas/dl/android?p='+app_id ##+'/'  ## do not forge to add / in the end
	job_file_path = '../../data_row/web_jobs/%s/%s.html'%(job_target, app_id)
	client_id = 'db_insert_row.py'
	create_date = str(datetime.now())
	update_date = str(datetime.now())
	job_status = 1
	http_status = -1
	job = myinsert.make_job(job_id, job_url, job_file_path, client_id, create_date, update_date, job_status, http_status)
	return job

###### custom function start, need to modify according to real case
def job_upsert_each():
	conn = sqlite3.connect('./amazon_ec2.db')
	c = conn.cursor()
	c.execute('SELECT app_id FROM appid_to_asin_download') ## for testing
	r = c.fetchone()
	i = 0
	t = 0
	while r != None:
		job = make_job(r)
		i = i + 1
		print i,
		if i > t + 1000:
			t = t + 1000
			print t
		myinsert.job_upsert(job)
		r = c.fetchone()
	print i
###### custom function end, need to modify according to real case

###### custom function start, need to modify according to real case
def job_insert_each():
	conn = sqlite3.connect('./amazon_ec2.db')
	c = conn.cursor()
	c.execute('SELECT app_id FROM appid_to_asin_download') ## for testing
	r = c.fetchone()
	i = 0
	t = 0
	while r != None:
		job = make_job(r)
		i = i + 1
		print i,
		if i > t + 1000:
			t = t + 1000
		job = myinsert.make_job(job_id, job_url, job_file_path, client_id, create_date, update_date, job_status, http_status)
		myinsert.job_insert(job)
		r = c.fetchone()
	print i
###### custom function end, need to modify according to real case

###### custom function start, need to modify according to real case
def job_insert_bulk():
	conn = sqlite3.connect('./amazon_ec2.db')
	c = conn.cursor()
	c.execute('SELECT app_id FROM appid_to_asin_download') ## for testing
	r = c.fetchone()
	i = 0
	t = 0
	jobs = []
	while r != None:
		#print r
		job = make_job(r)
		jobs.append(job)
		i = i + 1
		#print i,
		if i > t + 1000:
			t = t + 1000
			myinsert.job_insert(jobs);
			print t
			jobs = []
		r = c.fetchone()
	print i
###### custom function end, need to modify according to real case



if __name__ == "__main__":
	print "start"
	job_insert_bulk()
	print 'done'
	



