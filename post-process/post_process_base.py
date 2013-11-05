import os
from datetime import datetime

p_root = '../../data_row/web_jobs'

def loop_dir(job_target, parse_html):
	print "** start %s **"%(job_target)
	p = p_root+'/'+job_target
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
		parse_html(realpath, job_id, job_target, k, t)
	print "** end %s **"%(job_target)