from pymongo import MongoClient
from datetime import datetime

mongodb_url = 'mongodb://127.0.0.1:27017/'
client = MongoClient(mongodb_url)
db = client['web_jobs']
print "** DB Collections: ", db.collection_names()

collection = db['jobs_settings']
print collection

job_settings = [
	{'job_target':'appid_to_asin', 'settings_key':'web_access_interval', 'settings_value':'5000'},
	{'job_target':'appid_to_asin', 'settings_key':'client_job_request_count', 'settings_value':'10'}
]

def job_settings_init():
	for job in job_settings:
		job_target = job['job_target']
		settings_key = job['settings_key']
		settings_value = job['settings_value']
		create_date = str(datetime.now())
		update_date = str(datetime.now())
		job_setting_upsert(job_target, settings_key, settings_value, create_date, update_date)
		print "setting: ", job_target, settings_key, settings_value


## insert: only be used for fresh insert, as existing _id would cause duplicate insert and then error
## save: same as _update method, but would create collection if it is not exist
## consider with ejdb does not support custom _id, so I have to use upsert 
def job_setting_upsert(job_target, settings_key, settings_value, create_date, update_date):
	job = {
		"job_target": job_target,
		"settings_key":settings_key,
		"settings_value": settings_value,
		"create_date": create_date,
		"update_date": update_date
	}
	j = db.jobs_settings.update({'job_target': job_target, 'settings_key': settings_key, }, {'$set':job}, upsert=True, multi=True)
	print j


if __name__ == "__main__":
	print "start"
	job_settings_init()
	print 'done'