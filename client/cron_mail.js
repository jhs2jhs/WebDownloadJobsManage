var myconfig = require('./CONFIG.js');
var myutil = require('./myutil.js')
var sprintf = require('util').format;
var nodemailer = require("nodemailer");

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
	var 
}

my_test();