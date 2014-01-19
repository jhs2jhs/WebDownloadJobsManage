from bs4 import BeautifulSoup, Comment
import post_process_base as my_process
import sqlite3
import myutil

#######
job_target = 'appid_to_asin'
sql_init = '''
CREATE TABLE IF NOT EXISTS post_appid_to_asin (
	app_id TEXT NOT NULL UNIQUE,
	asin TEXT NOT NULL UNIQUE,
	asin_url TEXT, 
	UNIQUE (app_id, asin)
);
'''
sql_insert = '''
INSERT OR IGNORE INTO post_appid_to_asin (app_id, asin) VALUES (?,?)
'''
#######

# db_init
db = myutil.db_get(job_target)
myutil.db_init(db, sql_init)


def parse_html(p, job_id, job_target, k, t):
	soup = BeautifulSoup(open(p).read(), 'html.parser')
	bs = soup.find_all(name='b', attrs={}, text='ASIN:')
	if len(bs) != 1:
		# can not find asin
		return False
	else:
		asin = bs[0].parent.text
		asin = asin.replace('ASIN:', '').strip()
		a_s = soup.find_all(name='a', attrs={'id':'seeAllReviewsUrl'})
		#print 'a_s: ', a_s
		asin_url = ''
		if (len(a_s) > 0):
			a_attrs = a_s[0].attrs
			if a_attrs.has_key('href'):
				asin_url = a_attrs['href']
				asin_url = asin_url.replace('http://www.amazon.com/', '').split('/')[0]		
		c = db.cursor()
		c.execute(sql_insert, (job_id, asin)) # job_id == app_id
		db.commit()
		c.close()
		#print asin, job_id, k, t
	

def post_process():
	my_process.loop_dir(job_target, parse_html)
	# or 
	#parse_html('/Users/jianhuashao/github/data_row/web_jobs/appid_to_asin/com.rovio.angrybirdsseasons.html', 'com.rovio.angrybirdsseasons', 'appid_to_asin', 1, 1);

if __name__ == '__main__':
	post_process()
	
	