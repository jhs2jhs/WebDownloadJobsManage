###### configuration start  ########
job_target = 'topsy_fortuner_twibes'
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


def get_twibes_tws():
    tws = {}
    conn = sqlite3.connect('./tweet_twibes_2013.db')
    c = conn.cursor()
    c.execute('SELECT id, tw_id FROM tw ORDER BY id');
    for row in c.fetchall():
        rank = row[0]
        tw_username = row[1]
        #print rank, tw_username
        tws[rank] = tw_username
    c.close()
    return tws

def get_timestamp(s):
    d_s = datetime.datetime.strptime(s, '%d-%b-%y')
    td = datetime.timedelta(days=1)
    d_n = d_s+td
    t_d_s = calendar.timegm(d_s.utctimetuple())
    t_d_n = calendar.timegm(d_n.utctimetuple())
    return t_d_s, t_d_n

def make_job(s, tw_username, maxtime):
    job_id = s
    params = urllib.urlencode({
        'q':'from:%s'%tw_username,
        'type':'tweet',
        'perpage':100,
        'page': 1,
        'maxtime':maxtime, 
        'sort_method': 'date',
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

def get_jobs(tws):
    jobs = []
    i = 0;
    for rank in tws:
        tw_username = tws[rank]
        now = datetime.datetime.now()
        now_string = now.strftime('%d-%b-%y')
        now_timestamp = calendar.timegm(now.utctimetuple())
        s = '0=%s=%s=%s=%s0'%(rank, tw_username, now_string, now_timestamp)
        #print s
        ls = s.split('=')
        if not (len(ls) == 3):
            print ls, s
        job = make_job(s, tw_username, now_timestamp)
        jobs.append(job)
        if rank == '100':
            i = i + 1
            print s, i
            print rank, company_name, tw_username
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
        if not(option == 'insert_bulk'):
            print i,
        if i > t + 1000:
            t = t + 1000
            print t
            if option == 'insert_bulk':
                myinsert.job_insert(jobs_sub, job_target);
                jobs_sub = []
    if option == 'insert_bulk':
        myinsert.job_insert(jobs_sub, job_target);
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
        tws = get_twibes_tws()
        jobs = get_jobs(tws)
        job_mongodb(jobs, cmds[1])
        print 'done'


	



