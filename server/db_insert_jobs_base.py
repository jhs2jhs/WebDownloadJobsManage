from pymongo import MongoClient
import pymongo
from datetime import datetime

mongodb_url = 'mongodb://127.0.0.1:27017/'
client = MongoClient(mongodb_url)
db = client['web_jobs_server']
print "** DB Collections: ", db.collection_names()

#collection = db[job_target]
#print collection


def make_job(job_id, job_url, job_file_path, client_id, create_date, update_date, job_status, http_status):
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
	return job

## insert: only be used for fresh insert, as existing _id would cause duplicate insert and then error
## save: same as _update method, but would create collection if it is not exist
## consider with ejdb does not support custom _id, so I have to use upsert 
def job_upsert(job, collection):
	j = db[collection].update({'job_id': job['job_id']}, {'$set':job}, upsert=True, multi=True)
	print j

def job_insert(job, collection):
	try:
		j = db[collection].insert(job)
	except pymongo.errors.DuplicateKeyError as e:
		#print e
		pass
	except Exception as e:
		#print e
		pass
