from bs4 import BeautifulSoup, Comment

def parse_appid_to_asin(p):
	soup = BeautifulSoup(open(p).read(), 'html.parser')
	print soup