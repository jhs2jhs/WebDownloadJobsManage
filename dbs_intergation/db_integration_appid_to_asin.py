import sqlite3
import myutil
import os

job_target = 'appid_to_asin'
sql_init = '''
CREATE TABLE IF NOT EXISTS post_appid_to_asin (
	app_id TEXT NOT NULL UNIQUE,
	asin TEXT NOT NULL UNIQUE
);
'''

db = myutil.db_get(job_target)
myutil.db_init(db, sql_init)

def loop():
	p = '.'
	f_lists = os.listdir(p)
	for f_list in f_lists:
		f_fullpath = os.path.join(p, f_list)
		realpath = os.path.realpath(f_fullpath)
		fileName, fileExtension = os.path.splitext(f_list)
		if fileExtension != '.db':
			continue
		if f_list.find('integration') > -1:
			continue
		if f_list.find(job_target) > -1:
			print '** ', f_list
			db1 = sqlite3.connect(f_list)
			db_integration(db, db1)
		
def db_integration(db, db1):
	c = db.cursor()
	c1 = db1.cursor()
	c1.execute('SELECT app_id, asin FROM post_appid_to_asin')
	i = 0
	i_i = 0
	r1 = c1.fetchone()
	while r1:
		app_id = r1[0]
		asin = r1[1]
		c.execute('INSERT OR IGNORE INTO post_appid_to_asin (app_id, asin) VALUES (?,?)', (app_id, asin))
		i = i + 1
		if (i > i_i):
			i_i = i_i + 1000
			print i,
			db.commit()
		r1 = c1.fetchone()
	print i
	db.commit()
	c1.close()
	c.close()


if __name__ == "__main__":
	loop()


