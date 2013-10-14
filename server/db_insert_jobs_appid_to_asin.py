###### configuration start  ########
job_target = 'appid_to_asin'
client_id = 'server_test'
###### configuration finish ########
import sqlite3
import db_insert_jobs_base as myinsert
from datetime import datetime
import sys

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
def job_mongodb(option):
	conn = sqlite3.connect('./amazon_ec2.db')
	c = conn.cursor()
	c.execute('SELECT app_id FROM appid_to_asin_download') ## for testing
	r = c.fetchone()
	i = 0
	t = 0
	jobs = []
	while r != None:
		job = make_job(r)
		if option == 'upsert_each':
			myinsert.job_upsert(job, job_target)
		elif option == 'insert_each':
			myinsert.job_insert(job, job_target)
		elif option == 'insert_bulk':
			jobs.append(job)
		i = i + 1
		if not(option == 'insert_bulk'):
			print i,
		if i > t + 1000:
			t = t + 1000
			print t
			if option == 'insert_bulk':
				myinsert.job_insert(jobs, job_target);
				jobs = []
		r = c.fetchone()
	print i
###### custom function end, need to modify according to real case

if __name__ == "__main__":
	print "CMD: format: python db_insert_jobs_appid_to_asin.py [upsert_each | insert_each | insert_bulk]"
	cmds = sys.argv
	print len(cmds)
	print cmds[1]
	if len(cmds) != 2:
		print "ERROR: please follow the CMD format"
		print "CMD: please try again"
	elif (cmds[1] != 'upsert_each' and cmds[1] != 'insert_each' and cmds[1] != 'insert_bulk'):
		print "ERROR: please follow the CMD format", cmds
		print "CMD: please try again"
	else :
		print "start"
		job_mongodb(cmds[1])
		print 'done'
	



