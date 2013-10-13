var myconfig = require('./CONFIG.js');
var myutil = require('./myutil.js')
var sprintf = require('util').format;
var nodemailer = require("nodemailer");
var prettyjson = require('prettyjson');

// dump the database as well. 

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: myconfig.mail_opts.smtp_server_user,
        pass: myconfig.mail_opts.smtp_server_pass
    }
});

function send_email(subject, text, body, callback){
    var mailOptions = {
	from: myconfig.mail_opts.from_email, // sender address
	to: myconfig.mail_opts.to_email, // list of receivers
	subject: subject, // Subject line
	text: text, // plaintext body
	html: body // html body
    }
    smtpTransport.sendMail(mailOptions, function(error, response){
	if(error){
            console.log(error);
	}else{
            console.log("== Email Message sent: " + response.message);
	}

    // if you don't want to use this transport object anymore, uncomment following line
	smtpTransport.close(); // shut down the connection pool, no more messages
	callback();
    });
}

function my_test(){
    var subject = "error AmazonAppStore Scrapting";
    var text = 'no jobs, probally client is shut down';
    var body = '<p>check client if shut down<p>';
    send_email(subject, text, body, function(){});
}

function check_server_app_review() {
	var uri = myconfig.job_server_address+'/jobs_view';
	var vars = {uri:uri};
	console.log('** check_server_app_review', vars.uri)
	myutil.request_get_http(vars, check_server_app_review_resp_callback, http_connect_error);
}
function check_server_app_review_resp_callback(http_statusCode, vars, resp, body){
	if (http_statusCode != 200) {
		eventEmitter.emit('http_connect_wrong_status', vars.job_step, http_statusCode);
		return
	}
	//console.log(body);
	jobs = JSON.parse(body);
	var subject = 'Jobs Progress: '+new Date().toGMTString();
	var text = body;
	var mail_body = JSON.stringify(jobs, undefined, 2);
	mail_body = "<pre>"+mail_body+"</pre>";
	send_email(subject, text, mail_body, check_server_app_review_timeout);
}
function http_connect_error(e, vars){
	console.error(e, vars);
}

function check_server_app_review_timeout(){
	var t= 1000 * 60 * 60;
	console.log(t);
	setTimeout(check_server_app_review, t);
}


check_server_app_review();