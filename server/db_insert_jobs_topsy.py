###### configuration start  ########
job_target = 'topsy_tw_username'
###### configuration finish ########
import sqlite3
import db_insert_jobs_base as myinsert
from datetime import datetime
import sys
import codecs
import os
import time
import calendar
import datetime
import urllib
import platform
client_id = platform.node()
print "## hello, ", client_id, job_target  

def get_eventwindow(file_source):
    print "## get_eventwindow"
    event_windows = {}
    f = codecs.open(file_source, mode='r', encoding='utf-8')
    #c = conn.cursor()
    i = 0
    while 1:
        line = f.readline()
        i = i + 1
        if not line:
            break
        if i <= 2:
            continue
        line = line.strip()
        ls = line.split('\t')
        rank = ls[0].strip()
        company_name = ls[1].strip().lower()
        date_quator = ls[2].strip()
        announce_date = ls[4].strip()
        event_date = ls[5].strip()
        event_date_index = ls[6].strip()
        abnormal_return = ls[7].strip()
        #print rank, company_name,  announce_date, event_date, event_date_index
        if not event_windows.has_key(company_name): # we have to choose company_name, as company_name is the only way to identify
            event_windows[company_name] = {}
            event_windows[company_name]['rank'] = rank
            event_windows[company_name]['announce_date'] = {}
        if not event_windows[company_name]['announce_date'].has_key(announce_date):
            event_windows[company_name]['announce_date'][announce_date] = {}
        if not event_windows[company_name]['announce_date'][announce_date].has_key(event_date):
            event_windows[company_name]['announce_date'][announce_date][event_date] = {}
            event_windows[company_name]['announce_date'][announce_date][event_date]['event_date_index'] = event_date_index
    f.close()
    return event_windows

def get_tw_ids(event_windows, file_source):
    print "## get_tw_ids"
    f = codecs.open(file_source, mode='r', encoding='utf-8')
    i = 0
    while 1:
        line = f.readline()
        i = i + 1
        if not line:
            break
        if i <= 1:
            continue
        line = line.strip()
        ls = line.split('\t')
        if len(ls) == 1:
        	continue
        company_name = ls[0].strip().lower()
        tw_usernames = ls[1]
        if tw_usernames.strip() == "-":
            continue
        tw_usernames = tw_usernames.split(',');
        for tw_username in tw_usernames:
            tw_username = tw_username.replace('"', '').strip()
            if not event_windows.has_key(company_name):
                #print company_name ## do not know why cindy's file got two more company extra
                continue
                #event_windows[company_name] = {}
            if not event_windows[company_name].has_key('tw_usernames'):
                event_windows[company_name]['tw_usernames'] = {}
            if not event_windows[company_name]['tw_usernames'].has_key(tw_username):
                event_windows[company_name]['tw_usernames'][tw_username] = {}
    f.close()
    #print len(event_windows)
    return event_windows

def get_timestamp(s):
    d_s = datetime.datetime.strptime(s, '%d-%b-%y')
    td = datetime.timedelta(days=1)
    d_n = d_s+td
    t_d_s = calendar.timegm(d_s.utctimetuple())
    t_d_n = calendar.timegm(d_n.utctimetuple())
    return t_d_s, t_d_n

def make_job(s, tw_username, t_d_s, t_d_n):
    job_id = s
    params = urllib.urlencode({
        'q':'from:%s'%tw_username,
        'type':'tweet',
        'mintime':t_d_s,
        'maxtime':t_d_n,
        'perpage':100,
        'page': 1,
        'apikey': '09C43A9B270A470B8EB8F2946A9369F3'
        })
    job_url_base = "http://otter.topsy.com/search.json"
    job_url = '%s?%s'%(job_url_base, params)
    job_file_path = '/web_jobs/%s/%s.html'%(job_target, job_id)
    client_id = 'db_insert_row.py'
    create_date = str(datetime.datetime.now())
    update_date = str(datetime.datetime.now())
    job_status = 1
    http_status = -1
    job = myinsert.make_job(job_id, job_url, job_file_path, client_id, create_date, update_date, job_status, http_status)
    return job

def get_jobs(event_windows):
    jobs = []
    for company_name in event_windows:
        rank = event_windows[company_name]['rank']
        if (event_windows[company_name].has_key('tw_usernames')):
            for tw_username in event_windows[company_name]['tw_usernames']:
                for announce_date in event_windows[company_name]['announce_date']:
                    for event_date in event_windows[company_name]['announce_date'][announce_date]:
                        event_date_index = event_windows[company_name]['announce_date'][announce_date][event_date]['event_date_index']
                        t_d_s, t_d_n = get_timestamp(event_date)
                        s = '0=%s=%s=%s=%s=%s=%s=%s=%s'%(rank, company_name, tw_username, announce_date, event_date, event_date_index, str(t_d_s), str(t_d_n))
                        #print s
                        ls = s.split('=')
                        if not (len(ls) == 9):
                            print ls, s
                        job = make_job(s, tw_username, t_d_s, t_d_n)
                        jobs.append(job)
    print 'jobs.len: ', len(jobs)
    return jobs


###### custom function start, need to modify according to real case
def job_mongodb(jobs, option):
    print 'jobs.len: ', len(jobs)
    i = 0
    t = 0
    jobs_sub = []
    for job in jobs:
        #print job
        if option == 'upsert_each':
            myinsert.job_upsert(job, job_target)
        elif option == 'insert_each':
            myinsert.job_insert(job, job_target)
        elif option == 'insert_bulk':
            jobs_sub.append(job)
        i = i + 1
        #print i
        if not(option == 'insert_bulk'):
            print i,
        if i > t + 1000:
            t = t + 1000
            print t
            if option == 'insert_bulk':
                myinsert.job_insert(jobs_sub, job_target);
                jobs_sub = []
    print i
###### custom function end, need to modify according to real case

if __name__ == "__main__":
	print "CMD: format: python db_insert_jobs_appid_to_asin.py [upsert_each | insert_each | insert_bulk]"
	cmds = sys.argv
	print len(cmds)
	print cmds
	if len(cmds) != 2:
		print "ERROR: please follow the CMD format"
		print "CMD: please try again"
	elif (cmds[1] != 'upsert_each' and cmds[1] != 'insert_each' and cmds[1] != 'insert_bulk'):
		print "ERROR: please follow the CMD format", cmds
		print "CMD: please try again"
	else :
		print "start"
        fi = "./ting_eventwindow.txt"
        event_windows = get_eventwindow(fi)
        event_windows = get_tw_ids(event_windows, './Fortune100 Twitter IDs.txt')
        jobs = get_jobs(event_windows)
        job_mongodb(jobs, cmds[1])
        print 'done'


	



