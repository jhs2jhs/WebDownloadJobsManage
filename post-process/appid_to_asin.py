from bs4 import BeautifulSoup, Comment
import post_process_base as my_process

def parse_html(p, job_id, job_target, k, t):
	soup = BeautifulSoup(open(p).read(), 'html.parser')
	bs = soup.find_all(name='b', attrs={}, text='ASIN:')
	if len(bs) != 1:
		# can not find asin
		return False
	else:
		asin = bs[0].parent.text
		asin = asin.replace('ASIN:', '').strip()
		print asin, job_id, k, t
	

def post_process():
	my_process.loop_dir('appid_to_asin', parse_html)
	# or 
	#parse_html('/Users/jianhuashao/github/data_row/web_jobs/appid_to_asin/com.rovio.angrybirdsseasons.html', 'com.rovio.angrybirdsseasons', 'appid_to_asin', 1, 1);

if __name__ == '__main__':
	post_process()
	
	