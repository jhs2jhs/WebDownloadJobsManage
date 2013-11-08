import google_drive_base
import sys
sys.path.append('./google_drive')
from apiclient.http import MediaFileUpload
from datetime import datetime
import CONFIG
import pprint
import os




def download_all():
  service = google_drive_base.get_gservice_drive()
  if service == False:
    return
  folder_id = retrieve_fileid(service, CONFIG.folder_name)
  if folder_id == False:
    return
  result = []
  q = '%s in parents'%folder_id
  param = {}
  param['q'] = q
  files = service.files().list(**param).execute()
  pprint.pprint(files)


def upload_file(file_name):
  service = google_drive_base.get_gservice_drive()
  if service == False:
    return
  folder_id = get_folderid(service)
  file_id = get_fileid(service, file_name, folder_id)

def download_job(job_target):
  service = google_drive_base.get_gservice_drive()
  if service == False:
    return
  folder_id = get_folderid(service)
  file_name = '%s_%s.db'%(CONFIG.client_id, job_target)
  files = retrieve_file(service, file_name)
  pprint.pprint(files)
  if files == False or len(files) == 0:
    return
  download_url = files['items'][0].get('downloadUrl')
  print download_url
  if download_url:
    resp, content = service._http.request(download_url)
    if resp.status == 200:
      print 'Status: %s'%resp
      print content
    else:
      print 'an error occurred: %s'%resp
  else:
    return None


def retrieve_file(service, file_name):
  result = []
  q = 'title = "%s"'%file_name
  try:
    param = {}
    param['q'] = q
    files = service.files().list(**param).execute()
    return files
  except errors.httpError, error:
    print 'An error occurred: %s' % error
    return files




###
def get_fileid(service, file_name, folder_id):
  file_id = retrieve_fileid(service, file_name)
  media_body = MediaFileUpload(file_name, mimetype='text/plain', resumable=True)
  body = {
    'title':file_name,
    'description': CONFIG.folder_name,
    'mimeType': 'text/plain',
    'parents':[{'id':folder_id}]
  }
  if file_id == False:
    f = service.files().insert(body=body, media_body=media_body).execute()
    file_id = f['id']
    print "** create new file **", file_id, file_name
  else:
    f = service.files().update(fileId=file_id, newRevision= datetime.now(), body=body, media_body=media_body).execute()
    file_id = f['id']
    print "** update file **", file_id, file_name
  return file_id

def get_folderid(service):
  fold_id = retrieve_fileid(service, CONFIG.folder_name)
  if fold_id == False:
    body = {
      'title':CONFIG.folder_name,
      'mimeType': 'application/vnd.google-apps.folder'  ## mimeType has to be captial 
    }
    folder = service.files().insert(body=body).execute()
    fold_id = folder['id']
    print "** create new fold **"
    #pprint.pprint(folder)
  print "** folder_id", fold_id, CONFIG.folder_name
  return fold_id
  

def retrieve_fileid(service, file_name):
  result = []
  q = 'title = "%s"'%file_name
  try:
    param = {}
    param['q'] = q
    files = service.files().list(**param).execute()
    #pprint.pprint(files)
    result.extend(files['items'])
  except errors.HttpError, error:
    print 'An error occurred: %s' % error
  if len(result) > 0:
    id = result[0]['id']
    return id
  else:
    return False


# For more information on the Drive API you can visit:
#
#   https://developers.google.com/drive/
#
# For more information on the Drive API Python library surface you
# can visit:
#
#   https://developers.google.com/resources/api-libraries/documentation/drive/v2/python/latest/
#
# For information on the Python Client Library visit:
#
#   https://developers.google.com/api-client-library/python/start/get_started
if __name__ == '__main__':
  upload_type = raw_input("** choose from [all, file, job]: ")
  upload_type = upload_type.lower().strip()
  if upload_type == 'all':
    download_all()
  elif upload_type == 'file':
    file_name = raw_input('** type your filename: ')
    file_name = file_name.lower().strip()
    upload_file(file_name)
  elif upload_type == 'job':
    job_target = raw_input('** type your job_target: ')
    job_target = job_target.lower().strip()
    download_job(job_target)
  else:
    print "** wrong argument"
