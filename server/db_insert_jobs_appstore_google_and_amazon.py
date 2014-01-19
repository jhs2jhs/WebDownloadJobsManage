###### configuration start  ########
job_target = 'appid_asin_pairs'
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

def get_pairs(file_source):
    print "## get_appid_asin_pairs"
    pairs = {}
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
        app_id = ls[0].strip()
        asin = ls[1].strip()
        #print app_id, asin
        if not pairs.has_key(asin): # we have to choose company_name, as company_name is the only way to identify
            pairs[asin] = app_id
    f.close()
    print len(pairs)
    return pairs

def get_asins_urls(pairs):
    print "## get_asins_urls"
    asins_urls = {}
    conn = sqlite3.connect('./amazon_ec2.db')
    c = conn.cursor()
    c.execute('SELECT app_asin, app_url, read_status FROM app_web_download')
    rs = c.fetchall()
    i = 0
    for r in rs:
        asin = r[0].strip()
        url = r[1].strip()
        read_status = r[2]
        if pairs.has_key(asin):
            asins_urls[asin] = url
        else:
            #print asin, read_status, url
            i = i +1
    print len(asins_urls), i
    return asins_urls

def check_appid(pairs, asins_urls):
    print "## check_appid"
    i = 0
    for asin in pairs:
        if not asins_urls.has_key(asin):
            print asin, pairs[asin]
            i = i +1
    print i


def make_job_appid(app_id, asin):
    job_id = 'appid_%s'%(app_id)
    params = urllib.urlencode({
        'id':app_id
        })
    job_url_base = "https://play.google.com/store/apps/details"
    job_url = '%s?%s'%(job_url_base, params)
    job_file_path = '/web_jobs/%s-appid/%s.html'%(job_target, job_id)
    client_id = 'db_insert_row.py'
    create_date = str(datetime.datetime.now())
    update_date = str(datetime.datetime.now())
    job_status = 1
    http_status = -1
    job = myinsert.make_job(job_id, job_url, job_file_path, client_id, create_date, update_date, job_status, http_status)
    return job

def make_job_asin(asin, app_id, asin_url):
    job_id = 'asin_%s'%(asin)
    job_url = asin_url
    job_file_path = '/web_jobs/%s-asin/%s.html'%(job_target, job_id)
    client_id = 'db_insert_row.py'
    create_date = str(datetime.datetime.now())
    update_date = str(datetime.datetime.now())
    job_status = 1
    http_status = -1
    job = myinsert.make_job(job_id, job_url, job_file_path, client_id, create_date, update_date, job_status, http_status)
    return job


def get_jobs(pairs, asins_urls):
    jobs = []
    i = 0;
    for asin in pairs:
        app_id = pairs[asin]
        if not asins_urls.has_key(asin):
            print asin, pairs[asin]
            continue
        asin_url = asins_urls[asin]
        job_appid = make_job_appid(app_id, asin)
        jobs.append(job_appid)
        job_asin = make_job_asin(asin, app_id, asin_url)
        jobs.append(job_asin)
        #print job_asin
        #print job_appid
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
'''
if __name__ == "__main__":
    fi = "./appid_to_asin_pairs.txt"
    pairs = get_pairs(fi)
    asins_urls = get_asins_urls(pairs)
    #check_appid(pairs, asins_urls)
    jobs = get_jobs(pairs, asins_urls)
'''

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
        fi = "./appid_to_asin_pairs.txt"
        pairs = get_pairs(fi)
        asins_urls = get_asins_urls(pairs)
        jobs = get_jobs(pairs, asins_urls)
        job_mongodb(jobs, cmds[1])
        print 'done'



	



