module.exports.make_job = make_job;


function make_job(job_id, job_url, job_file_path, client_id, create_date, update_date, job_status, http_status) {
	job = {
		"job_id": job_id,
		"job_url":job_url,
		"job_file_path": job_file_path,
		"client_id": client_id,
		"create_date": create_date,
		"update_date": update_date,
		"job_status": job_status,
		"http_status": http_status
	}
	return job
}

