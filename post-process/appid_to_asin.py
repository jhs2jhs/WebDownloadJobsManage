from bs4 import BeautifulSoup, Comment
import os
from datetime import datetime

def parse_html(p, job_id, k, t):
	soup = BeautifulSoup(open(p).read(), 'html.parser')
	bs = soup.find_all(name='b', attrs={}, text='ASIN:')
	if len(bs) != 1:
		# can not find asin
		return False
	else:
		asin = bs[0].parent.text
		asin = asin.replace('ASIN:', '').strip()
		print asin, job_id, k, t
	

def loop_dir(p):
	f_lists = os.listdir(p)
	t = len(f_lists)
	print t
	k = 0
	for f_list in f_lists:
		f_fullpath = os.path.join(p, f_list)
		realpath = os.path.realpath(f_fullpath)
		#print k, t, f_list, realpath, str(datetime.now())
		k = k + 1
		fileName, fileExtension = os.path.splitext(f_list)
		if fileExtension != '.html':
			continue
		job_id = fileName
		parse_html(realpath, job_id, k, t)

if __name__ == '__main__':
	print "** start **"
	loop_dir('../../data_row/web_jobs/appid_to_asin')
	parse_html('/Users/jianhuashao/github/data_row/web_jobs/appid_to_asin/com.rovio.angrybirdsseasons.html', 'com.rovio.angrybirdsseasons', 1, 1);
	print "** end **"