import os
import codecs
import json
import pprint
import sqlite3
import platform

fold_base = 'data_row'
#fold_base = 'test_data_row'
jobs_target = 'topsy_fortuner_tops_full'
client_id = platform.node()
print client_id

sql_init = '''
CREATE TABLE IF NOT EXISTS tweets (
	tweet_id TEXT NOT NULL UNIQUE,
	tweet_url TEXT NOT NULL,
	tw_username TEXT NOT NULL,
	tweet_firstpost_date TEXT NOT NULL,
	tweet_title TEXT NOT NULL,
	tweet_content TEXT NOT NULL,
	tweet_topsy_full TEXT NOT NULL
);
'''

def db_get():
	db = sqlite3.connect('../dbs/%s==%s.db'%(jobs_target, client_id))
	return db

def db_init(db, sql_init):
	c = db.cursor()
	c.executescript(sql_init)
	db.commit()
	c.execute('SELECT * FROM SQLITE_MASTER')
	tables = c.fetchall()
	print 'db tables: ', tables
	print '============================='
	c.close()

db = db_get()
db_init(db, sql_init)

def parse_file(p, tw_username):
	f = codecs.open(p, 'r', encoding='utf-8')
	j = json.loads(f.read())
	if not j.has_key('response'):
		return
	if not j['response'].has_key('list'):
		return
	c = db.cursor()
	for r in j['response']['list']:
		firstpost_date = r['firstpost_date']
		title = r['title']
		content = r['content']
		url = r['url']
		ls = url.split('/')
		tweet_id = ls[len(ls)-1]
		sql = 'INSERT OR IGNORE INTO tweets (tweet_id, tweet_url, tw_username, tweet_firstpost_date, tweet_title, tweet_content, tweet_topsy_full) VALUES (?,?,?,?,?,?,?)'
		c.execute(sql, (tweet_id, url, tw_username, firstpost_date, title, content, json.dumps(r)))
	db.commit()
	c.close()


def loop_dir(p):
	dir_lists = os.listdir(p)
	t = len(dir_lists)
	k = 0
	for dir_list in dir_lists:
		file_full_path = os.path.join(p, dir_list)
		t = 0
		if os.path.isdir(file_full_path):
			print '****** is dir', file_full_path
		fileName, fileExtension = os.path.splitext(dir_list)
		#print fileName, fileExtension
		if fileExtension != '.html':
			continue
		ls = fileName.strip().split('=')
		page_number = ls[0]
		company_rank = ls[1]
		company_name = ls[2]
		tw_username = ls[3]
		print page_number, company_rank, company_name, tw_username
		parse_file(file_full_path, tw_username)


if __name__ == '__main__':
	p = '../../%s/web_jobs/%s/'%(fold_base, jobs_target)
	loop_dir(p)