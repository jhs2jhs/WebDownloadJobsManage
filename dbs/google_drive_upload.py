import google_drive_base
import sys


def main(argv):
  service = google_drive_base.get_gservice_drive(argv)
  if service == False:
    return
  folder_id = get_folderid(service)
  file_id = retrieve_fileid(service, 'hello.txt')
  if file_id == False:
    media_body = MediaFileUpload('hello.txt', mimetype='text/plain', resumable=True)
    body = {
      'title':'hello.txt',
      'description': 'WebDownloadJobManager',
      'mimeType': 'text/plain',
      'parents':[{'id':fold_id}]
    }
    f = service.files().insert(body=body, media_body=media_body).execute()
    file_id = f['id']
    print "** create new file **"
  else:
    media_body = MediaFileUpload('hello.txt', mimetype='text/plain', resumable=True)
    body = {
      'title':'hello.txt',
      'description': 'WebDownloadJobManager',
      'mimeType': 'text/plain',
      'parents':[{'id':fold_id}]
    }
    f = service.files().update(fileId=file_id, newRevision= datetime.now(), body=body, media_body=media_body).execute()
    file_id = f['id']
    print "** update  file **"
  print "**", file_id
  return


def get_folderid(service):
  fold_id = retrieve_fileid(service, 'WebDownloadJobsManage')
  if fold_id == False:
    body = {
      'title':'WebDownloadJobsManage',
      'mimeType': 'application/vnd.google-apps.folder'  ## mimeType has to be captial 
    }
    folder = service.files().insert(body=body).execute()
    fold_id = folder['id']
    print "** create new fold **"
    pprint.pprint(folder)
  print "** folder_id", fold_id
  return fold_id
  

def retrieve_fileid(service, file_name):
  result = []
  q = 'title = "%s"'%file_name
  try:
    param = {}
    param['q'] = q
    files = service.files().list(**param).execute()
    print files
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
  main(sys.argv)
