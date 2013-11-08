import sqlite3

def db_get(job_target):
	print "** database %s_%s.db **"%('integration', job_target)
	db = sqlite3.connect('./%s_%s.db'%('integration', job_target))
	return db

def db_init(db, sql_init):
	c = db.cursor()
	c.executescript(sql_init)
	db.commit()
	c.execute('SELECT * FROM SQLITE_MASTER')
	tables = c.fetchall()
	print '** INTEGRATION db tables: %s **'%(str(len(tables)))
	c.close()
