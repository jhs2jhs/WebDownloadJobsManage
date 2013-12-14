###### configuration start  ########
job_target = 'thingiverse'
###### configuration finish ########
import sqlite3
import db_insert_jobs_base as myinsert
from datetime import datetime
import sys
import platform
client_id = platform.node()
print "## hello, ", client_id, job_target  

def make_job(i):
	thing_id = str(i);
	job_id = 't_'+thing_id;
	job_url = 'http://www.thingiverse.com/thing:'+thing_id ##+'/'  ## do not forge to add / in the end
	job_file_path = 'web_jobs/%s/%s.html'%(job_target, job_id)
	client_id = 'db_insert_row.py'
	create_date = str(datetime.now())
	update_date = str(datetime.now())
	job_status = 1
	http_status = -1
	job = myinsert.make_job(job_id, job_url, job_file_path, client_id, create_date, update_date, job_status, http_status)
	return job

###### custom function start, need to modify according to real case
def job_mongodb(option):
	i = 0
	t = 0
	jobs = []
	while i < 200000:
		job = make_job(i)
		#print job
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
	if option == 'insert_bulk':
		myinsert.job_insert(jobs, job_target);
	print i
###### custom function end, need to modify according to real case


if __name__ == "__main__":
	print "CMD: format: python db_insert_jobs_appid_to_asin.py [upsert_each | insert_each | insert_bulk]"
	cmds = sys.argv
	print len(cmds)
	print cmds
	if len(cmds) != 2:
		print "ERROR: please follow the CMD format"
		print "CMD: please try again"
		return
	elif (cmds[1] != 'upsert_each' and cmds[1] != 'insert_each' and cmds[1] != 'insert_bulk'):
		print "ERROR: please follow the CMD format", cmds
		print "CMD: please try again"
		return
	else :
		print "start"
		job_mongodb(cmds[1])
		print 'done'
		return
	



